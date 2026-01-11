import { useEffect, useState, useRef } from 'react';
import { contentService } from '../services/content.service';
import { ContentStatus, type ContentStatusResponse } from '../types/content.types';

interface UseContentPollingOptions {
  jobId: string;
  enabled: boolean;
  intervalMs?: number;
  onCompleted?: (data: ContentStatusResponse) => void;
  onFailed?: (data: ContentStatusResponse) => void;
}

export function useContentPolling({
  jobId,
  enabled,
  intervalMs = 5000,
  onCompleted,
  onFailed,
}: UseContentPollingOptions) {
  const [status, setStatus] = useState<ContentStatusResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const fetchStatus = async () => {
    try {
      const data = await contentService.getContentStatus(jobId);
      setStatus(data);
      setLoading(false);
      setError(null);

      // Check if completed or failed
      if (data.status === ContentStatus.COMPLETED) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onCompleted?.(data);
      } else if (data.status === ContentStatus.FAILED) {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }
        onFailed?.(data);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch status');
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!enabled || !jobId) return;

    // Initial fetch
    fetchStatus();

    // Set up polling
    intervalRef.current = setInterval(fetchStatus, intervalMs);

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [jobId, enabled, intervalMs]);

  const refetch = () => {
    fetchStatus();
  };

  return {
    status,
    loading,
    error,
    refetch,
    isPolling: intervalRef.current !== null,
  };
}
