"""
Script to create new database tables for chat and application history
"""
from database import engine, Base
from models import User, CV, ChatMessage, Application

def create_tables():
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("Tables created successfully!")
    print("- users")
    print("- cvs")
    print("- chat_messages (new)")
    print("- applications (new)")

if __name__ == "__main__":
    create_tables()
