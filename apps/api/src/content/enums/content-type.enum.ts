export enum ContentType {
  BLOG_POST = 'BLOG_POST',
  PRODUCT_DESCRIPTION = 'PRODUCT_DESCRIPTION',
  SOCIAL_MEDIA_CAPTION = 'SOCIAL_MEDIA_CAPTION',
}

export const ContentTypeLabels: Record<ContentType, string> = {
  [ContentType.BLOG_POST]: 'Blog Post Outline',
  [ContentType.PRODUCT_DESCRIPTION]: 'Product Description',
  [ContentType.SOCIAL_MEDIA_CAPTION]: 'Social Media Caption',
};
