import { useState, useEffect } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { useContentPolling } from '../hooks/useContentPolling';
import { contentService } from '../services/content.service';
import ContentStatusIndicator from '../components/ContentStatusIndicator';
import type { Content } from '../types/content.types';
import { ContentStatus } from '../types/content.types';

export default function ContentDetail() {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  const [content, setContent] = useState<Content | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  // Get jobId from location state (passed from ContentCreate)
  const jobId = location.state?.jobId;

  // Fetch content details
  const fetchContent = async () => {
    if (!id) return;
    try {
      const data = await contentService.getContentById(id);
      setContent(data);
      setEditedText(data.generatedText || '');
      setLoading(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load content');
      setLoading(false);
    }
  };

  // Use polling hook if we have a jobId and content is not completed
  const shouldPoll = jobId && content?.status !== ContentStatus.COMPLETED && content?.status !== ContentStatus.FAILED;

  const { status: pollingStatus } = useContentPolling({
    jobId: jobId || '',
    enabled: !!shouldPoll,
    intervalMs: 5000,
    onCompleted: () => {
      fetchContent(); // Refresh content when completed
    },
    onFailed: () => {
      fetchContent(); // Refresh content when failed
    },
  });

  useEffect(() => {
    fetchContent();
  }, [id]);

  const handleSave = async () => {
    if (!id || !content) return;
    try {
      const updated = await contentService.updateContent(id, {
        generatedText: editedText,
      });
      setContent(updated);
      setEditing(false);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to save changes');
    }
  };

  const handleDelete = async () => {
    if (!id || !confirm('Are you sure you want to delete this content?')) return;
    try {
      await contentService.deleteContent(id);
      navigate('/content');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete content');
    }
  };

  if (loading && !content) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <svg
            className="animate-spin h-12 w-12 text-indigo-600 mx-auto"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <p className="mt-4 text-gray-600">Loading content...</p>
        </div>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">{error || 'Content not found'}</p>
          <button
            onClick={() => navigate('/dashboard')}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => navigate('/dashboard')}
                className="text-gray-600 hover:text-gray-900 mr-4"
              >
                ← Back
              </button>
              <h1 className="text-xl font-bold text-gray-900">Content Details</h1>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={handleDelete}
                className="px-4 py-2 text-red-600 hover:text-red-800 border border-red-300 rounded-md hover:bg-red-50"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="space-y-6">
          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {/* Status Indicator */}
          {(pollingStatus || content.status !== ContentStatus.COMPLETED) && (
            <ContentStatusIndicator
              status={pollingStatus?.status || content.status}
              errorMessage={content.errorMessage}
            />
          )}

          {/* Content Card */}
          <div className="bg-white shadow rounded-lg p-6">
            <div className="border-b border-gray-200 pb-4 mb-4">
              <h2 className="text-2xl font-bold text-gray-900">{content.title}</h2>
              <div className="mt-2 flex items-center space-x-4 text-sm text-gray-500">
                <span>Type: {content.contentType.replace(/_/g, ' ')}</span>
                <span>•</span>
                <span>Created: {new Date(content.createdAt).toLocaleString()}</span>
              </div>
            </div>

            {/* Original Prompt */}
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">Original Prompt:</h3>
              <p className="text-gray-600 bg-gray-50 p-4 rounded">{content.prompt}</p>
            </div>

            {/* Generated Content */}
            {content.status === ContentStatus.COMPLETED && content.generatedText && (
              <div>
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-sm font-medium text-gray-700">Generated Content:</h3>
                  {!editing && (
                    <button
                      onClick={() => setEditing(true)}
                      className="text-indigo-600 hover:text-indigo-800 text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editing ? (
                  <div>
                    <textarea
                      value={editedText}
                      onChange={(e) => setEditedText(e.target.value)}
                      rows={15}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                    <div className="mt-3 flex justify-end space-x-2">
                      <button
                        onClick={() => {
                          setEditing(false);
                          setEditedText(content.generatedText || '');
                        }}
                        className="px-4 py-2 text-gray-700 border border-gray-300 rounded-md hover:bg-gray-50"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="prose max-w-none">
                    <pre className="whitespace-pre-wrap text-gray-800 bg-gray-50 p-4 rounded border border-gray-200">
                      {content.generatedText}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
