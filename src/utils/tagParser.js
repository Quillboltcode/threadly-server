import stopwords from 'stopword'; // Import the stopwords list

export const extractTags = (content) => {
  if (typeof content !== 'string') return []; // Ensure content is a string

  // Extract hashtags
  const hashtagMatches = content.match(/#\w+/g) || [];
  const hashtagTags = hashtagMatches.map(tag => tag.slice(1).toLowerCase());

  // Extract keywords (nouns/keywords)
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/); // Split into words

  // Filter out short/common words using stopwords in a try-catch block
  let filteredWords = [];
  try {
    filteredWords = words.filter(word => 
      word.length > 2 && 
      !stopwords.includes(word) // Use stopwords directly
    );
  } catch (error) {
    console.error("Error filtering stopwords:", error.message);
    filteredWords = words.filter(word => word.length > 2); // Fallback: Ignore stopwords
  }

  // Combine and deduplicate tags
  const uniqueTags = [...new Set([...hashtagTags, ...filteredWords])];
  return uniqueTags;
};