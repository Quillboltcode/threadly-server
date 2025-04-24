import { removeStopwords } from 'stopword'; // Import the removeStopwords function

export const extractTags = (content, limit = Infinity) => {
  if (typeof content !== 'string') return [];

  // Extract hashtags
  const hashtagMatches = content.match(/#\w+/g) || [];
  const hashtagTags = hashtagMatches.map(tag => tag.slice(1).toLowerCase());

  // Extract words and preprocess them
  const words = content
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove punctuation
    .split(/\s+/); // Split into words

  // Use removeStopwords to filter out common stopwords
  const filteredWords = removeStopwords(words);

  // Combine and deduplicate tags
  const uniqueTags = [...new Set([...hashtagTags, ...filteredWords])];

  // Apply the limit to the tags array
  return uniqueTags.slice(0, limit);
};

// Example usage
const tweet = "traveling to the #beach at sunset! #travel #adventure #nature";  

// Without a limit
// console.log(extractTags(tweet)); 
// Output: ["beach", "travel", "adventure", "nature", "traveling", "sunset"]

// With a limit of 3 tags
// console.log(extractTags(tweet, 3)); 
// Output: ["beach", "travel", "adventure"]