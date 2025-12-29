# RAG CV System

A web-based RAG (Retrieval-Augmented Generation) system that allows users to upload their CVs and ask questions about them using AI.

## Features

- 🔐 User authentication (signup/login) with JWT
- 📄 CV upload to Cloudinary (PDF format)
- 🤖 AI-powered question answering using LangChain and HuggingFace
- 💾 PostgreSQL database for user management
- 🔍 ChromaDB vector database for semantic search
- ⚛️ Modern Next.js frontend with Tailwind CSS

## Technology Stack

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - User database
- **ChromaDB** - Vector database
- **LangChain** - RAG framework
- **HuggingFace** - LLM (Mistral-7B) and embeddings
- **Cloudinary** - PDF storage
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **Axios** - API requests

## Project Structure

```
RAG/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Configuration settings
│   ├── database.py                # Database connection
│   ├── models.py                  # SQLAlchemy models
│   ├── schemas.py                 # Pydantic schemas
│   ├── routes/
│   │   ├── auth.py               # Authentication routes
│   │   ├── cv.py                 # CV upload routes
│   │   └── chat.py               # Chat routes
│   ├── services/
│   │   ├── cloudinary_service.py # Cloudinary integration
│   │   └── rag_service.py        # RAG processing
│   ├── utils/
│   │   ├── auth.py               # Auth utilities
│   │   └── dependencies.py       # FastAPI dependencies
│   ├── requirements.txt
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── index.tsx         # Home page
    │   │   ├── login.tsx         # Login page
    │   │   ├── signup.tsx        # Signup page
    │   │   ├── dashboard.tsx     # Dashboard
    │   │   ├── upload.tsx        # CV upload page
    │   │   └── chat.tsx          # Chat interface
    │   ├── contexts/
    │   │   └── AuthContext.tsx   # Authentication context
    │   ├── lib/
    │   │   └── api.ts            # API client
    │   └── styles/
    │       └── globals.css       # Global styles
    ├── package.json
    └── .env.example
```

## Setup Instructions

### Prerequisites

- Python 3.9+
- Node.js 18+
- PostgreSQL
- HuggingFace API key
- Cloudinary account

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Create a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

4. Create a `.env` file from `.env.example`:
   ```bash
   cp .env.example .env
   ```

5. Configure the `.env` file:
   - Set `DATABASE_URL` to your PostgreSQL connection string
   - Generate a secure `SECRET_KEY` (you can use: `openssl rand -hex 32`)
   - Add your Cloudinary credentials
   - Add your HuggingFace API key

6. Create the PostgreSQL database:
   ```sql
   CREATE DATABASE rag_cv_db;
   ```

7. Run the FastAPI server:
   ```bash
   python main.py
   ```

   Or with uvicorn:
   ```bash
   uvicorn main:app --reload
   ```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env.local` file from `.env.example`:
   ```bash
   cp .env.example .env.local
   ```

4. Update the API URL if needed (default: `http://localhost:8000`)

5. Run the development server:
   ```bash
   npm run dev
   ```

The frontend will be available at `http://localhost:3000`

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Login**: Log in with your credentials
3. **Upload CV**: Upload your CV as a PDF file (it will be processed automatically)
4. **Chat**: Ask questions about your CV once processing is complete

### Example Questions

- "What is my work experience?"
- "What skills do I have?"
- "What is my education background?"
- "What projects have I worked on?"
- "Summarize my CV"

## RAG Pipeline

The system uses the exact RAG pipeline from your Jupyter notebook:

1. **Document Loading**: PDF is loaded using `PyPDFLoader`
2. **Text Splitting**: Documents are chunked using `RecursiveCharacterTextSplitter` (chunk_size=400, chunk_overlap=50)
3. **Embeddings**: Uses `sentence-transformers/all-mpnet-base-v2` for embeddings
4. **Vector Store**: ChromaDB stores the embeddings
5. **LLM**: Mistral-7B-v0.1 for text generation
6. **Prompt Template**: Uses your exact template:
   ```
   Answer this question using the provided context only.

   {question}

   Context:
   {context}

   Answer:
   ```

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user
- `POST /api/auth/login` - Login user

### CV Management
- `GET /api/cv/status` - Check CV upload status
- `POST /api/cv/upload` - Upload CV (multipart/form-data)
- `DELETE /api/cv/delete` - Delete CV

### Chat
- `POST /api/chat/ask` - Ask a question about the CV

## Environment Variables

### Backend (.env)
```
DATABASE_URL=postgresql://username:password@localhost:5432/rag_cv_db
SECRET_KEY=your-secret-key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
HUGGINGFACE_API_KEY=your_huggingface_api_key
CHROMA_PERSIST_DIRECTORY=./chroma_db
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=http://localhost:8000
```

## Important Notes

- **Large Model**: The Mistral-7B model requires significant GPU memory (at least 16GB VRAM). Consider using a smaller model or API-based inference if you don't have sufficient hardware.
- **Processing Time**: CV processing happens in the background and may take 1-2 minutes depending on the CV size and hardware.
- **Security**: Change the `SECRET_KEY` in production and use HTTPS.
- **Database**: Make sure PostgreSQL is running before starting the backend.

## Troubleshooting

### Backend Issues

1. **Database Connection Error**: Ensure PostgreSQL is running and the connection string is correct
2. **HuggingFace Model Loading**: Requires GPU and significant VRAM. Consider using CPU or smaller models for testing
3. **Cloudinary Upload Fails**: Verify your Cloudinary credentials

### Frontend Issues

1. **API Connection Error**: Ensure the backend is running on the specified port
2. **Login/Signup Fails**: Check browser console for detailed error messages
3. **CORS Errors**: The backend is configured to allow localhost:3000. Update if using a different port.

## Production Deployment

For production deployment:

1. Set `SECRET_KEY` to a strong random value
2. Use HTTPS for both frontend and backend
3. Set proper CORS origins in the backend
4. Use environment-specific configuration
5. Consider using a GPU-enabled server for the LLM
6. Set up proper database backups
7. Use a CDN for the frontend
8. Implement rate limiting and request validation

## License

This project is for educational purposes.
