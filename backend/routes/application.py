from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, CV
from schemas import ApplicationRequest, CoverLetterResponse, EmailResponse
from utils.dependencies import get_current_user
from services.rag_service import rag_service
from typing import Union

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
        
        # Return appropriate response based on type
        if request.application_type == "cover_letter":
            return CoverLetterResponse(**result)
        else:  # email
            return EmailResponse(**result)
            
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating application: {str(e)}"
        )
