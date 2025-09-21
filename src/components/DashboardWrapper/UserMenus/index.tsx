import { useState, useEffect } from 'react';

// Define interfaces
interface UserMenusProps {
  onClose: () => void;
}

type MessageType = 'hydration' | 'nutrition' | 'meditation' | 'spiritual';

interface Message {
  id: number;
  text: string;
  type: MessageType;
}

const UserMenus: React.FC<UserMenusProps> = ({ onClose }) => {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);

  const messages: Message[] = [
    { id: 1, text: "Stay hydrated! Your brain is 75% water.", type: "hydration" },
    { id: 2, text: "Eat colorful foods for better mood regulation.", type: "nutrition" },
    { id: 3, text: "5 minutes of deep breathing can reduce anxiety.", type: "meditation" },
    { id: 4, text: "Practice gratitude to boost mental wellbeing.", type: "spiritual" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMessageIndex((prevIndex) => (prevIndex + 1) % messages.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [messages.length]);

  const getMessageColor = (type: MessageType): string => {
    const colors: Record<MessageType, string> = {
      hydration: "text-blue-600",
      nutrition: "text-green-600", 
      meditation: "text-purple-600",
      spiritual: "text-orange-600"
    };
    return colors[type] || "text-gray-600";
  };

  return (
    <div className="user-menus-dropdown">
      <div className="user-menus-header">
        <h3>Daily Wellness Tip</h3>
        <button onClick={onClose} className="close-btn">×</button>
      </div>
      <div className="wellness-tip">
        <p className={`tip-text ${getMessageColor(messages[currentMessageIndex].type)}`}>
          {messages[currentMessageIndex].text}
        </p>
        <div className="tip-indicators">
          {messages.map((_, index) => (
            <div
              key={index}
              className={`indicator ${index === currentMessageIndex ? 'active' : ''}`}
              onClick={() => setCurrentMessageIndex(index)}
            />
          ))}
        </div>
      </div>
      <div className="menu-actions">
        <button className="menu-btn">Profile Settings</button>
        <button className="menu-btn">Health Goals</button>
        <button className="menu-btn danger">Sign Out</button>
      </div>
    </div>
  );
};

export default UserMenus;