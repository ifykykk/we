# SoulStation Component - API Setup Guide

## Overview
SoulStation is a React component that provides a wellness-focused content discovery platform, featuring books and music recommendations for mental health and relaxation.

## Features
- 📚 **Book Discovery**: Search and browse wellness books from Open Library
- 🎵 **Music Discovery**: Search and browse relaxing music from YouTube (via RapidAPI)
- 🏷️ **Category Filtering**: Browse content by wellness categories
- 🔍 **Search Functionality**: Search for specific books or music
- 📱 **Responsive Design**: Works on all device sizes

## API Setup

### 1. RapidAPI YouTube API Setup
The music functionality uses the YouTube API through RapidAPI.

#### Steps to get your API key:
1. Go to [RapidAPI YouTube API](https://rapidapi.com/ytdlfree/api/youtube138/)
2. Sign up for a free RapidAPI account
3. Subscribe to the YouTube API (free tier available)
4. Copy your API key

#### Configure the API key:
**Option 1: Environment Variable (Recommended)**
```bash
# Create a .env file in your project root
REACT_APP_RAPIDAPI_YOUTUBE_KEY=your_actual_api_key_here
```

**Option 2: Direct Configuration**
Edit `src/config/apiKeys.ts`:
```typescript
export const API_KEYS = {
  RAPIDAPI_YOUTUBE_KEY: "your_actual_api_key_here",
} as const;
```

### 2. Open Library API
The book functionality uses Open Library API, which is free and doesn't require an API key.

## Usage

### Basic Usage
```tsx
import SoulStation from './components/SoulStation';

function App() {
  return <SoulStation />;
}
```

### Component Features
- **Content Type Toggle**: Switch between books and music
- **Search**: Search for specific content
- **Category Browsing**: Browse by wellness categories
- **Responsive Cards**: Beautiful card layouts for content

## API Endpoints Used

### Books (Open Library)
- **Search**: `https://openlibrary.org/search.json`
- **Cover Images**: `https://covers.openlibrary.org/b/id/{cover_id}-M.jpg`

### Music (RapidAPI YouTube)
- **Search**: `https://youtube138.p.rapidapi.com/search/`
- **Headers**: Requires RapidAPI key and host

## Fallback Data
If the API is not configured or fails, the component will show fallback data:
- **Books**: Curated wellness book recommendations
- **Music**: Sample meditation and relaxation tracks

## Error Handling
- API failures gracefully fall back to sample data
- Network errors are logged to console
- User-friendly error states for failed requests

## Styling
The component uses Tailwind CSS classes and includes:
- Gradient backgrounds
- Hover animations
- Responsive grid layouts
- Loading states with skeleton screens

## Development Notes
- All API calls are async and handle errors gracefully
- The component is fully typed with TypeScript
- No external dependencies beyond React and the APIs
- Designed for easy integration into existing React applications
