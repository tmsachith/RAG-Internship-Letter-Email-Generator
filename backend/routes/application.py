from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, CV, Application
from schemas import ApplicationRequest, CoverLetterResponse, EmailResponse, ApplicationHistoryResponse
from utils.dependencies import get_current_user
from services.rag_service import rag_service
from typing import Union, List

router = APIRouter()

@router.post("/generate", response_model=Union[CoverLetterResponse, EmailResponse])
def generate_application(
    request: ApplicationRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Generate a personalized cover letter or email based on CV and job description"""
    # Validate application type
    if request.application_type not in ["cover_letter", "email"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="application_type must be either 'cover_letter' or 'email'"
        )
    
    # Check if user has uploaded a CV
    cv = db.query(CV).filter(CV.user_id == current_user.id).first()
    if not cv:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Please upload your CV first"
        )
    
    # Check if CV is processed
    if not cv.processed:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Your CV is still being processed. Please try again in a moment."
        )
    
    try:
        # Generate application using RAG service
        result = rag_service.generate_application(
            current_user.id, 
            request.job_description, 
            request.application_type
        )
        
        # Save application to history
        application = Application(
            user_id=current_user.id,
            job_description=request.job_description,
            application_type=request.application_type,
            subject=result.get("subject"),
            content=result["content"]
        )
        db.add(application)
        db.commit()
        
        # Return appropriate response based on type
        if request.application_type == "cover_letter":
            return CoverLetterResponse(**result)
        else:  # email
            return EmailResponse(**result)
            
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating application: {str(e)}"
        )

@router.get("/history", response_model=List[ApplicationHistoryResponse])
def get_application_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get application history for the current user"""
    applications = db.query(Application).filter(
        Application.user_id == current_user.id
    ).order_by(Application.created_at.desc()).limit(limit).all()
    
    return applications

@router.get("/history/{application_id}", response_model=ApplicationHistoryResponse)
def get_application_detail(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific application by ID"""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    return application

@router.delete("/history/{application_id}")
def delete_application(
    application_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific application"""
    application = db.query(Application).filter(
        Application.id == application_id,
        Application.user_id == current_user.id
    ).first()
    
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    db.delete(application)
    db.commit()
    
    return {"message": "Application deleted successfully"}

@router.delete("/history")
def clear_application_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all application history for the current user"""
    db.query(Application).filter(
        Application.user_id == current_user.id
    ).delete()
    db.commit()
    
    return {"message": "Application history cleared successfully"}
