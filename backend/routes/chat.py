from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models import User, CV, ChatMessage
from schemas import ChatRequest, ChatResponse, ChatMessageResponse
from utils.dependencies import get_current_user
from services.rag_service import rag_service
from typing import List

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
        
        # Save chat message to history
        chat_message = ChatMessage(
            user_id=current_user.id,
            question=chat_request.question,
            answer=answer
        )
        db.add(chat_message)
        db.commit()
        
        return ChatResponse(
            question=chat_request.question,
            answer=answer
        )
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error processing question: {str(e)}"
        )

@router.get("/history", response_model=List[ChatMessageResponse])
def get_chat_history(
    limit: int = 50,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get chat history for the current user"""
    messages = db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).order_by(ChatMessage.created_at.desc()).limit(limit).all()
    
    # Reverse to show oldest first
    return list(reversed(messages))

@router.delete("/history/{message_id}")
def delete_chat_message(
    message_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific chat message"""
    message = db.query(ChatMessage).filter(
        ChatMessage.id == message_id,
        ChatMessage.user_id == current_user.id
    ).first()
    
    if not message:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Message not found"
        )
    
    db.delete(message)
    db.commit()
    
    return {"message": "Chat message deleted successfully"}

@router.delete("/history")
def clear_chat_history(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Clear all chat history for the current user"""
    db.query(ChatMessage).filter(
        ChatMessage.user_id == current_user.id
    ).delete()
    db.commit()
    
    return {"message": "Chat history cleared successfully"}
