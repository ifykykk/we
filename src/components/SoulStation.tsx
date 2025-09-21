import { useState, useEffect } from "react";
// ...existing code...
import Wrapper from "./Wrapper";

// TypeScript interfaces
interface Book {
  id: string;
  name: string;
  author: string;
  category: string;
  rating: string;
  coverImage?: string | null;
  openLibraryUrl?: string;
  publishYear?: number;
  isbn?: string | null;
  subjects?: string[];
}

interface Song {
  id: string;
  name: string;
  artist: string;
  album: string;
  preview?: string;
  image?: string;
  duration?: number;
}

interface OpenLibraryBook {
  key: string;
  title: string;
  author_name?: string[];
  subject?: string[];
  cover_i?: number;
  first_publish_year?: number;
  isbn?: string[];
}


// ...existing code...

interface CategoryQueries {
  [key: string]: string;
}

type ContentType = 'books' | 'music';

interface CategoryColors {
  [key: string]: string;
}

interface OpenLibraryResponse {
  docs: OpenLibraryBook[];
}

// Music service for fetching songs
/* class MusicService {
  private static readonly API_KEY = '2c03369b8c2ec26f806a984170481e9b';
  
  static async searchSongs(query: string, limit: number = 12): Promise<Song[]> {
    try {
      const response = await fetch(
        `https://api.deezer.com/search?q=${encodeURIComponent(query)}&limit=${limit}&access_token=${MusicService.API_KEY}`
      );
      const data: DeezerResponse = await response.json();
      
      return data.data.map((track: DeezerTrack): Song => ({
        id: track.id.toString(),
        name: track.title,
        artist: track.artist.name,
        album: track.album.title,
        preview: track.preview,
        image: track.album.cover_medium,
        duration: track.duration
      }));
    } catch (error) {
      console.error("Error fetching songs:", error);
      return [];
    }
  }

  static async getMusicByCategory(category: string, limit: number = 6): Promise<Song[]> {
    const categoryQueries: CategoryQueries = {
      'Meditation': 'meditation relaxing music',
      'Wellness': 'wellness healing music',
      'Nature': 'nature sounds relaxation',
      'Ambient': 'ambient peaceful music',
      'Classical': 'classical soothing music'
    };
    
    const query = categoryQueries[category] || `${category.toLowerCase()} music`;
    return await this.searchSongs(query, limit);
  }

  static formatDuration(seconds: number): string {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  }
}
  */
// -------------------- Music Service (YouTube API) --------------------
/*class MusicService {
  private static readonly API_KEY = "f92009fadfmshd3afbaa6d3fa492p18c379jsn54acf1eb095a";
  private static readonly HOST = "youtube138.p.rapidapi.com";

  // 🔍 Search songs on YouTube
  static async searchSongs(query: string, limit: number = 12): Promise<Song[]> {
    try {
      // Check if API key is set
      if (!MusicService.API_KEY) {
        console.warn("RapidAPI key not configured. Using fallback data.");
  return MusicService.getFallbackSongs(limit);
      }

      console.log(`Searching for: ${query}`);
      
      const response = await fetch(
        `https://${MusicService.HOST}/search/?q=${encodeURIComponent(query)}&hl=en&gl=US`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": MusicService.HOST,
            "x-rapidapi-key": MusicService.API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("API Response:", data);

      // Extract only videos from the response
      const videos: Song[] = [];
      
      if (data.contents && Array.isArray(data.contents)) {
        data.contents
          .filter((item: any) => item.video && item.video.videoId)
          .slice(0, limit)
          .forEach((item: any, index: number) => {
            const video = item.video;
            const song: Song = {
              id: video.videoId || `video_${index}`,
              name: this.extractTitle(video.title),
              artist: this.extractAuthor(video.author),
              album: "YouTube",
              preview: `https://www.youtube.com/watch?v=${video.videoId}`,
              image: this.extractThumbnail(video.thumbnail),
              duration: MusicService.parseDuration(video.lengthText?.simpleText),
            };
            videos.push(song);
          });
      }

      console.log(`Found ${videos.length} videos`);
      return videos;
    } catch (error) {
      console.error("Error fetching songs:", error);
  return MusicService.getFallbackSongs(limit);
    }
  }

  // Helper method to extract title
  private static extractTitle(title: any): string {
    if (!title) return "Unknown Title";
    if (typeof title === "string") return title;
    if (title.runs && Array.isArray(title.runs)) {
      return title.runs.map((run: any) => run.text || "").join(" ");
    }
    return title.text || "Unknown Title";
  }

  // Helper method to extract author
  private static extractAuthor(author: any): string {
    if (!author) return "Unknown Artist";
    if (typeof author === "string") return author;
    if (author.title) return author.title;
    if (author.name) return author.name;
    return "Unknown Artist";
  }

  // Helper method to extract thumbnail
  private static extractThumbnail(thumbnail: any): string | undefined {
    if (!thumbnail) return undefined;
    if (thumbnail.thumbnails && Array.isArray(thumbnail.thumbnails)) {
      // Get the highest quality thumbnail
      const sortedThumbs = thumbnail.thumbnails.sort((a: any, b: any) => 
        (b.width || 0) - (a.width || 0)
      );
      return sortedThumbs[0]?.url;
    }
    return thumbnail.url;
  }

  // Fallback songs when API is not available
  private static getFallbackSongs(limit: number): Song[] {
    const meditationSongs: Song[] = [
      {
        id: "meditation_1",
        name: "Peaceful Meditation Music",
        artist: "Meditation Music",
        album: "Relaxation Sounds",
        preview: "https://www.youtube.com/watch?v=inpok4MKVLM",
        image: "https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg",
        duration: 1800
      },
      {
        id: "meditation_2", 
        name: "Nature Sounds for Sleep",
        artist: "Nature Sounds",
        album: "Sleep Music",
        preview: "https://www.youtube.com/watch?v=1ZYbU82GVz4",
        image: "https://img.youtube.com/vi/1ZYbU82GVz4/maxresdefault.jpg",
        duration: 3600
      },
      {
        id: "meditation_3",
        name: "Ambient Relaxation",
        artist: "Ambient Music",
        album: "Chill Vibes",
        preview: "https://www.youtube.com/watch?v=5qap5aO4i9A",
        image: "https://img.youtube.com/vi/5qap5aO4i9A/maxresdefault.jpg",
        duration: 2400
      }
    ];

    const wellnessSongs: Song[] = [
      {
        id: "wellness_1",
        name: "Healing Frequencies",
        artist: "Wellness Music",
        album: "Healing Sounds",
        preview: "https://www.youtube.com/watch?v=Hx_uqy2Q6qY",
        image: "https://img.youtube.com/vi/Hx_uqy2Q6qY/maxresdefault.jpg",
        duration: 2700
      },
      {
        id: "wellness_2",
        name: "Calm Piano Music",
        artist: "Piano Relaxation",
        album: "Peaceful Moments",
        preview: "https://www.youtube.com/watch?v=4xDzrJKXOOY",
        image: "https://img.youtube.com/vi/4xDzrJKXOOY/maxresdefault.jpg",
        duration: 2100
      }
    ];

    const natureSongs: Song[] = [
      {
        id: "nature_1",
        name: "Forest Sounds",
        artist: "Nature Sounds",
        album: "Forest Ambience",
        preview: "https://www.youtube.com/watch?v=8jPEXxpT6yY",
        image: "https://img.youtube.com/vi/8jPEXxpT6yY/maxresdefault.jpg",
        duration: 3000
      },
      {
        id: "nature_2",
        name: "Ocean Waves",
        artist: "Ocean Sounds",
        album: "Sea Relaxation",
        preview: "https://www.youtube.com/watch?v=7t84lGE5TXA",
        image: "https://img.youtube.com/vi/7t84lGE5TXA/maxresdefault.jpg",
        duration: 3600
      }
    ];

    // Return different songs based on query
    const queryLower = query.toLowerCase();
    if (queryLower.includes('meditation') || queryLower.includes('calm')) {
      return meditationSongs.slice(0, limit);
    } else if (queryLower.includes('wellness') || queryLower.includes('healing')) {
      return wellnessSongs.slice(0, limit);
    } else if (queryLower.includes('nature') || queryLower.includes('forest')) {
      return natureSongs.slice(0, limit);
    }
    
    // Default to meditation songs
    return meditationSongs.slice(0, limit);
  }

  // 🎶 Get music by wellness category
  static async getMusicByCategory(category: string, limit: number = 6): Promise<Song[]> {
    const categoryQueries: CategoryQueries = {
      Meditation: "meditation relaxing music",
      Wellness: "wellness healing music",
      Nature: "nature sounds relaxation",
      Ambient: "ambient peaceful music",
      Classical: "classical soothing music",
    };

    const query = categoryQueries[category] || `${category.toLowerCase()} music`;
    
    // Add timestamp to make each search unique
    const uniqueQuery = `${query} ${Date.now()}`;
    return await this.searchSongs(uniqueQuery, limit);
  }

  // ⏱ Parse "3:45" → seconds
  private static parseDuration(duration: string | undefined): number | undefined {
    if (!duration) return undefined;
    const parts = duration.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return undefined;
  }

  // Format seconds into mm:ss
  static formatDuration(seconds: number): string {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}


*/
// -------------------- Music Service (YouTube API with Thumbnail Fix) --------------------
class MusicService {
  private static readonly API_KEY = "f92009fadfmshd3afbaa6d3fa492p18c379jsn54acf1eb095a";
  private static readonly HOST = "youtube138.p.rapidapi.com";

  // 🔍 Search songs on YouTube
  static async searchSongs(query: string, limit: number = 12): Promise<Song[]> {
    try {
      if (!MusicService.API_KEY) {
        console.warn("RapidAPI key not configured. Using fallback data.");
  return MusicService.getFallbackSongs(limit);
      }

      const response = await fetch(
        `https://${MusicService.HOST}/search/?q=${encodeURIComponent(query)}&hl=en&gl=US`,
        {
          method: "GET",
          headers: {
            "x-rapidapi-host": MusicService.HOST,
            "x-rapidapi-key": MusicService.API_KEY,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      const videos: Song[] = [];

      if (data.contents && Array.isArray(data.contents)) {
        data.contents
          .filter((item: any) => item.video && item.video.videoId)
          .slice(0, limit)
          .forEach((item: any, index: number) => {
            const video = item.video;
            const videoId = video.videoId;

            const song: Song = {
              id: videoId || `video_${index}`,
              name: this.extractTitle(video.title),
              artist: this.extractAuthor(video.author),
              album: "YouTube",
              preview: `https://www.youtube.com/watch?v=${videoId}`,
              // ✅ Always generate YouTube thumbnail directly
              image: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
              duration: MusicService.parseDuration(video.lengthText?.simpleText),
            };
            videos.push(song);
          });
      }

      return videos;
    } catch (error) {
      console.error("Error fetching songs:", error);
  return MusicService.getFallbackSongs(limit);
    }
  }

  private static extractTitle(title: any): string {
    if (!title) return "Unknown Title";
    if (typeof title === "string") return title;
    if (title.runs && Array.isArray(title.runs)) {
      return title.runs.map((run: any) => run.text || "").join(" ");
    }
    return title.text || "Unknown Title";
  }

  private static extractAuthor(author: any): string {
    if (!author) return "Unknown Artist";
    if (typeof author === "string") return author;
    if (author.title) return author.title;
    if (author.name) return author.name;
    return "Unknown Artist";
  }

  private static getFallbackSongs(limit: number): Song[] {
    // same fallback as before, no changes
    const meditationSongs: Song[] = [
      {
        id: "meditation_1",
        name: "Peaceful Meditation Music",
        artist: "Meditation Music",
        album: "Relaxation Sounds",
        preview: "https://www.youtube.com/watch?v=inpok4MKVLM",
        image: "https://img.youtube.com/vi/inpok4MKVLM/maxresdefault.jpg",
        duration: 1800,
      },
      {
        id: "meditation_2",
        name: "Nature Sounds for Sleep",
        artist: "Nature Sounds",
        album: "Sleep Music",
        preview: "https://www.youtube.com/watch?v=1ZYbU82GVz4",
        image: "https://img.youtube.com/vi/1ZYbU82GVz4/maxresdefault.jpg",
        duration: 3600,
      },
    ];
    return meditationSongs.slice(0, limit);
  }

  static async getMusicByCategory(category: string, limit: number = 6): Promise<Song[]> {
    const categoryQueries: CategoryQueries = {
      Meditation: "meditation relaxing music",
      Wellness: "wellness healing music",
      Nature: "nature sounds relaxation",
      Ambient: "ambient peaceful music",
      Classical: "classical soothing music",
    };

    const query = categoryQueries[category] || `${category.toLowerCase()} music`;
    return await this.searchSongs(query, limit);
  }

  private static parseDuration(duration: string | undefined): number | undefined {
    if (!duration) return undefined;
    const parts = duration.split(":").map(Number);
    if (parts.length === 2) return parts[0] * 60 + parts[1];
    if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
    return undefined;
  }

  static formatDuration(seconds: number): string {
    if (!seconds) return "N/A";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  }
}

// API service for fetching books
class BookService {
  static async searchBooks(query: string, limit: number = 12): Promise<Book[]> {
    try {
      const response = await fetch(
        `https://openlibrary.org/search.json?title=${encodeURIComponent(query)}&limit=${limit}`
      );
      const data: OpenLibraryResponse = await response.json();
      
      return data.docs.map((book: OpenLibraryBook): Book => ({
        id: book.key,
        name: book.title,
        author: book.author_name ? book.author_name.join(", ") : "Unknown Author",
        category: this.categorizeBook(book),
        rating: this.generateRating(),
        coverImage: book.cover_i ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg` : null,
        openLibraryUrl: `https://openlibrary.org${book.key}`,
        publishYear: book.first_publish_year,
        isbn: book.isbn ? book.isbn[0] : null,
        subjects: book.subject ? book.subject.slice(0, 3) : []
      }));
    } catch (error) {
      console.error("Error fetching books:", error);
      return [];
    }
  }

  static async getBooksByCategory(category: string, limit: number = 6): Promise<Book[]> {
    const categoryQueries: CategoryQueries = {
      'Self-Help': 'self help stress management',
      'Meditation': 'meditation mindfulness',
      'Creative Therapy': 'art therapy creative healing',
      'Psychology': 'psychology mental health',
      'Wellness': 'wellness healthy living'
    };
    
    const query = categoryQueries[category] || category.toLowerCase();
    return await this.searchBooks(query, limit);
  }

  static categorizeBook(book: OpenLibraryBook): string {
    const subjects = book.subject ? book.subject.join(' ').toLowerCase() : '';
    const title = book.title.toLowerCase();
    
    if (subjects.includes('meditation') || title.includes('meditation')) return 'Meditation';
    if (subjects.includes('self-help') || title.includes('self help')) return 'Self-Help';
    if (subjects.includes('psychology') || title.includes('psychology')) return 'Psychology';
    if (subjects.includes('art') || subjects.includes('creative')) return 'Creative Therapy';
    if (subjects.includes('wellness') || subjects.includes('health')) return 'Wellness';
    
    return 'Self-Help';
  }

  static generateRating(): string {
    return (Math.random() * 1 + 4).toFixed(1) + '/5';
  }
}

// Color mapping for different categories - using website's consistent color scheme
const categoryColors: CategoryColors = {
  Meditation: 'bg-primary-light text-primary',
  Movement: 'bg-sky-100 text-sky-700',
  Relaxation: 'bg-primary-light text-primary-dark',
  Education: 'bg-amber-100 text-amber-700',
  Lifestyle: 'bg-primary-light text-primary',
  Workplace: 'bg-orange-100 text-orange-700',
  'Self-Help': 'bg-primary-light text-primary',
  'Creative Therapy': 'bg-primary-light text-primary-dark',
  Health: 'bg-red-100 text-red-700',
  Psychology: 'bg-primary-light text-primary',
  Wellness: 'bg-primary-light text-primary'
};

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => (
  <div className="group bg-bgsecondary rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden transform hover:-translate-y-1">
    {/* Compact book cover container */}
    <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-gradient-to-br from-bgvariant to-bgprimary">
      {book.coverImage ? (
        <img
          src={book.coverImage}
          alt={book.name}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="absolute inset-0 flex flex-col items-center justify-center text-muted"><div class="text-4xl mb-2">📚</div><div class="text-sm">No Cover Available</div></div>';
            }
          }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
          <div className="text-4xl mb-2">📚</div>
          <div className="text-sm">No Cover Available</div>
        </div>
      )}
      
      {/* Hover overlay */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300"></div>
    </div>
    
    {/* Compact content container */}
    <div className="flex flex-col flex-grow p-3">
      {/* Title - compact height */}
      <h3 className="text-sm font-semibold text-based mb-1 leading-tight h-8 overflow-hidden">
        <span className="line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {book.name}
        </span>
      </h3>
      
      {/* Author - compact */}
      <p className="text-muted text-xs mb-2 h-4 overflow-hidden">
        <span className="line-clamp-1">by {book.author}</span>
      </p>
      
      {/* Category and Rating - compact */}
      <div className="flex items-center justify-between mb-2">
        <span className={`px-2 py-0.5 rounded-md text-xs font-medium transition-all duration-300 ${
          categoryColors[book.category] || 'bg-bgvariant text-muted'
        }`}>
          {book.category}
        </span>
        <span className="text-xs text-warning font-medium">
          ⭐ {book.rating}
        </span>
      </div>

      {/* Button - compact */}
      <div className="mt-auto">
        {book.openLibraryUrl ? (
          <a
            href={book.openLibraryUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full text-center py-2 px-3 rounded-md text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-all duration-200 shadow-sm"
          >
            View Details →
          </a>
        ) : (
          <div className="inline-block w-full text-center bg-bgvariant text-muted py-2 px-3 rounded-md text-xs font-medium cursor-not-allowed">
            No Details Available
          </div>
        )}
      </div>
    </div>
  </div>
);

interface SongCardProps {
  song: Song;
}

const SongCard: React.FC<SongCardProps> = ({ song }) => (
  <div className="group bg-bgsecondary rounded-lg shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col h-full overflow-hidden transform hover:-translate-y-1">
    {/* Compact album art container */}
    <div className="relative w-full h-32 sm:h-36 overflow-hidden bg-gradient-to-br from-primary-light to-bgvariant">
      {song.image ? (
        <img
          src={song.image}
          alt={song.album}
          className="absolute inset-0 w-full h-full object-cover object-center transition-all duration-700 group-hover:scale-110"
          loading="lazy"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const parent = target.parentElement;
            if (parent) {
              parent.innerHTML = '<div class="absolute inset-0 flex flex-col items-center justify-center text-muted"><div class="text-4xl mb-2">🎵</div><div class="text-sm">No Cover Available</div></div>';
            }
          }}
        />
      ) : (
        <div className="absolute inset-0 flex flex-col items-center justify-center text-muted">
          <div className="text-4xl mb-2">🎵</div>
          <div className="text-sm">No Cover Available</div>
        </div>
      )}
      
      {/* Hover overlay with play icon */}
      <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center">
        <div className="text-white text-4xl opacity-0 group-hover:opacity-100 transition-all duration-300 transform scale-75 group-hover:scale-100">
          ▶
        </div>
      </div>
    </div>
    
    {/* Compact content container */}
    <div className="flex flex-col flex-grow p-3">
      {/* Song title - compact */}
      <h3 className="text-sm font-semibold text-based mb-1 leading-tight h-8 overflow-hidden">
        <span className="line-clamp-2 group-hover:text-primary transition-colors duration-300">
          {song.name}
        </span>
      </h3>
      
      {/* Artist and Album - compact */}
      <p className="text-muted text-xs mb-1 h-4 overflow-hidden">
        <span className="line-clamp-1">by {song.artist}</span>
      </p>
      <p className="text-muted text-xs mb-2 h-4 overflow-hidden">
        <span className="line-clamp-1">{song.album}</span>
      </p>
      
      {/* Music info - compact */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs text-primary font-medium flex items-center">
          🎵 Music
        </span>
        {song.duration && (
          <span className="text-xs text-muted font-mono">
            {MusicService.formatDuration(song.duration)}
          </span>
        )}
      </div>

      {/* Button - compact */}
      <div className="mt-auto">
        {song.preview ? (
          <a
            href={song.preview}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block w-full text-center py-2 px-3 rounded-md text-xs font-medium bg-primary text-white hover:bg-primary-dark transition-all duration-200 shadow-sm"
          >
            ▶ Play on YouTube
          </a>
        ) : (
          <div className="inline-block w-full text-center bg-bgvariant text-muted py-2 px-3 rounded-md text-xs font-medium cursor-not-allowed">
            No Preview Available
          </div>
        )}
      </div>
    </div>
  </div>
);

const SoulStation: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchBooks, setSearchBooks] = useState<Book[]>([]);
  const [searchSongs, setSearchSongs] = useState<Song[]>([]);
  const [searching, setSearching] = useState<boolean>(false);
  const [contentType, setContentType] = useState<ContentType>('books');

  useEffect(() => {
    initializeDefaultContent();
  }, []);

  const initializeDefaultContent = async (): Promise<void> => {
    setLoading(true);
    try {
      const [booksData, musicData] = await Promise.all([
        initializeBooks(),
        initializeMusic()
      ]);
      
      setBooks(booksData);
      setSongs(musicData);
    } catch (error) {
      console.error("Error loading content:", error);
    }
    setLoading(false);
  };

  const initializeBooks = async (): Promise<Book[]> => {
    try {
      const selfHelpBooks = await BookService.getBooksByCategory('Self-Help', 3);
      const meditationBooks = await BookService.getBooksByCategory('Meditation', 3);
      const therapyBooks = await BookService.getBooksByCategory('Creative Therapy', 3);
      
      return [...selfHelpBooks, ...meditationBooks, ...therapyBooks];
    } catch (error) {
      console.error("Error loading books:", error);
      return [
        {
          id: '1',
          name: "The Stress-Free Mind",
          author: "Dr. John Martinez",
          category: "Self-Help",
          rating: "4.6/5"
        },
        {
          id: '2',
          name: "Peaceful Evenings",
          author: "Lisa Chang",
          category: "Meditation",
          rating: "4.8/5"
        },
        {
          id: '3',
          name: "Stress Relief Through Art",
          author: "Michael Reed",
          category: "Creative Therapy",
          rating: "4.7/5"
        }
      ];
    }
  };

  const initializeMusic = async (): Promise<Song[]> => {
    try {
      const meditationMusic = await MusicService.getMusicByCategory('Meditation', 3);
      const ambientMusic = await MusicService.getMusicByCategory('Ambient', 3);
      const natureMusic = await MusicService.getMusicByCategory('Nature', 3);
      
      return [...meditationMusic, ...ambientMusic, ...natureMusic];
    } catch (error) {
      console.error("Error loading music:", error);
      return [];
    }
  };

  const handleSearch = async (e: React.MouseEvent<HTMLButtonElement> | React.KeyboardEvent<HTMLInputElement>): Promise<void> => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    
    setSearching(true);
    try {
      if (contentType === 'books') {
        const results = await BookService.searchBooks(searchQuery, 12);
        setSearchBooks(results);
        setSearchSongs([]);
      } else {
        // Add timestamp to make music search unique each time
        const uniqueQuery = `${searchQuery} ${Date.now()}`;
        const results = await MusicService.searchSongs(uniqueQuery, 12);
        setSearchSongs(results);
        setSearchBooks([]);
      }
    } catch (error) {
      console.error(`Error searching ${contentType}:`, error);
    }
    setSearching(false);
  };

  const clearSearch = (): void => {
    setSearchQuery("");
    setSearchBooks([]);
    setSearchSongs([]);
  };

  const handleCategorySearch = async (category: string): Promise<void> => {
    try {
      if (contentType === 'books') {
        const results = await BookService.getBooksByCategory(category, 12);
        setSearchBooks(results);
        setSearchSongs([]);
      } else {
        const results = await MusicService.getMusicByCategory(category, 12);
        setSearchSongs(results);
        setSearchBooks([]);
      }
    } catch (error) {
      console.error(`Error searching ${contentType} category:`, error);
    }
  };

  const switchContentType = (type: ContentType): void => {
    setContentType(type);
    clearSearch();
  };

  return (
    <Wrapper>
      <div className="min-h-screen bg-bgprimary p-4">
        <div className="max-w-7xl mx-auto">
          {/* Removed BackButton */}
          
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text__gradient mb-4">
              Resource Hub
            </h1>
            <p className="text-muted text-lg max-w-2xl mx-auto">
              Discover books and music that nourish your soul and elevate your spirit
            </p>
          </div>
        
        {/* Content Type Switcher */}
        <div className="bg-bgsecondary rounded-2xl shadow-lg border border-bgvariant p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-semibold text-based">
              Find Content for Your Soul
            </h2>
            <div className="flex bg-bgvariant rounded-xl p-1.5">
              <button
                onClick={() => switchContentType('books')}
                className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  contentType === 'books'
                    ? 'btn__primary'
                    : 'text-muted hover:text-primary hover:bg-primary-light'
                }`}
              >
                📚 Books
              </button>
              <button
                onClick={() => switchContentType('music')}
                className={`px-4 sm:px-6 py-2.5 rounded-lg text-sm font-medium transition-all duration-300 ${
                  contentType === 'music'
                    ? 'btn__primary'
                    : 'text-muted hover:text-primary hover:bg-primary-light'
                }`}
              >
                🎵 Music
              </button>
            </div>
          </div>
          
          {/* Category Filter Options */}
          <div className="mb-6 bg-bgprimary rounded-xl border border-bgvariant p-4">
            <h3 className="text-sm font-medium text-muted mb-3">
              Browse by Category
            </h3>
            <div className="flex flex-wrap gap-2">
              {contentType === 'books'
                ? Object.keys(categoryColors).map((category: string) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySearch(category)}
                      className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md transform ${categoryColors[category]}`}
                    >
                      {category}
                    </button>
                  ))
                : ['Meditation', 'Wellness', 'Nature', 'Ambient', 'Classical'].map((category: string) => (
                    <button
                      key={category}
                      onClick={() => handleCategorySearch(category)}
                      className="px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-300 hover:scale-105 hover:shadow-md transform bg-primary-light text-primary hover:bg-primary hover:text-white"
                    >
                      {category}
                    </button>
                  ))
              }
            </div>
          </div>
          
          {/* Search Input */}
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              placeholder={`Search for ${contentType === 'books' ? 'books about mindfulness, meditation, wellness...' : 'relaxing music, meditation sounds, ambient music...'}`}
              value={searchQuery}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchQuery(e.target.value)}
              className="flex-1 p-3 sm:p-4 border border-bgvariant rounded-xl bg-bgsecondary focus:ring-2 focus:ring-primary focus:border-transparent text-sm placeholder-muted transition-all duration-300"
              onKeyPress={(e: React.KeyboardEvent<HTMLInputElement>) => e.key === 'Enter' && handleSearch(e)}
            />
            <button
              onClick={handleSearch}
              disabled={searching}
              className="btn__primary px-6 sm:px-8 py-3 sm:py-4 font-medium disabled:opacity-50 text-sm whitespace-nowrap"
            >
              {searching ? "Searching..." : "Search"}
            </button>
            {(searchBooks.length > 0 || searchSongs.length > 0) && (
              <button
                onClick={clearSearch}
                className="btn px-6 sm:px-8 py-3 sm:py-4 font-medium text-sm whitespace-nowrap"
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search Results */}
        {(searchBooks.length > 0 || searchSongs.length > 0) && (
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-semibold text-based mb-6">
              Search Results ({contentType === 'books' ? searchBooks.length : searchSongs.length} {contentType} found)
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
              {contentType === 'books'
                ? searchBooks.map((book: Book, index: number) => (
                    <BookCard key={book.id || index} book={book} />
                  ))
                : searchSongs.map((song: Song, index: number) => (
                    <SongCard key={song.id || index} song={song} />
                  ))
              }
            </div>
          </div>
        )}

        {/* Default Wellness Content */}
        <div>
          <h2 className="text-2xl sm:text-3xl font-semibold text-based mb-6">
            {(searchBooks.length > 0 || searchSongs.length > 0) 
              ? `Recommended Wellness ${contentType === 'books' ? 'Books' : 'Music'}` 
              : `Curated Wellness ${contentType === 'books' ? 'Collection' : 'Playlist'}`}
          </h2>
          
          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
              {[...Array(14)].map((_, i: number) => (
                <div key={i} className="bg-bgsecondary rounded-xl shadow-lg animate-pulse h-48">
                  <div className="w-full h-32 bg-bgvariant rounded-t-xl mb-3"></div>
                  <div className="p-3">
                    <div className="h-3 bg-bgvariant rounded mb-2"></div>
                    <div className="h-2 bg-bgvariant rounded mb-2 w-3/4"></div>
                    <div className="h-2 bg-bgvariant rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 2xl:grid-cols-7 gap-3 sm:gap-4">
              {contentType === 'books'
                ? books.map((book: Book, index: number) => (
                    <BookCard key={book.id || index} book={book} />
                  ))
                : songs.map((song: Song, index: number) => (
                    <SongCard key={song.id || index} song={song} />
                  ))
              }
            </div>
          )}
        </div>


        </div>
      </div>
    </Wrapper>
  );
};

export default SoulStation;