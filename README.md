# RAG CV System

A web-based RAG (Retrieval-Augmented Generation) system that allows users to upload their CVs, generate cover letters/emails, and ask questions about them using AI.

## Features

- 🔐 User authentication (signup/login) with JWT
- 📄 CV upload to Cloudinary (PDF format)
- 🤖 AI-powered question answering using LangChain and HuggingFace
- 📝 Application generator (cover letter/email) with history
- 💬 Chat interface with history
- 💾 PostgreSQL database for user management and history
- 🔍 ChromaDB vector database for semantic search
- ⚛️ Modern Next.js frontend with Ant Design 6.x and Tailwind CSS

## Technology Stack

### Backend
- **FastAPI** - Python web framework
- **PostgreSQL** - User database
- **ChromaDB** - Vector database
- **LangChain** - RAG framework
- **HuggingFace** - LLM (meta-llama/Llama-3.2-3B-Instruct) and embeddings(sentence-transformers/all-mpnet-base-v2)
- **Cloudinary** - PDF storage (Delete CV after process.)
- **JWT** - Authentication

### Frontend
- **Next.js 14** - React framework
- **TypeScript** - Type safety
- **Ant Design 6.x** - UI components
- **Tailwind CSS** - Styling
- **Axios** - API requests

### Mobile App
- **React Native** - Cross-platform mobile development
- **Expo** - Development framework for React Native
- **TypeScript** - Type safety
- **React Navigation** - Navigation and routing
- **Tailwind CSS** - Styling
- **Axios** - API requests

## Project Structure

```
RAG/
├── backend/
│   ├── main.py                    # FastAPI application
│   ├── config.py                  # Configuration settings
│   ├── database.py                # Database connection
│   ├── models.py                  # SQLAlchemy models (User, CV, ChatMessage, Application)
│   ├── schemas.py                 # Pydantic schemas
│   ├── routes/
│   │   ├── auth.py               # Authentication routes
│   │   ├── cv.py                 # CV upload routes
│   │   ├── chat.py               # Chat & chat history routes
│   │   └── application.py        # Application generator & history routes
│   ├── services/
│   │   ├── cloudinary_service.py # Cloudinary integration
│   │   └── rag_service.py        # RAG processing
│   ├── utils/
│   │   ├── auth.py               # Auth utilities
│   │   └── dependencies.py       # FastAPI dependencies
│   ├── requirements.txt
│   └── .env.example
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── index.tsx         # Home page
│   │   │   ├── login.tsx         # Login page
│   │   │   ├── signup.tsx        # Signup page
│   │   │   ├── dashboard.tsx     # Dashboard
│   │   │   ├── upload.tsx        # CV upload page
│   │   │   ├── chat.tsx          # Chat interface (with history)
│   │   │   └── application.tsx   # Application generator (with history)
│   │   ├── contexts/
│   │   │   └── AuthContext.tsx   # Authentication context
│   │   ├── lib/
│   │   │   └── api.ts            # API client
│   │   └── styles/
│   │       └── globals.css       # Global styles
│   ├── package.json
│   └── .env.example
│
└── mobile/
    ├── App.tsx                   # Main application file
    ├── app.json                  # Expo configuration
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

### Mobile App Setup

1. Navigate to the mobile directory:
   ```bash
   cd mobile
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm start
   ```

4. Use the Expo Go app to scan the QR code and run the app on your device.

The mobile app provides a seamless experience for interacting with the RAG CV System on the go.

## Usage

1. **Sign Up**: Create a new account with email and password
2. **Login**: Log in with your credentials
3. **Upload CV**: Upload your CV as a PDF file (it will be processed automatically)
4. **Chat**: Ask questions about your CV once processing is complete (previous chat history is shown in the chat box)
5. **Generate Application**: Create cover letters or emails from job descriptions (previously generated applications are shown as a list below the generator)

### Example Questions

- "What is my work experience?"
- "What skills do I have?"
- "What is my education background?"
- "What projects have I worked on?"
- "Summarize my CV"

## Application & Chat History

- **Chat History**: All previous questions and answers are shown in the chat interface. You can view, copy, or delete messages.
- **Application History**: All generated cover letters/emails are listed below the generator. You can view, copy, or delete applications.

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
- `GET /api/chat/history` - Get chat history
- `DELETE /api/chat/history/{id}` - Delete chat message
- `DELETE /api/chat/history` - Clear all chat history

### Application
- `POST /api/application/generate` - Generate cover letter/email
- `GET /api/application/history` - Get application history
- `GET /api/application/history/{id}` - Get application detail
- `DELETE /api/application/history/{id}` - Delete application
- `DELETE /api/application/history` - Clear all application history

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

### Mobile App (.env)
```
REACT_NATIVE_EXPO_API_URL=http://localhost:8000
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

### Mobile App Issues

1. **Expo Go App**: Ensure you have the Expo Go app installed on your mobile device
2. **QR Code Scanning**: Make sure your development server is running and scan the correct QR code
3. **Network Issues**: Ensure your mobile device is on the same network as your development machine

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

## RAG Pipeline

The system uses a Retrieval-Augmented Generation (RAG) pipeline with the following components:

1. **Document Loading**: PDF is loaded using `PyPDFLoader`
2. **Text Splitting**: Documents are chunked using `RecursiveCharacterTextSplitter` (chunk_size=1000, chunk_overlap=200)
3. **Embeddings**: Uses HuggingFace API for `sentence-transformers/all-mpnet-base-v2` (no local model downloads)
4. **Vector Store**: ChromaDB (Jupyter) or PGVector (backend) stores the embeddings
5. **LLM**: Uses meta-llama/Llama-3.2-3B-Instruct via HuggingFace API for text generation (not Mistral-7B locally)
6. **Prompt Template**: Backend uses a system prompt to ensure answers are only from CV context, with plain text output (no markdown)

### Backend LLM Details
- **Text Generation**: meta-llama/Llama-3.2-3B-Instruct (API: `https://router.huggingface.co/v1/chat/completions`)
- **Embeddings**: sentence-transformers/all-mpnet-base-v2 (API: `https://router.huggingface.co/hf-inference/models/sentence-transformers/all-mpnet-base-v2/pipeline/feature-extraction`)
- **No local LLM or embedding model downloads required**

## License

This project is for educational purposes.
