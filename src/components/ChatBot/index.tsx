import { useState, useEffect, useRef } from 'react';
import { useUser } from '@clerk/clerk-react';
// ...existing code...
import BackButton from '../BackButton';
import Wrapper from '../Wrapper';
import TavusVideoChat from '../TavusVideoChat';
import './ChatBot.css';

interface Message {
  type: 'user' | 'bot';
  content: string;
}

const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [chatMode, setChatMode] = useState<'text' | 'video'>('text');
  const { user } = useUser();
  const messagesEndRef = useRef<null | HTMLDivElement>(null);
  // ...existing code...

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    // Fix: Explicitly type as Message or use 'as const'
    const userMessage: Message = { type: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');

    try {
      const response = await fetch('http://localhost:3000/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          email: user?.primaryEmailAddress?.emailAddress
        })
      });

      const data = await response.json();
      // Fix: Explicitly type as Message
      const botMessage: Message = { type: 'bot', content: data.reply };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Wrapper>
      <div className="chat-container" style={{ position: 'relative' }}>
        <BackButton className="fixed top-5 left-5 z-50" />
        
        {/* Chat Mode Toggle */}
        <div className="chat-mode-toggle">
          <button
            className={`mode-btn ${chatMode === 'text' ? 'active' : ''}`}
            onClick={() => setChatMode('text')}
          >
            💬 Text Chat
          </button>
          <button
            className={`mode-btn ${chatMode === 'video' ? 'active' : ''}`}
            onClick={() => setChatMode('video')}
          >
            🎥 Video Chat
          </button>
        </div>

        {chatMode === 'video' ? (
          <TavusVideoChat />
        ) : (
          <>
            <div className="chat-messages">
              {messages.map((msg, idx) => (
                <div key={idx} className={`message ${msg.type}`}>
                  {msg.content}
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <form onSubmit={handleSubmit} className="chat-input">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
              />
              <button type="submit">Send</button>
            </form>
          </>
        )}
      </div>
    </Wrapper>
  );
};

export default ChatBot;