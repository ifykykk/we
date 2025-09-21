import { useState } from 'react';
import "./Farmers.css";
import { soulResources } from '../../source1';

// Define interfaces for the different resource types
interface VideoResource {
  name: string;
  duration: string;
  category: string;
  rating: string;
}

interface BlogResource {
  name: string;
  readTime: string;
  category: string;
  author: string;
}

interface BookResource {
  name: string;
  author: string;
  category: string;
  rating: string;
}

interface PodcastResource {
  name: string;
  duration: string;
  category: string;
  host: string;
}

// Union type for all resource types
type ResourceItem = VideoResource | BlogResource | BookResource | PodcastResource;

// Type for the soulResources structure
interface SoulResourcesType {
  videos: VideoResource[];
  blogs: BlogResource[];
  books: BookResource[];
  podcasts: PodcastResource[];
}

type TabType = keyof SoulResourcesType;

const SoulStation = () => {
  const [activeTab, setActiveTab] = useState<TabType>('videos');

  const getStatusColor = (category: string): string => {
    const colorMap: Record<string, string> = {
      'Meditation': 'var(--color-success)',
      'Movement': 'var(--color-warning)',
      'Education': 'var(--color-primary)',
      'Lifestyle': 'var(--color-success)',
      'Workplace': 'var(--color-warning)',
      'Self-Help': 'var(--color-success)',
      'Creative Therapy': 'var(--color-primary)',
      'Health': 'var(--color-warning)',
      'Relaxation': 'var(--color-success)'
    };
    return colorMap[category] || 'var(--color-primary)';
  };

  // Function to determine which columns to show based on active tab
  const getTableHeaders = (): string[] => {
    switch(activeTab) {
      case 'videos':
        return ['Name', 'Category', 'Duration', 'Rating'];
      case 'blogs':
        return ['Name', 'Category', 'Read Time', 'Author'];
      case 'books':
        return ['Name', 'Category', 'Author', 'Rating'];
      case 'podcasts':
        return ['Name', 'Category', 'Duration', 'Host'];
      default:
        return [];
    }
  };

  // Type assertion for soulResources to ensure proper typing
  const typedSoulResources = soulResources as SoulResourcesType;

  return (
    <div className='soul__station'>
      <h1>Soul Station</h1>

      {/* Tab Navigation */}
      <div className="tabs__container">
        {Object.keys(typedSoulResources).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab as TabType)}
            className={`tab__button ${activeTab === tab ? 'active' : ''}`}
          >
            {tab}
          </button>
        ))}
      </div>

      <table>
        <thead>
          <tr>
            {getTableHeaders().map((header, index) => (
              <th key={index}>{header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {typedSoulResources[activeTab].map((item: ResourceItem, index: number) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td className="status">
                <div
                  className="dot"
                  style={{ backgroundColor: getStatusColor(item.category) }}
                />
                <small>{item.category}</small>
              </td>
              {/* Conditional rendering based on content type */}
              {activeTab === 'videos' && (
                <>
                  <td>{(item as VideoResource).duration}</td>
                  <td>{(item as VideoResource).rating}</td>
                </>
              )}
              {activeTab === 'blogs' && (
                <>
                  <td>{(item as BlogResource).readTime}</td>
                  <td>{(item as BlogResource).author}</td>
                </>
              )}
              {activeTab === 'books' && (
                <>
                  <td>{(item as BookResource).author}</td>
                  <td>{(item as BookResource).rating}</td>
                </>
              )}
              {activeTab === 'podcasts' && (
                <>
                  <td>{(item as PodcastResource).duration}</td>
                  <td>{(item as PodcastResource).host}</td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SoulStation;