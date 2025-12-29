import os
import requests
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_huggingface import HuggingFaceEmbeddings, HuggingFaceEndpoint, ChatHuggingFace
from langchain_community.vectorstores import PGVector
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough, RunnableLambda
from langchain_core.output_parsers import StrOutputParser
from config import settings


class RAGService:
    def __init__(self):
        self.embedding_model = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=500,
            chunk_overlap=50
        )
        self._initialize_models()

    def _initialize_models(self):
        """Local embeddings"""
        self.embedding_model = HuggingFaceEmbeddings(
            model_name="sentence-transformers/all-MiniLM-L6-v2",
            model_kwargs={'device': 'cpu'}
        )

    def _call_deepseek(self, context: str, question: str) -> str:
        API_URL = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json",
        }
        data = {
            "model": "deepseek-ai/DeepSeek-V3.2",
            "messages": [
                {"role": "system", "content": "You are an expert HR assistant. Answer the user's question based strictly on the provided CV context."},
                {"role": "user", "content": f"Context from CV:\n{context}\n\nQuestion: {question}"}
            ],
            "max_tokens": 1024,
            "temperature": 0.7
        }
        response = requests.post(API_URL, headers=headers, json=data)
        if response.status_code == 200:
            result = response.json()
            # Extract the answer from the response
            try:
                return result["choices"][0]["message"]["content"]
            except Exception:
                return str(result)
        else:
            return f"DeepSeek API error: {response.status_code} {response.text}"

    def process_cv(self, user_id: int, pdf_url: str):
        temp_pdf_path = f"temp_{user_id}.pdf"
        try:
            response = requests.get(pdf_url)
            response.raise_for_status()
            with open(temp_pdf_path, "wb") as f:
                f.write(response.content)
            
            loader = PyPDFLoader(temp_pdf_path)
            docs = loader.load()
            splits = self.text_splitter.split_documents(docs)
            
            PGVector.from_documents(
                documents=splits,
                embedding=self.embedding_model,
                connection_string=settings.DATABASE_URL,
                collection_name=f"user_{user_id}_cv",
                pre_delete_collection=True
            )
            return True
        except Exception as e:
            print(f"Error processing CV: {str(e)}")
            raise e
        finally:
            if os.path.exists(temp_pdf_path):
                os.remove(temp_pdf_path)
    

    def query_cv(self, user_id: int, question: str) -> str:
        try:
            vectorstore = PGVector(
                connection_string=settings.DATABASE_URL,
                embedding_function=self.embedding_model,
                collection_name=f"user_{user_id}_cv"
            )
            retriever = vectorstore.as_retriever(search_kwargs={"k": 4})
            def format_docs(docs):
                return "\n\n".join([d.page_content for d in docs])
            # Retrieve context
            context = format_docs(retriever.get_relevant_documents(question))
            # Call DeepSeek API directly
            return self._call_deepseek(context, question)
        except Exception as e:
            print(f"Query Error: {str(e)}")
            raise Exception(f"Failed to query CV with DeepSeek: {str(e)}")

# Singleton instance
rag_service = RAGService()