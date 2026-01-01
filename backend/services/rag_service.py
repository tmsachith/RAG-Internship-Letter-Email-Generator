import os
import re
import requests
from langchain_community.document_loaders import PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_community.vectorstores import PGVector
from langchain_core.embeddings import Embeddings
from config import settings


class HuggingFaceAPIEmbeddings(Embeddings):
    """Custom embeddings using HuggingFace API - lightweight, no model downloads"""
    def __init__(self, api_key: str):
        self.api_key = api_key
        self.api_url = "https://router.huggingface.co/hf-inference/models/sentence-transformers/all-MiniLM-L6-v2/pipeline/feature-extraction"
    
    def embed_documents(self, texts: list) -> list:
        """Embed multiple texts"""
        headers = {"Authorization": f"Bearer {self.api_key}"}
        embeddings = []
        
        for text in texts:
            response = requests.post(self.api_url, headers=headers, json={"inputs": text})
            if response.status_code == 200:
                embedding = response.json()
                embeddings.append(embedding)
            else:
                raise Exception(f"Embedding API error: {response.status_code} - {response.text}")
        
        return embeddings
    
    def embed_query(self, text: str) -> list:
        """Embed a single query text"""
        headers = {"Authorization": f"Bearer {self.api_key}"}
        response = requests.post(self.api_url, headers=headers, json={"inputs": text})
        
        if response.status_code == 200:
            return response.json()
        else:
            raise Exception(f"Embedding API error: {response.status_code} - {response.text}")


class RAGService:
    def __init__(self):
        self.embedding_model = None
        self.text_splitter = RecursiveCharacterTextSplitter(
            chunk_size=1000,
            chunk_overlap=200
        )
        self._initialize_models()

    def _initialize_models(self):
        """Use API-based embeddings instead of local models"""
        self.embedding_model = HuggingFaceAPIEmbeddings(
            api_key=settings.HUGGINGFACE_API_KEY
        )

    def _markdown_to_html(self, text: str) -> str:
        """Convert markdown formatting to HTML"""
        # Bold: **text** or __text__ -> <strong>text</strong>
        text = re.sub(r'\*\*(.+?)\*\*', r'<strong>\1</strong>', text)
        text = re.sub(r'__(.+?)__', r'<strong>\1</strong>', text)
        
        # Italic: *text* or _text_ -> <em>text</em>
        text = re.sub(r'\*(.+?)\*', r'<em>\1</em>', text)
        text = re.sub(r'_(.+?)_', r'<em>\1</em>', text)
        
        # Preserve line breaks
        text = text.replace('\n', '<br>')
        
        return text

    def _call_deepseek(self, context: str, question: str) -> str:
        API_URL = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json",
        }
        data = {
            "model": "deepseek-ai/DeepSeek-V3.2",
            "messages": [
                {"role": "system", "content": "You are an expert HR assistant. Answer questions ONLY using information from the provided CV context. If the information is not in the context, clearly state that. Be precise and accurate - do not make assumptions or provide information not explicitly mentioned in the CV. Provide answers in plain text without any markdown formatting (no **, __, or other markdown symbols)."},
                {"role": "user", "content": f"CV Context:\n{context}\n\nQuestion: {question}\n\nAnswer based ONLY on the CV context above in plain text format. If the answer is not in the context, say 'I cannot find that information in your CV.'"}
            ],
            "max_tokens": 1024,
            "temperature": 0.3
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
            retriever = vectorstore.as_retriever(search_kwargs={"k": 8})
            def format_docs(docs):
                return "\n\n".join([d.page_content for d in docs])
            # Retrieve context
            context = format_docs(retriever.get_relevant_documents(question))
            # Call DeepSeek API directly
            return self._call_deepseek(context, question)
        except Exception as e:
            print(f"Query Error: {str(e)}")
            raise Exception(f"Failed to query CV with DeepSeek: {str(e)}")

    def generate_application(self, user_id: int, job_description: str, application_type: str) -> dict:
        """
        Generate a personalized cover letter or email based on CV and job description
        
        Args:
            user_id: The user's ID
            job_description: The job description text
            application_type: Either 'cover_letter' or 'email'
            
        Returns:
            dict: For cover_letter returns {'content': str}, for email returns {'subject': str, 'content': str}
        """
        try:
            # Retrieve relevant CV sections
            vectorstore = PGVector(
                connection_string=settings.DATABASE_URL,
                embedding_function=self.embedding_model,
                collection_name=f"user_{user_id}_cv"
            )
            retriever = vectorstore.as_retriever(search_kwargs={"k": 10})
            
            def format_docs(docs):
                return "\n\n".join([d.page_content for d in docs])
            
            # Get relevant CV context based on job description
            cv_context = format_docs(retriever.get_relevant_documents(job_description))
            
            # Create appropriate prompt based on application type
            if application_type == "cover_letter":
                return self._generate_cover_letter(cv_context, job_description)
            elif application_type == "email":
                return self._generate_email(cv_context, job_description)
            else:
                raise ValueError(f"Invalid application_type: {application_type}")
                
        except Exception as e:
            print(f"Application Generation Error: {str(e)}")
            raise Exception(f"Failed to generate application: {str(e)}")

    def _generate_cover_letter(self, cv_context: str, job_description: str) -> dict:
        """Generate a personalized cover letter"""
        API_URL = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json",
        }
        
        prompt = f"""You are an expert career advisor and professional writer. Create a compelling, personalized cover letter based on the candidate's CV and the job description.

CV Information:
{cv_context}

Job Description:
{job_description}

Requirements:
1. Write a professional, engaging cover letter (3-4 paragraphs)
2. Highlight relevant skills, experiences, and achievements from the CV that match the job requirements
3. Show enthusiasm and cultural fit
4. Include specific examples and accomplishments
5. Make it personal and authentic, not generic
6. Use professional tone and proper business letter format
7. Start with a strong opening that captures attention
8. End with a clear call to action
9. Write in plain text without any markdown formatting (no **, __, or other markdown symbols)

Generate ONLY the cover letter content (no additional commentary). Include proper salutation and closing."""

        data = {
            "model": "deepseek-ai/DeepSeek-V3.2",
            "messages": [
                {"role": "system", "content": "You are an expert career advisor specializing in writing compelling cover letters that get results."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 2048,
            "temperature": 0.8
        }
        
        response = requests.post(API_URL, headers=headers, json=data)
        if response.status_code == 200:
            result = response.json()
            try:
                content = result["choices"][0]["message"]["content"]
                # Convert markdown to HTML
                content_html = self._markdown_to_html(content)
                return {"content": content_html}
            except Exception:
                return {"content": str(result)}
        else:
            raise Exception(f"DeepSeek API error: {response.status_code} {response.text}")

    def _generate_email(self, cv_context: str, job_description: str) -> dict:
        """Generate a personalized email with subject line"""
        API_URL = "https://router.huggingface.co/v1/chat/completions"
        headers = {
            "Authorization": f"Bearer {settings.HUGGINGFACE_API_KEY}",
            "Content-Type": "application/json",
        }
        
        prompt = f"""You are an expert career advisor and professional writer. Create a compelling, personalized job application email based on the candidate's CV and the job description.

CV Information:
{cv_context}

Job Description:
{job_description}

Requirements:
1. Create a catchy, professional email subject line
2. Write a concise but impactful email body (2-3 short paragraphs)
3. Highlight the most relevant skills and experiences that match the job
4. Show enthusiasm and fit for the role
5. Include 1-2 specific achievements or examples
6. Keep it professional yet personable
7. End with a clear call to action
8. Keep the email concise - suitable for email format (shorter than a cover letter)
9. Write in plain text without any markdown formatting (no **, __, or other markdown symbols)

Format your response EXACTLY as follows:
SUBJECT: [your subject line here]

BODY:
[your email content here including greeting and closing]

Generate ONLY the subject and body (no additional commentary)."""

        data = {
            "model": "deepseek-ai/DeepSeek-V3.2",
            "messages": [
                {"role": "system", "content": "You are an expert career advisor specializing in writing compelling job application emails."},
                {"role": "user", "content": prompt}
            ],
            "max_tokens": 1536,
            "temperature": 0.8
        }
        
        response = requests.post(API_URL, headers=headers, json=data)
        if response.status_code == 200:
            result = response.json()
            try:
                full_content = result["choices"][0]["message"]["content"]
                # Parse subject and body
                lines = full_content.split('\n')
                subject = ""
                body_lines = []
                in_body = False
                
                for line in lines:
                    if line.startswith("SUBJECT:"):
                        subject = line.replace("SUBJECT:", "").strip()
                    elif line.startswith("BODY:"):
                        in_body = True
                    elif in_body:
                        body_lines.append(line)
                
                body = '\n'.join(body_lines).strip()
                
                # Fallback if parsing fails
                if not subject or not body:
                    subject = "Application for Position"
                    body = full_content
                
                # Convert markdown to HTML in body
                body_html = self._markdown_to_html(body)
                
                return {"subject": subject, "content": body_html}
            except Exception as e:
                print(f"Parsing error: {e}")
                return {"subject": "Application for Position", "content": str(result)}
        else:
            raise Exception(f"DeepSeek API error: {response.status_code} {response.text}")

# Singleton instance
rag_service = RAGService()