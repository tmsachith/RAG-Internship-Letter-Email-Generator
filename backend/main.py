from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routes import auth, cv, chat, application
from database import engine, Base

# Create database tables (disabled for production, use Alembic or manual migration)
# Base.metadata.create_all(bind=engine)

app = FastAPI(title="RAG CV System API")

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Next.js frontend
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(cv.router, prefix="/api/cv", tags=["CV Management"])
app.include_router(chat.router, prefix="/api/chat", tags=["Chat"])
app.include_router(application.router, prefix="/api/application", tags=["Application Generation"])

@app.get("/")
def read_root():
    return {"message": "RAG CV System API is running"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
