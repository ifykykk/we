import { useState, useEffect, useRef } from 'react';
import { API_KEYS } from '../../config/apiKeys';
import './TavusVideoChat.css';

interface ConversationData {
  conversation_id: string;
  conversation_url: string;
  status: string;
  replica_id: string;
  persona_id: string;
  conversation_name: string;
  custom_greeting: string;
  conversational_context: string;
  audio_only: boolean;
  memory_stores: string[];
  properties: {
    participant_left_timeout: number;
    language: string;
  };
}

interface TavusVideoChatProps {
  onClose?: () => void;
}

const TavusVideoChat: React.FC<TavusVideoChatProps> = ({ onClose }) => {
  const [conversationData, setConversationData] = useState<ConversationData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVideoReady, setIsVideoReady] = useState(false);
  const [isConversationActive, setIsConversationActive] = useState(false);
  const videoRef = useRef<HTMLIFrameElement>(null);

  const startConversation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Create the request body
      const requestBody = {
        replica_id: "r6ca16dbe104",
        conversation_name: "Copemate",
        persona_id: "p5447d939b60",
        custom_greeting: "Hi there, how can I help you today?",
        conversational_context: `You are a virtual talking psychiatrist designed to support college students facing anxiety, depression, burnout, sleep problems, academic stress, and social isolation. Speak in a warm, empathetic, stigma-free, and non-judgmental way. Start by welcoming the student, explaining confidentiality, and asking for consent to talk. Provide brief check-in questions to understand distress level, and if safe, guide them through coping strategies such as breathing exercises, grounding, or relaxation tips. When needed, offer psychoeducational resources like videos, relaxation audios, and wellness guides in regional languages. If the student wants further help, allow them to book confidential appointments with counsellors or join moderated peer support groups. Always keep answers short, supportive, and personalized. If the student expresses self-harm or harm to others, immediately activate the crisis response: calmly encourage them to contact emergency services or helplines and escalate to a human counsellor. Never judge, never give harmful instructions, and always reassure the student that reaching out is a brave step.`,
        audio_only: false,
        memory_stores: ["aditi_pfb078329b77", "aditi_p0f105b5b82e"],
        properties: {
          participant_left_timeout: 0,
          language: "hindi",
        },
      };

      console.log("Starting Tavus conversation with API key:", API_KEYS.TAVUS_API_KEY);
      console.log("Request body:", requestBody);

      const response = await fetch("http://localhost:3000/tavus/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      console.log("Response status:", response.status);
      console.log("Response headers:", response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        console.error("Error response:", errorText);
        throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
      }

      const data = await response.json();
      console.log("Tavus response:", data);
      setConversationData(data);
      setIsConversationActive(true);
    } catch (error) {
      console.error("Error starting conversation:", error);
      if (error instanceof Error) {
        if (error.message.includes('CORS')) {
          setError('CORS error: Please check if the API allows requests from your domain');
        } else if (error.message.includes('401')) {
          setError('Authentication failed: Please check your API key');
        } else if (error.message.includes('403')) {
          setError('Access forbidden: Please check your API permissions');
        } else {
          setError(`Connection error: ${error.message}`);
        }
      } else {
        setError('Failed to start conversation. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const endConversation = () => {
    setIsConversationActive(false);
    setConversationData(null);
    setIsVideoReady(false);
    setError(null);
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      if (isConversationActive) {
        endConversation();
      }
    };
  }, [isConversationActive]);

  const handleVideoLoad = () => {
    setIsVideoReady(true);
  };

  // Removed auto-start functionality - conversations now start manually

  return (
    <div className="tavus-video-chat">
      <div className="tavus-header">
        <div className="tavus-title">
          <h2>🤖 Copemate - Virtual Mental Health Assistant</h2>
          <p>Your AI-powered mental health companion is here to help</p>
        </div>
        {onClose && (
          <button className="close-button" onClick={onClose}>
            ✕
          </button>
        )}
      </div>

      <div className="tavus-content">
        {isLoading && (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Starting your conversation with Copemate...</p>
          </div>
        )}

        {error && (
          <div className="error-container">
            <div className="error-icon">⚠️</div>
            <h3>Connection Error</h3>
            <p>{error}</p>
            {error.includes('maximum concurrent conversations') && (
              <div className="concurrent-limit-notice">
                <p><strong>Note:</strong> There are too many active conversations. Please wait a moment and try again, or end any existing conversations first.</p>
              </div>
            )}
            <button className="retry-button" onClick={startConversation}>
              Try Again
            </button>
          </div>
        )}

        {conversationData && isConversationActive && (
          <div className="video-container">
            <div className="video-wrapper">
              <iframe
                ref={videoRef}
                src={conversationData.conversation_url}
                title="Copemate Video Chat"
                className="tavus-video-iframe"
                onLoad={handleVideoLoad}
                allow="camera; microphone; autoplay; encrypted-media"
                allowFullScreen
              />
              {!isVideoReady && (
                <div className="video-loading">
                  <div className="loading-spinner"></div>
                  <p>Loading video stream...</p>
                </div>
              )}
            </div>
            
            <div className="conversation-controls">
              <div className="conversation-info">
                <span className="status-indicator active"></span>
                <span>Conversation Active</span>
              </div>
              <button 
                className="end-conversation-btn"
                onClick={endConversation}
              >
                End Conversation
              </button>
            </div>
          </div>
        )}

        {!isConversationActive && !isLoading && !error && (
          <div className="welcome-container">
            <div className="welcome-content">
              <div className="welcome-icon">🧠</div>
              <h3>Welcome to Copemate</h3>
              <p>
                Your AI mental health assistant is ready to provide support, 
                guidance, and a listening ear. Click below to start your conversation.
              </p>
              <div className="welcome-features">
                <div className="feature-item">
                  <span className="feature-icon">🎯</span>
                  <span>Personalized mental health support</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🔒</span>
                  <span>100% confidential and secure</span>
                </div>
                <div className="feature-item">
                  <span className="feature-icon">🌍</span>
                  <span>Available in Hindi and English</span>
                </div>
              </div>
              <button 
                className="start-conversation-btn"
                onClick={startConversation}
                disabled={isLoading}
              >
                {isLoading ? 'Starting...' : 'Start Video Conversation'}
              </button>
            </div>
          </div>
        )}
      </div>

      <div className="tavus-footer">
        <div className="privacy-notice">
          <small>
            🔒 Your conversation is confidential and secure. 
            For crisis situations, please contact emergency services immediately.
          </small>
        </div>
      </div>
    </div>
  );
};

export default TavusVideoChat;
