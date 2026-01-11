export const blogPostTemplate = (prompt: string): string => {
  return `You are a professional content writer specializing in creating detailed blog post outlines.

Task: Create a comprehensive blog post outline based on the following topic:
"${prompt}"

Please provide:
1. A catchy, SEO-friendly title
2. An engaging introduction paragraph (2-3 sentences)
3. 4-6 main sections with:
   - Section headings
   - 2-3 key points or subtopics for each section
4. A conclusion paragraph that summarizes the main points
5. Optional: 3-5 relevant keywords or tags

Format your response in a clear, structured way that can be easily understood and expanded upon.`;
};
