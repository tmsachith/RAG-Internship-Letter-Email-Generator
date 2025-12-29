import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/contexts/AuthContext';
import { cvAPI } from '@/lib/api';
import Link from 'next/link';

export default function Dashboard() {
  const { user, logout, loading: authLoading } = useAuth();
  const [cvStatus, setCvStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      fetchCVStatus();
    }
  }, [user]);

  const fetchCVStatus = async () => {
    try {
      const response = await cvAPI.getStatus();
      setCvStatus(response.data);
    } catch (error) {
      console.error('Error fetching CV status:', error);
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <h1 className="text-2xl font-bold text-gray-800">RAG CV System</h1>
            <div className="flex items-center space-x-4">
              <span className="text-gray-600">{user?.email}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-3xl font-bold mb-6 text-gray-800">Dashboard</h2>

          {!cvStatus?.has_cv ? (
            <div className="text-center py-8">
              <div className="mb-4">
                <svg
                  className="mx-auto h-24 w-24 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-700 mb-2">
                No CV Uploaded
              </h3>
              <p className="text-gray-600 mb-6">
                Upload your CV to start asking questions about it
              </p>
              <Link
                href="/upload"
                className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
              >
                Upload CV
              </Link>
            </div>
          ) : (
            <div>
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
                <div className="flex items-center">
                  <svg
                    className="h-6 w-6 text-green-600 mr-3"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                  <div>
                    <p className="font-semibold text-green-800">CV Uploaded</p>
                    <p className="text-sm text-green-700">
                      {cvStatus.cv.filename}
                    </p>
                  </div>
                </div>
              </div>

              {cvStatus.cv.processed ? (
                <div className="space-y-4">
                  <p className="text-gray-600 mb-4">
                    Your CV has been processed. You can now ask questions about it.
                  </p>
                  <Link
                    href="/chat"
                    className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                  >
                    Start Chatting
                  </Link>
                </div>
              ) : (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-yellow-800">
                    Your CV is being processed. This may take a few moments...
                  </p>
                </div>
              )}

              <div className="mt-6">
                <Link
                  href="/upload"
                  className="text-blue-600 hover:underline"
                >
                  Upload a new CV
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
