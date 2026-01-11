import { useNavigate } from 'react-router-dom';
import type { Content } from '../types/content.types';

interface ContentCardProps {
  content: Content;
  onDelete?: (id: string) => void;
}

const contentTypeLabels: Record<string, string> = {
  BLOG_POST: 'Blog Post',
  PRODUCT_DESCRIPTION: 'Product Description',
  SOCIAL_MEDIA_CAPTION: 'Social Media',
};

const statusColors: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  PROCESSING: 'bg-blue-100 text-blue-800',
  COMPLETED: 'bg-green-100 text-green-800',
  FAILED: 'bg-red-100 text-red-800',
};

export default function ContentCard({ content, onDelete }: ContentCardProps) {
  const navigate = useNavigate();

  const handleView = () => {
    navigate(`/content/${content.id}`);
  };

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this content?')) {
      onDelete?.(content.id);
    }
  };

  return (
    <div
      onClick={handleView}
      className="bg-white rounded-lg shadow hover:shadow-md transition-shadow cursor-pointer border border-gray-200"
    >
      <div className="p-5">
        {/* Header */}
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-lg font-semibold text-gray-900 line-clamp-2 flex-1">
            {content.title}
          </h3>
          <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColors[content.status]}`}>
            {content.status}
          </span>
        </div>

        {/* Content Type Badge */}
        <div className="mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
            {contentTypeLabels[content.contentType]}
          </span>
        </div>

        {/* Prompt Preview */}
        <p className="text-sm text-gray-600 line-clamp-2 mb-4">
          {content.prompt}
        </p>

        {/* Footer */}
        <div className="flex justify-between items-center pt-3 border-t border-gray-200">
          <span className="text-xs text-gray-500">
            {new Date(content.createdAt).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
            })}
          </span>
          <div className="flex space-x-2">
            <button
              onClick={handleView}
              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
            >
              View
            </button>
            <button
              onClick={handleDelete}
              className="text-red-600 hover:text-red-800 text-sm font-medium"
            >
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
