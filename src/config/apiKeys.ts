// API Configuration for SoulStation
// Replace these with your actual API keys

export const API_KEYS = {
  // RapidAPI YouTube API Key
  // Get your key from: https://rapidapi.com/ytdlfree/api/youtube138/
  RAPIDAPI_YOUTUBE_KEY: "f92009fadfmshd3afbaa6d3fa492p18c379jsn54acf1eb095a", // Your actual RapidAPI key
  
  // Tavus API Key for Video Streaming Virtual Assistant
  TAVUS_API_KEY: "111725a842c5457887e134eac8bc41e5",
  
  // Add other API keys here as needed
  // OPEN_LIBRARY_KEY: "your_open_library_key", // Open Library is free, no key needed
} as const;

// Environment variable fallbacks
export const getApiKey = (key: keyof typeof API_KEYS): string => {
  // Check if we're in a browser environment
  if (typeof window !== 'undefined') {
    const envKey = `REACT_APP_${key}`;
    return (window as any).env?.[envKey] || API_KEYS[key];
  }
  // Fallback for server-side or direct access
  return API_KEYS[key];
};

// Usage example:
// const apiKey = getApiKey('RAPIDAPI_YOUTUBE_KEY');
