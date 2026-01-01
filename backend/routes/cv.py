from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, BackgroundTasks
from sqlalchemy.orm import Session
from database import get_db
from models import User, CV
from schemas import CVResponse
from utils.dependencies import get_current_user
from services.cloudinary_service import upload_pdf_to_cloudinary, delete_pdf_from_cloudinary
from services.rag_service import rag_service
import uuid

router = APIRouter()

@router.get("/status", response_model=dict)
def get_cv_status(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Check if user has uploaded a CV"""
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    if cv:
        return {
            "has_cv": True,
            "cv": CVResponse(
                id=cv.id,
                filename=cv.filename,
                cloudinary_url=cv.cloudinary_url,
                uploaded_at=cv.uploaded_at,
                processed=cv.processed
            )
        }
    return {"has_cv": False}

@router.post("/upload", response_model=CVResponse)
async def upload_cv(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Upload CV to Cloudinary and process it"""
    # Validate file type
    if not file.filename.endswith('.pdf'):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are allowed"
        )
    
    # Check if user already has a CV
    existing_cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    if existing_cv:
        # Delete old CV from Cloudinary
        delete_pdf_from_cloudinary(existing_cv.cloudinary_public_id)
        db.delete(existing_cv)
        db.commit()
    
    # Read file content
    file_content = await file.read()
    
    # Generate unique filename
    unique_filename = f"{current_user.id}_{uuid.uuid4().hex}"
    
    # Upload to Cloudinary
    upload_result = upload_pdf_to_cloudinary(file_content, unique_filename)
    
    # Save CV record to database
    new_cv = CV(
        user_id=current_user.id,
        cloudinary_url=upload_result["url"],
        cloudinary_public_id=upload_result["public_id"],
        filename=file.filename,
        processed=False
    )
    
    db.add(new_cv)
    db.commit()
    db.refresh(new_cv)
    
    # Process CV in background (chunking and storing in ChromaDB)
    background_tasks.add_task(
        process_cv_background, 
        new_cv.id, 
        current_user.id, 
        upload_result["url"]
    )
    
    return CVResponse(
        id=new_cv.id,
        filename=new_cv.filename,
        cloudinary_url=new_cv.cloudinary_url,
        uploaded_at=new_cv.uploaded_at,
        processed=new_cv.processed
    )

def process_cv_background(cv_id: int, user_id: int, pdf_url: str):
    """Background task to process CV"""
    from database import SessionLocal
    
    try:
        # Process CV with RAG service
        rag_service.process_cv(user_id, pdf_url)
        
        # Update CV as processed
        db = SessionLocal()
        cv = db.query(CV).filter(CV.id == cv_id).first()
        if cv:
            cv.processed = True
            db.commit()
            
            # Delete PDF from Cloudinary after successful processing
            try:
                delete_pdf_from_cloudinary(cv.cloudinary_public_id)
                print(f"Deleted PDF from Cloudinary for user {user_id}")
            except Exception as e:
                print(f"Warning: Could not delete PDF from Cloudinary: {str(e)}")
        db.close()
    except Exception as e:
        print(f"Error processing CV: {str(e)}")

@router.delete("/delete")
def delete_cv(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete user's CV"""
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="CV not found"
        )
    
    # Delete from Cloudinary
    delete_pdf_from_cloudinary(cv.cloudinary_public_id)
    
    # Delete from database
    db.delete(cv)
    db.commit()
    
    return {"message": "CV deleted successfully"}
