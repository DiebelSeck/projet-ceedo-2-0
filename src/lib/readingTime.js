/**
 * Calculate estimated reading time for a text or HTML string.
 *
 * @param {string} content - The content to analyze.
 * @param {number} wordsPerMinute - Reading speed (default 220).
 * @returns {number} - Estimated minutes (minimum 1).
 */
export function calculateReadingTime(content, wordsPerMinute = 220) {
  if (!content) return 0;

  // 1. Strip HTML tags
  const plainText = content.replace(/<[^>]*>?/gm, '');

  // 2. Count words (split by whitespace)
  const words = plainText.trim().split(/\s+/).length;

  // 3. Calculate minutes
  const minutes = Math.ceil(words / wordsPerMinute);

  return Math.max(1, minutes);
}
