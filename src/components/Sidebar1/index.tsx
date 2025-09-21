import React, { useEffect } from 'react';
import './Sidebar.css';

import { FaTimes, FaUser } from 'react-icons/fa';
import { sidebar } from '../../source1';
import { FaSquarePen } from 'react-icons/fa6';
import { BrainCircuit } from 'lucide-react';

interface SidebarProps {
  show: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ show, onClose }) => {

  // Handle escape key to close sidebar
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && show) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [show, onClose]);

  return (
    <>
      {show && <div className="sidebar__overlay" onClick={onClose}></div>}
      <aside className={`sidebar ${show ? 'show' : ''}`}>
        <div className="top">
          <div className="logo__container">
            <BrainCircuit className="icon" />
            <span>
              Soul<span className="text-primary">Sync</span>
            </span>
          </div>
          <div className="icon__container cancel__btn" onClick={onClose}>
            <FaTimes />
          </div>
        </div>
        
        <div className="middle">
          <button className="btn btn__primary">
            <FaSquarePen />
            <span>New Message</span>
          </button>
          
          <div className="tabs__container">
            {sidebar.map((list, index) => (
              <h3
                className={`tab ${list.route === '/' ? 'active' : ''}`}
                key={index}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    // Handle navigation here
                    console.log(`Navigate to ${list.route}`);
                  }
                }}
              >
                {list.icon}
                <span className="name">{list.name}</span>
                {list.notificationCount && (
                  <div className="count">{list.notificationCount}</div>
                )}
              </h3>
            ))}
          </div>

        </div>

        {/* Optional: Add a bottom section for user profile */}
        <div className="bottom">
          <div className="user-profile">
            <div className="user-avatar">
              <FaUser />
            </div>
            <div className="user-info">
              <div className="user-name">John Doe</div>
              <div className="user-status">Online</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;