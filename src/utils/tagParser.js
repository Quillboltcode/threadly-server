import stopwords from 'stopword'; // Optional: Remove common words

export const extractTags = (content) => {
  if (!content) return [];

  // Extract words starting with #
  const hashtagMatches = content.match(/#\w+/g) || [];
  const hashtagTags = hashtagMatches.map(tag => tag.slice(1).toLowerCase());

  // Extract other potential tags (nouns/keywords)
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/) // Split into words
    .filter(word => word.length > 2 && !stopwords.en.includes(word)); // Remove short/common words

  // Combine hashtags and keywords (remove duplicates)
  const uniqueTags = [...new Set([...hashtagTags, ...words])];

  return uniqueTags;
};
