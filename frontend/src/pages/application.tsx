import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { applicationAPI, cvAPI } from '@/lib/api';
import Link from 'next/link';

export default function Application() {
  const { user, loading: authLoading } = useAuth();
  const [jobDescription, setJobDescription] = useState('');
  const [applicationType, setApplicationType] = useState<'cover_letter' | 'email'>('cover_letter');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ subject?: string; content: string } | null>(null);
  const [cvProcessed, setCvProcessed] = useState(false);
  const [checkingCV, setCheckingCV] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      checkCVStatus();
    }
  }, [user]);

  const checkCVStatus = async () => {
    try {
      const response = await cvAPI.getStatus();
      if (!response.data.has_cv) {
        router.push('/upload');
      } else if (!response.data.cv.processed) {
        setCvProcessed(false);
        setCheckingCV(false);
      } else {
        setCvProcessed(true);
        setCheckingCV(false);
      }
    } catch (error) {
      console.error('Error checking CV status:', error);
      setCheckingCV(false);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!jobDescription.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const response = await applicationAPI.generate(jobDescription, applicationType);
      setResult(response.data);
    } catch (error: any) {
      alert(error.response?.data?.detail || 'Error generating application');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!result) return;
    
    // Strip HTML tags for plain text copy
    const stripHtml = (html: string) => {
      const tmp = document.createElement('div');
      tmp.innerHTML = html;
      return tmp.textContent || tmp.innerText || '';
    };
    
    let textToCopy = '';
    const plainContent = stripHtml(result.content);
    
    if (applicationType === 'email' && result.subject) {
      textToCopy = `Subject: ${result.subject}\n\n${plainContent}`;
    } else {
      textToCopy = plainContent;
    }
    
    navigator.clipboard.writeText(textToCopy);
    alert('Copied to clipboard!');
  };

  if (authLoading || checkingCV) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Application Generator</h1>
          <nav className="flex gap-4">
            <Link href="/dashboard" className="text-gray-600 hover:text-gray-900">
              Dashboard
            </Link>
            <Link href="/chat" className="text-gray-600 hover:text-gray-900">
              Chat
            </Link>
            <Link href="/upload" className="text-gray-600 hover:text-gray-900">
              Upload CV
            </Link>
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {!cvProcessed ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800">
              Your CV is still being processed. Please wait a moment and refresh the page.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Input Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                Generate Your Application
              </h2>
              
              <form onSubmit={handleGenerate}>
                {/* Application Type Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Application Type
                  </label>
                  <div className="flex gap-4">
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="cover_letter"
                        checked={applicationType === 'cover_letter'}
                        onChange={(e) => setApplicationType(e.target.value as 'cover_letter')}
                        className="mr-2"
                      />
                      <span className="text-gray-700">Cover Letter</span>
                    </label>
                    <label className="flex items-center">
                      <input
                        type="radio"
                        value="email"
                        checked={applicationType === 'email'}
                        onChange={(e) => setApplicationType(e.target.value as 'email')}
                        className="mr-2"
                      />
                      <span className="text-gray-700">Email</span>
                    </label>
                  </div>
                </div>

                {/* Job Description Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Job Description
                  </label>
                  <textarea
                    value={jobDescription}
                    onChange={(e) => setJobDescription(e.target.value)}
                    rows={12}
                    placeholder="Paste the job description here..."
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                    disabled={loading}
                  />
                </div>

                {/* Generate Button */}
                <button
                  type="submit"
                  disabled={loading || !jobDescription.trim()}
                  className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {loading ? 'Generating...' : `Generate ${applicationType === 'cover_letter' ? 'Cover Letter' : 'Email'}`}
                </button>
              </form>

              {loading && (
                <div className="mt-4 text-center text-gray-600">
                  <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  <p className="mt-2">Creating your personalized application...</p>
                </div>
              )}
            </div>

            {/* Result Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Generated {applicationType === 'cover_letter' ? 'Cover Letter' : 'Email'}
                </h2>
                {result && (
                  <button
                    onClick={handleCopy}
                    className="bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 text-sm font-medium transition-colors"
                  >
                    Copy to Clipboard
                  </button>
                )}
              </div>

              {!result ? (
                <div className="text-gray-500 text-center py-12">
                  <p>Your generated application will appear here.</p>
                  <p className="text-sm mt-2">Enter a job description and click generate to start.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applicationType === 'email' && result.subject && (
                    <div className="border-b border-gray-200 pb-4">
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Subject:</h3>
                      <p className="text-gray-900 font-medium">{result.subject}</p>
                    </div>
                  )}
                  
                  <div>
                    {applicationType === 'email' && (
                      <h3 className="text-sm font-semibold text-gray-700 mb-2">Body:</h3>
                    )}
                    <div 
                      className="prose prose-sm max-w-none text-gray-900 leading-relaxed"
                      dangerouslySetInnerHTML={{ __html: result.content }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
