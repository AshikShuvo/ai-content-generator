export type ContentType =
  | 'BLOG_POST'
  | 'PRODUCT_DESCRIPTION'
  | 'SOCIAL_MEDIA_CAPTION';

export const ContentType = {
  BLOG_POST: 'BLOG_POST' as ContentType,
  PRODUCT_DESCRIPTION: 'PRODUCT_DESCRIPTION' as ContentType,
  SOCIAL_MEDIA_CAPTION: 'SOCIAL_MEDIA_CAPTION' as ContentType,
};

export type ContentStatus =
  | 'PENDING'
  | 'PROCESSING'
  | 'COMPLETED'
  | 'FAILED';

export const ContentStatus = {
  PENDING: 'PENDING' as ContentStatus,
  PROCESSING: 'PROCESSING' as ContentStatus,
  COMPLETED: 'COMPLETED' as ContentStatus,
  FAILED: 'FAILED' as ContentStatus,
};

export interface Content {
  id: string;
  userId: string;
  title: string;
  prompt: string;
  contentType: ContentType;
  generatedText: string | null;
  status: ContentStatus;
  jobId: string | null;
  errorMessage: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateContentDto {
  title: string;
  prompt: string;
  contentType: ContentType;
}

export interface GenerateContentResponse {
  jobId: string;
  contentId: string;
  message: string;
  delayMs: number;
  estimatedCompletionTime: string;
}

export interface ContentStatusResponse {
  jobId: string;
  status: ContentStatus;
  contentId: string | null;
  generatedText: string | null;
  errorMessage: string | null;
  estimatedCompletionTime: string | null;
}

export interface ContentListResponse {
  contents: Content[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ContentStats {
  total: number;
  pending: number;
  processing: number;
  completed: number;
  failed: number;
}
