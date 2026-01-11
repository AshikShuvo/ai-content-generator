import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { contentService } from '../services/content.service';
import { useDebounce } from '../hooks/useDebounce';
import type { Content } from '../types/content.types';

interface SearchBarProps {
  placeholder?: string;
}

export default function SearchBar({ placeholder = 'Search content by title...' }: SearchBarProps) {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Content[]>([]);
  const [loading, setLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchContent = async () => {
      if (debouncedQuery.trim().length < 2) {
        setResults([]);
        setShowResults(false);
        return;
      }

      setLoading(true);
      try {
        const data = await contentService.searchContent(debouncedQuery, 8);
        setResults(data);
        setShowResults(true);
        setLoading(false);
      } catch (error) {
        console.error('Search failed:', error);
        setResults([]);
        setLoading(false);
      }
    };

    searchContent();
  }, [debouncedQuery]);

  const handleResultClick = (contentId: string) => {
    navigate(`/content/${contentId}`);
    setQuery('');
    setShowResults(false);
  };

  const handleViewAll = () => {
    navigate('/content');
    setQuery('');
    setShowResults(false);
  };

  return (
    <div className="relative w-full max-w-lg" ref={searchRef}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <svg
            className="h-5 w-5 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => query.length >= 2 && setShowResults(true)}
          placeholder={placeholder}
          className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
        {loading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <svg
              className="animate-spin h-4 w-4 text-gray-400"
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
          </div>
        )}
      </div>

      {/* Search Results Dropdown */}
      {showResults && query.length >= 2 && (
        <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-96 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm">
          {results.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-500">
              {loading ? 'Searching...' : 'No results found'}
            </div>
          ) : (
            <>
              {results.map((content) => (
                <button
                  key={content.id}
                  onClick={() => handleResultClick(content.id)}
                  className="w-full text-left px-4 py-3 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {content.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {content.contentType.replace(/_/g, ' ')} •{' '}
                        {new Date(content.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <span
                      className={`ml-2 px-2 py-1 text-xs font-medium rounded-full whitespace-nowrap ${
                        content.status === 'COMPLETED'
                          ? 'bg-green-100 text-green-800'
                          : content.status === 'PROCESSING'
                          ? 'bg-blue-100 text-blue-800'
                          : content.status === 'PENDING'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {content.status}
                    </span>
                  </div>
                </button>
              ))}
              <button
                onClick={handleViewAll}
                className="w-full text-left px-4 py-3 text-sm text-indigo-600 hover:bg-gray-50 font-medium border-t border-gray-200"
              >
                View all content →
              </button>
            </>
          )}
        </div>
      )}
    </div>
  );
}
