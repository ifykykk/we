import { useState, useRef, useEffect } from 'react';
import { Plus, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, X } from 'lucide-react';
import { useUser } from '@clerk/clerk-react';

declare module 'react' {
  interface StyleHTMLAttributes<T> extends React.HTMLAttributes<T> {
    jsx?: boolean;
    global?: boolean;
  }
}

// Define interfaces for different task types
interface VideoTask {
  id: string;
  name: string;
  duration: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  type: 'videos';
}

interface BlogTask {
  id: string;
  name: string;
  readTime: string;
  category: string;
  author: string;
  completed: boolean;
  type: 'blogs';
}

interface BookTask {
  id: string;
  name: string;
  author: string;
  category: string;
  priority: 'low' | 'medium' | 'high';
  completed: boolean;
  type: 'books';
}

interface PodcastTask {
  id: string;
  name: string;
  duration: string;
  category: string;
  host: string;
  completed: boolean;
  type: 'podcasts';
}

type TaskItem = VideoTask | BlogTask | BookTask | PodcastTask;

interface TaskData {
  videos: VideoTask[];
  blogs: BlogTask[];
  books: BookTask[];
  podcasts: PodcastTask[];
}

type TabType = keyof TaskData;

// Use website theme colors instead of random colors
const getTaskColor = (type: string) => {
  const colors = {
    videos: '#2563eb',    // primary
    blogs: '#0ea5e9',     // success
    books: '#f59e0b',     // warning
    podcasts: '#3b82f6',  // primary-accent
    default: '#2563eb'    // primary
  };
  return colors[type as keyof typeof colors] || colors.default;
};

const getTaskBgColor = (type: string) => {
  const colors = {
    videos: 'rgba(37, 99, 235, 0.1)',    // primary with opacity
    blogs: 'rgba(14, 165, 233, 0.1)',    // success with opacity
    books: 'rgba(245, 158, 11, 0.1)',    // warning with opacity
    podcasts: 'rgba(59, 130, 246, 0.1)', // primary-accent with opacity
    default: 'rgba(37, 99, 235, 0.1)'    // primary with opacity
  };
  return colors[type as keyof typeof colors] || colors.default;
};

const TodoTaskList = () => {
  const { user } = useUser();
  const [activeTab, setActiveTab] = useState<TabType>('videos');
  const [tasks, setTasks] = useState<TaskData>({
    videos: [],
    blogs: [],
    books: [],
    podcasts: []
  });
  const [hoveredTab, setHoveredTab] = useState<TabType | null>(null);
  const [showAddForm, setShowAddForm] = useState<TabType | null>(null);
  const [newTaskName, setNewTaskName] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const resourcesRef = useRef<HTMLDivElement>(null);

  // Load tasks on component mount
  useEffect(() => {
    if (user?.primaryEmailAddress?.emailAddress) {
      loadTasksFromAPI();
    }
  }, [user]);

  // Load tasks from API
  const loadTasksFromAPI = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      
      if (!userEmail) {
        setError('No user email found');
        return;
      }

      const response = await fetch(`http://localhost:3000/user/${userEmail}/tasks`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch tasks: ${response.statusText}`);
      }
      
      const tasksByType = await response.json();
      setTasks(tasksByType);
      
    } catch (error) {
      console.error('Error loading tasks:', error);
      setError(error instanceof Error ? error.message : 'Failed to load tasks');
      // Initialize empty tasks on error
      setTasks({
        videos: [],
        blogs: [],
        books: [],
        podcasts: []
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddTask = async (tabType: TabType) => {
    if (!newTaskName.trim()) return;

    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) {
        setError('No user email found');
        return;
      }

      const commonFields = {
        name: newTaskName,
        type: tabType,
        category: 'General',
      };

      let taskData: Partial<TaskItem>;

      switch (tabType) {
        case 'videos':
          taskData = { ...commonFields, duration: '30 min', priority: 'medium' };
          break;
        case 'blogs':
          taskData = { ...commonFields, readTime: '5 min', author: 'You' };
          break;
        case 'books':
          taskData = { ...commonFields, author: 'Unknown', priority: 'medium' };
          break;
        case 'podcasts':
          taskData = { ...commonFields, duration: '30 min', host: 'Unknown' };
          break;
        default:
          return;
      }

      const response = await fetch(`http://localhost:3000/user/${userEmail}/tasks`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData)
      });

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.statusText}`);
      }

      const newTask = await response.json();
      
      // Update local state
      setTasks(prev => ({
        ...prev,
        [tabType]: [...prev[tabType], newTask]
      }));

      // Dispatch event to update chart
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      
      setNewTaskName('');
      setShowAddForm(null);
      setError(null);
      
    } catch (error) {
      console.error('Error adding task:', error);
      setError(error instanceof Error ? error.message : 'Failed to add task');
    }
  };

  const toggleTaskComplete = async (id: string, tabType: TabType) => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      const currentTask = tasks[tabType].find(task => task.id === id);
      if (!currentTask) return;

      const response = await fetch(`http://localhost:3000/user/${userEmail}/tasks/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          completed: !currentTask.completed
        })
      });

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.statusText}`);
      }

      const updatedTask = await response.json();
      
      // Update local state
      setTasks(prev => ({
        ...prev,
        [tabType]: prev[tabType].map(task => 
          task.id === id ? { ...task, completed: updatedTask.completed } : task
        )
      }));

      // Dispatch event to update chart
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      setError(null);
      
    } catch (error) {
      console.error('Error updating task:', error);
      setError(error instanceof Error ? error.message : 'Failed to update task');
    }
  };

  const deleteTask = async (id: string, tabType: TabType) => {
    try {
      const userEmail = user?.primaryEmailAddress?.emailAddress;
      if (!userEmail) return;

      const response = await fetch(`http://localhost:3000/user/${userEmail}/tasks/${id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.statusText}`);
      }

      // Update local state
      setTasks(prev => ({
        ...prev,
        [tabType]: prev[tabType].filter(task => task.id !== id)
      }));

      // Dispatch event to update chart
      window.dispatchEvent(new CustomEvent('taskUpdated'));
      setError(null);
      
    } catch (error) {
      console.error('Error deleting task:', error);
      setError(error instanceof Error ? error.message : 'Failed to delete task');
    }
  };

  const scrollVertical = (direction: 'up' | 'down') => {
    if (resourcesRef.current) {
      const scrollAmount = 200;
      resourcesRef.current.scrollBy({
        top: direction === 'down' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const scrollHorizontal = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 150;
      scrollContainerRef.current.scrollBy({
        left: direction === 'right' ? scrollAmount : -scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (isLoading) {
    return (
      <div className="w-full h-screen bg-white shadow-lg border border-gray-200 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your tasks from database...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gradient-to-br from-white to-gray-50 shadow-md border border-gray-200 relative overflow-hidden rounded-xl">
      {/* Error Display */}
      {error && (
        <div className="absolute top-16 left-1/2 transform -translate-x-1/2 bg-red-50 border-l-4 border-red-500 text-red-700 px-4 py-3 rounded shadow-lg z-20 max-w-md">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium">{error}</span>
            <button 
              onClick={() => setError(null)}
              className="ml-4 text-red-500 hover:text-red-700"
            >
              <X size={16} />
            </button>
          </div>
        </div>
      )}

      {/* Scroll Navigation Buttons - More subtle and professional */}
      <div className="absolute top-4 right-4 flex gap-1 z-10">
        <button
          onClick={() => scrollVertical('up')}
          className="p-1.5 bg-white text-gray-600 rounded-md hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
          aria-label="Scroll up"
        >
          <ChevronUp size={16} />
        </button>
        <button
          onClick={() => scrollVertical('down')}
          className="p-1.5 bg-white text-gray-600 rounded-md hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
          aria-label="Scroll down"
        >
          <ChevronDown size={16} />
        </button>
        <button
          onClick={() => scrollHorizontal('left')}
          className="p-1.5 bg-white text-gray-600 rounded-md hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
          aria-label="Scroll left"
        >
          <ChevronLeft size={16} />
        </button>
        <button
          onClick={() => scrollHorizontal('right')}
          className="p-1.5 bg-white text-gray-600 rounded-md hover:bg-gray-100 transition-colors shadow-sm border border-gray-200"
          aria-label="Scroll right"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="p-6 h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Task Manager</h1>
            <p className="text-sm text-gray-500 mt-1">Organize and track your learning resources</p>
          </div>
          <div className="flex gap-2">
            <div className="text-xs text-gray-600 bg-green-50 px-2 py-1 rounded-md border border-green-100 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-green-500 rounded-full mr-1.5"></span>
              Database Connected
            </div>
            <div className="text-xs text-gray-600 bg-blue-50 px-2 py-1 rounded-md border border-blue-100 flex items-center">
              <span className="inline-block w-1.5 h-1.5 bg-blue-500 rounded-full mr-1.5"></span>
              Progress Synced
            </div>
          </div>
        </div>
        
        {/* Navigation Tabs - Themed and consistent */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-1 mb-4 overflow-x-auto pb-1 scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {Object.keys(tasks).map((tab) => (
            <div
              key={tab}
              className="relative flex-shrink-0"
              onMouseEnter={() => setHoveredTab(tab as TabType)}
              onMouseLeave={() => setHoveredTab(null)}
            >
              <button
                onClick={() => setActiveTab(tab as TabType)}
                className={`px-4 py-2 rounded-md font-medium transition-all capitalize flex items-center gap-2 text-sm ${
                  activeTab === tab
                    ? `bg-${getTaskColor(tab)} text-white shadow-sm`
                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                }`}
              >
                {tab === 'videos' && '🎬'}
                {tab === 'blogs' && '📝'}
                {tab === 'books' && '📚'}
                {tab === 'podcasts' && '🎧'}
                {tab}
                <span className="text-xs px-1.5 py-0.5 rounded-full"
                  style={{
                    backgroundColor: activeTab === tab ? 'rgba(255, 255, 255, 0.2)' : getTaskBgColor(tab),
                    color: activeTab === tab ? 'white' : getTaskColor(tab)
                  }}
                >
                  {tasks[tab as TabType].length}
                </span>
              </button>
              
              {/* Hover Add Button - Themed */}
              {hoveredTab === tab && (
                <button
                  onClick={() => setShowAddForm(tab as TabType)}
                  className="absolute -top-2 -right-2 text-white rounded-full p-1 shadow-sm transition-colors z-10"
                  style={{ backgroundColor: getTaskColor(tab) }}
                  aria-label={`Add new ${tab}`}
                >
                  <Plus size={14} />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Add Task Form - More professional */}
        {showAddForm && (
          <div className="mb-4 p-3 bg-white rounded-md border border-gray-200 shadow-sm">
            <div className="flex gap-2">
              <input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder={`Add new ${showAddForm} task...`}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm"
                onKeyPress={(e) => e.key === 'Enter' && handleAddTask(showAddForm)}
                autoFocus
              />
              <button
                onClick={() => handleAddTask(showAddForm)}
                disabled={!newTaskName.trim()}
                className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Add Task
              </button>
              <button
                onClick={() => {
                  setShowAddForm(null);
                  setNewTaskName('');
                }}
                className="px-2 py-2 bg-white text-gray-500 rounded-md hover:bg-gray-50 transition-colors border border-gray-200"
                aria-label="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}

        {/* Tasks Grid - More professional and consistent */}
        <div 
          ref={resourcesRef}
          className="flex-1 overflow-y-auto space-y-2 pr-1 scrollbar-thin scrollbar-thumb-gray-200 scrollbar-track-transparent"
        >
          {tasks[activeTab].length === 0 ? (
            <div className="text-center py-12 bg-white/80 rounded-lg border border-dashed border-gray-200">
              <div className="text-4xl mb-3 opacity-40">📋</div>
              <p className="text-base text-muted font-medium">No tasks yet</p>
              <p className="text-xs mt-1 text-muted/70">Click the + button on a tab to add your first task</p>
            </div>
          ) : (
            tasks[activeTab].map((task: TaskItem) => (
              <div
                key={task.id}
                className={`p-4 rounded-md border transition-all hover:shadow-sm ${
                  task.completed 
                    ? 'bg-gray-50/60 border-gray-200 opacity-80' 
                    : 'bg-white border-gray-200 hover:border-primary/30'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <input
                      type="checkbox"
                      checked={task.completed}
                      onChange={() => toggleTaskComplete(task.id, activeTab)}
                      className="mt-1 w-4 h-4 text-primary rounded focus:ring-primary/50"
                    />
                    
                    <div className="flex-1">
                      <h3 className={`text-base font-medium ${
                        task.completed ? 'line-through text-muted' : 'text-based'
                      }`}>
                        {task.name}
                      </h3>
                      
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span
                          className="text-xs px-2 py-0.5 rounded-md font-medium border"
                          style={{
                            background: getTaskBgColor(task.type),
                            color: getTaskColor(task.type),
                            borderColor: `${getTaskColor(task.type)}30`
                          }}
                        >
                          {task.category}
                        </span>
                        
                        {'priority' in task && task.priority && (
                          <span className={`text-xs px-2 py-0.5 rounded-md font-medium border ${
                            task.priority === 'high' ? 'bg-danger/10 text-danger border-danger/20' :
                            task.priority === 'medium' ? 'bg-warning/10 text-warning border-warning/20' :
                            'bg-success/10 text-success border-success/20'
                          }`}>
                            {task.priority}
                          </span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap gap-3 mt-2 text-xs text-gray-500">
                        {'duration' in task && task.duration && (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            {task.duration}
                          </span>
                        )}
                        {'readTime' in task && task.readTime && (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                            </svg>
                            {task.readTime}
                          </span>
                        )}
                        {'author' in task && task.author && (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                            </svg>
                            {task.author}
                          </span>
                        )}
                        {'host' in task && task.host && (
                          <span className="flex items-center">
                            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                            </svg>
                            {task.host}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => deleteTask(task.id, activeTab)}
                    className="text-muted hover:text-danger p-1 rounded hover:bg-gray-50/50 transition-colors"
                    title="Delete task"
                    aria-label="Delete task"
                  >
                    <X size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
        
        {/* Task Summary - More professional */}
        <div className="mt-4 pt-3 border-t border-gray-200 flex-shrink-0">
          <div className="flex flex-wrap justify-between text-sm text-muted gap-2">
            <div className="flex items-center">
              <span className="font-medium">Total:</span>
              <span className="ml-1 bg-gray-100 px-2 py-0.5 rounded-md text-xs">{tasks[activeTab].length}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-success">Completed:</span>
              <span className="ml-1 bg-success/10 text-success px-2 py-0.5 rounded-md text-xs">{tasks[activeTab].filter(task => task.completed).length}</span>
            </div>
            <div className="flex items-center">
              <span className="font-medium text-primary">Pending:</span>
              <span className="ml-1 bg-primary/10 text-primary px-2 py-0.5 rounded-md text-xs">{tasks[activeTab].filter(task => !task.completed).length}</span>
            </div>
          </div>
          <div className="mt-2 text-xs text-center text-muted flex items-center justify-center">
            <svg className="w-3 h-3 mr-1 text-success" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </svg>
            Changes automatically saved and synced with Progress Tracker
          </div>
        </div>
      </div>
      
  <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-thin::-webkit-scrollbar {
          width: 4px;
        }
        .scrollbar-thumb-gray-200::-webkit-scrollbar-thumb {
          background-color: #e5e7eb;
          border-radius: 2px;
        }
        .scrollbar-track-transparent::-webkit-scrollbar-track {
          background-color: transparent;
        }
      `}</style>
    </div>
  );
};

export default TodoTaskList;