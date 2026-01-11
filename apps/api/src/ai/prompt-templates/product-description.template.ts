export const productDescriptionTemplate = (prompt: string): string => {
  return `You are a professional copywriter specializing in compelling product descriptions.

Task: Create a persuasive and engaging product description based on the following information:
"${prompt}"

Please provide:
1. A captivating product headline (10-15 words)
2. A compelling opening paragraph that highlights the main benefit (2-3 sentences)
3. Key Features section:
   - List 4-6 main features with brief explanations
4. Benefits section:
   - Explain 3-4 ways this product improves the customer's life
5. A strong call-to-action paragraph that encourages purchase

Use persuasive language, focus on benefits over features, and create a sense of value. Make it concise yet impactful.`;
};
