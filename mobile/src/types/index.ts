export interface User {
  id: number;
  email: string;
  has_cv: boolean;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export interface CVStatus {
  has_cv: boolean;
  cv?: {
    id: number;
    filename: string;
    processed: boolean;
    cloudinary_url: string;
    uploaded_at: string;
  };
}

export interface ChatMessage {
  id: number;
  type: 'user' | 'assistant';
  content: string;
  timestamp?: string;
}

export interface ChatHistory {
  id: number;
  question: string;
  answer: string;
  created_at: string;
}

export interface ApplicationHistory {
  id: number;
  job_description: string;
  application_type: 'cover_letter' | 'email';
  subject: string | null;
  content: string;
  created_at: string;
}

export interface ApplicationResult {
  subject?: string;
  content: string;
}
