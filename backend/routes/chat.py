from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, CV
from schemas import ChatRequest, ChatResponse
from utils.dependencies import get_current_user
from services.rag_service import rag_service

router = APIRouter()

@router.post("/ask", response_model=ChatResponse)
def ask_question(
    chat_request: ChatRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Ask a question about the user's CV"""
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
        # Query using RAG service
        answer = rag_service.query_cv(current_user.id, chat_request.question)
        
        return ChatResponse(
            question=chat_request.question,
            answer=answer
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )
