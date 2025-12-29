import os
import requests
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import PGVector
from langchain_community.llms import HuggingFaceHub
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from config import settings

class RAGService:
    def __init__(self):
        self.embedding_model = None
        self.llm = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=400, 
            chunk_overlap=50
        )
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialize embedding model (local download) and LLM (API)"""
        # Use local embedding model (downloads on first use in Railway)
        self.embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-mpnet-base-v2"
        )
    
    def _initialize_llm(self):
        """Initialize LLM only when needed - using HuggingFace API"""
        if self.llm is None:
            self.llm = HuggingFaceHub(
                repo_id="mistralai/Mistral-7B-Instruct-v0.1",
                huggingfacehub_api_token=settings.HUGGINGFACE_API_KEY,
                model_kwargs={
                    "temperature": 0.1,
                    "max_length": 512
                }
            )
    
    def process_cv(self, user_id: int, pdf_url: str):
        """Process CV: download, chunk, and store in ChromaDB"""
        temp_pdf_path = None
        try:
            # Download PDF from Cloudinary
            temp_pdf_path = f"temp_{user_id}.pdf"
            print(f"Downloading PDF from {pdf_url}")
            response = requests.get(pdf_url)
            response.raise_for_status()
            
            with open(temp_pdf_path, "wb") as f:
                f.write(response.content)
            
            print(f"PDF downloaded, size: {len(response.content)} bytes")
            
            # Load PDF
            print("Loading PDF...")
            loader = PyPDFLoader(temp_pdf_path)
            docs = loader.load()
            print(f"Loaded {len(docs)} pages")
            
            # Split into chunks
            print("Splitting into chunks...")
            splits = self.text_splitter.split_documents(docs)
            print(f"Created {len(splits)} chunks")
            
            # Create vector store for this user in Supabase pgvector
            print("Creating embeddings and storing in Supabase pgvector...")
            collection_name = f"user_{user_id}_cv"
            vectorstore = PGVector.from_documents(
                documents=splits,
                embedding=self.embedding_model,
                connection_string=settings.DATABASE_URL,
                collection_name=collection_name,
                pre_delete_collection=True  # Delete old collection if exists
            )
            
            print("Processing completed successfully")
            
            # Clean up temp file
            if temp_pdf_path and os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
            
            return True
        except Exception as e:
            print(f"Error in process_cv: {type(e).__name__}: {str(e)}")
            # Clean up temp file if exists
            if temp_pdf_path and os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
            raise Exception(f"Failed to process CV: {type(e).__name__}: {str(e)}")
    
    def query_cv(self, user_id: int, question: str) -> str:
        """Query the CV using RAG"""
        try:
            # Initialize LLM if not already done
            self._initialize_llm()
            
            # Load user's vector store from Supabase pgvector
            collection_name = f"user_{user_id}_cv"
            vectorstore = PGVector(
                connection_string=settings.DATABASE_URL,
                embedding_function=self.embedding_model,
                collection_name=collection_name
            )
            
            # Create retriever
            retriever = vectorstore.as_retriever()
            
            # Define prompt template (exactly as specified)
            template = """
Answer this question using the provided context only.

{question}

Context:
{context}

Answer:
"""
            prompt = ChatPromptTemplate.from_template(template)
            
            # Create output parser
            output_parser = StrOutputParser()
            
            # Create chain
            chain = (
                {"context": retriever, "question": RunnablePassthrough()}
                | prompt
                | self.llm
                | output_parser
            )
            
            # Invoke chain
            response = chain.invoke(question)
            
            return response
        except Exception as e:
            raise Exception(f"Failed to query CV: {str(e)}")

# Singleton instance
rag_service = RAGService()
