import { ContentStatus } from '../types/content.types';

interface ContentStatusIndicatorProps {
  status: ContentStatus;
  errorMessage?: string | null;
}

export default function ContentStatusIndicator({ status, errorMessage }: ContentStatusIndicatorProps) {
  const getStatusConfig = () => {
    switch (status) {
      case ContentStatus.PENDING:
        return {
          label: 'Queued',
          color: 'bg-yellow-100 text-yellow-800',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                clipRule="evenodd"
              />
            </svg>
          ),
          description: 'Your content generation request is queued and will be processed shortly.',
        };
      case ContentStatus.PROCESSING:
        return {
          label: 'Processing',
          color: 'bg-blue-100 text-blue-800',
          icon: (
            <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
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
          ),
          description: 'AI is generating your content. This usually takes about a minute.',
        };
      case ContentStatus.COMPLETED:
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-800',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                clipRule="evenodd"
              />
            </svg>
          ),
          description: 'Your content has been generated successfully!',
        };
      case ContentStatus.FAILED:
        return {
          label: 'Failed',
          color: 'bg-red-100 text-red-800',
          icon: (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                clipRule="evenodd"
              />
            </svg>
          ),
          description: errorMessage || 'Content generation failed. Please try again.',
        };
      default:
        return {
          label: 'Unknown',
          color: 'bg-gray-100 text-gray-800',
          icon: null,
          description: 'Status unknown',
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className="bg-white rounded-lg border-2 border-gray-200 p-6">
      <div className="flex items-center space-x-4">
        <div className={`flex-shrink-0 p-3 rounded-full ${config.color}`}>
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${config.color}`}>
              {config.label}
            </span>
            {status === ContentStatus.PROCESSING && (
              <span className="text-sm text-gray-500">Estimated: ~1 minute</span>
            )}
          </div>
          <p className="mt-2 text-sm text-gray-600">{config.description}</p>
        </div>
      </div>
    </div>
  );
}
