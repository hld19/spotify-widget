/**
 * Collaborative Session Component
 * Allows multiple users to control the same playback session
 */

import { useState, useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
import { 
  XMarkIcon, 
  UserGroupIcon,
  LinkIcon,
  QrCodeIcon,
  UserPlusIcon,
  HandRaisedIcon,
  ChatBubbleLeftIcon
} from '@heroicons/react/24/solid';

interface CollaborativeSessionProps {
  isOpen: boolean;
  onClose: () => void;
  currentTrack?: string;
  isHost: boolean;
}

interface SessionUser {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  lastActivity: Date;
  color: string;
}

interface VoteRequest {
  userId: string;
  action: 'skip' | 'replay' | 'pause';
  votes: string[];
  requiredVotes: number;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: Date;
  type: 'message' | 'system' | 'reaction';
}

export default function CollaborativeSession({ 
  isOpen, 
  onClose, 
  currentTrack = '',
  isHost 
}: CollaborativeSessionProps) {
  const { currentTheme } = useTheme();
  const [sessionCode, setSessionCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [users, setUsers] = useState<SessionUser[]>([]);
  const [activeVote, setActiveVote] = useState<VoteRequest | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState('');
  const [showQR, setShowQR] = useState(false);
  const chatContainerRef = useRef<HTMLDivElement>(null);

  // Generate session code
  useEffect(() => {
    if (isHost && !sessionCode) {
      const code = generateSessionCode();
      setSessionCode(code);
    }
  }, [isHost, sessionCode]);

  // Auto-scroll chat
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
    }
  }, [messages]);

  const generateSessionCode = () => {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  const createSession = () => {
    // Simulate creating a session
    setIsConnected(true);
    setUsers([
      {
        id: 'host',
        name: 'You (Host)',
        isHost: true,
        lastActivity: new Date(),
        color: currentTheme.primary
      }
    ]);
    
    addSystemMessage('Collaborative session created! Share the code with friends.');
  };

  const joinSession = () => {
    if (joinCode.length === 6) {
      setIsConnected(true);
      setSessionCode(joinCode);
      setUsers(prev => [...prev, {
        id: 'user-' + Date.now(),
        name: 'You',
        isHost: false,
        lastActivity: new Date(),
        color: generateUserColor()
      }]);
      
      addSystemMessage('Joined collaborative session!');
    }
  };

  const generateUserColor = () => {
    const colors = ['#f87171', '#fb923c', '#fbbf24', '#a3e635', '#4ade80', '#2dd4bf', '#22d3ee', '#60a5fa', '#a78bfa', '#e879f9'];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  const addSystemMessage = (text: string) => {
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      userId: 'system',
      userName: 'System',
      message: text,
      timestamp: new Date(),
      type: 'system'
    }]);
  };

  const sendMessage = () => {
    if (messageInput.trim()) {
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        userId: 'current-user',
        userName: isHost ? 'Host' : 'You',
        message: messageInput,
        timestamp: new Date(),
        type: 'message'
      }]);
      setMessageInput('');
    }
  };

  const startVote = (action: 'skip' | 'replay' | 'pause') => {
    setActiveVote({
      userId: 'current-user',
      action,
      votes: ['current-user'],
      requiredVotes: Math.ceil(users.length / 2)
    });
    
    addSystemMessage(`Vote started to ${action} the current track. ${Math.ceil(users.length / 2)} votes needed.`);
  };

  const copySessionLink = () => {
    const link = `https://spotify-widget.app/join/${sessionCode}`;
    navigator.clipboard.writeText(link);
    addSystemMessage('Session link copied to clipboard!');
  };

  if (!isOpen) return null;

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}
      onClick={onClose}
    >
      <div 
        className="rounded-xl p-6 max-w-4xl w-full max-h-[80vh] flex flex-col"
        style={{
          backgroundColor: currentTheme.background,
          color: currentTheme.text,
          border: `1px solid ${currentTheme.border}`,
          boxShadow: `0 20px 40px ${currentTheme.shadow}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-2">
            <UserGroupIcon className="w-5 h-5" style={{ color: currentTheme.primary }} />
            <h2 className="text-lg font-semibold">Collaborative Listening</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg transition-colors"
            style={{ color: currentTheme.textMuted }}
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {!isConnected ? (
          // Connection Screen
          <div className="space-y-6">
            {isHost ? (
              // Host Options
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Create a Session</h3>
                <p className="text-sm" style={{ color: currentTheme.textSecondary }}>
                  Start a collaborative session and invite friends to control playback together
                </p>
                <button
                  onClick={createSession}
                  className="px-6 py-3 rounded-lg font-medium transition-colors"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: '#ffffff',
                  }}
                >
                  Create Session
                </button>
              </div>
            ) : (
              // Join Options
              <div className="text-center space-y-4">
                <h3 className="text-xl font-semibold">Join a Session</h3>
                <p className="text-sm" style={{ color: currentTheme.textSecondary }}>
                  Enter the session code to join
                </p>
                <input
                  type="text"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase().slice(0, 6))}
                  placeholder="ABCD12"
                  className="px-4 py-2 text-center text-2xl font-mono rounded-lg w-48"
                  style={{
                    backgroundColor: currentTheme.backgroundSecondary,
                    color: currentTheme.text,
                    border: `1px solid ${currentTheme.border}`,
                  }}
                />
                <button
                  onClick={joinSession}
                  disabled={joinCode.length !== 6}
                  className="px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: '#ffffff',
                  }}
                >
                  Join Session
                </button>
              </div>
            )}
          </div>
        ) : (
          // Connected Session View
          <div className="flex-1 grid grid-cols-3 gap-4">
            {/* Users Panel */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">Users ({users.length})</h3>
                {isHost && (
                  <button
                    onClick={() => setShowQR(!showQR)}
                    className="p-1 rounded transition-colors"
                    style={{ color: currentTheme.textSecondary }}
                  >
                    <QrCodeIcon className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Session Code */}
              {isHost && (
                <div 
                  className="p-3 rounded-lg text-center cursor-pointer"
                  style={{ backgroundColor: currentTheme.backgroundSecondary }}
                  onClick={copySessionLink}
                >
                  <p className="text-xs" style={{ color: currentTheme.textSecondary }}>
                    Session Code
                  </p>
                  <p className="text-2xl font-mono font-bold">{sessionCode}</p>
                  <p className="text-xs mt-1" style={{ color: currentTheme.textMuted }}>
                    Click to copy link
                  </p>
                </div>
              )}

              {/* User List */}
              <div className="space-y-2">
                {users.map(user => (
                  <div 
                    key={user.id}
                    className="flex items-center space-x-2 p-2 rounded"
                    style={{ backgroundColor: currentTheme.backgroundSecondary + '50' }}
                  >
                    <div 
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name[0].toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">
                        {user.name}
                        {user.isHost && (
                          <span className="ml-1 text-xs" style={{ color: currentTheme.primary }}>
                            (Host)
                          </span>
                        )}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chat Panel */}
            <div className="col-span-2 flex flex-col">
              <h3 className="font-semibold mb-3">Chat & Actions</h3>
              
              {/* Messages */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto space-y-2 p-3 rounded-lg mb-3"
                style={{ backgroundColor: currentTheme.backgroundSecondary + '30' }}
              >
                {messages.map(msg => (
                  <div key={msg.id} className={`${msg.type === 'system' ? 'text-center' : ''}`}>
                    {msg.type === 'system' ? (
                      <p className="text-xs" style={{ color: currentTheme.textMuted }}>
                        {msg.message}
                      </p>
                    ) : (
                      <div>
                        <span className="font-semibold text-sm" style={{ color: msg.userId === 'current-user' ? currentTheme.primary : currentTheme.text }}>
                          {msg.userName}:
                        </span>
                        <span className="text-sm ml-1">{msg.message}</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Active Vote */}
              {activeVote && (
                <div 
                  className="p-3 rounded-lg mb-3"
                  style={{ backgroundColor: currentTheme.accent + '20' }}
                >
                  <p className="text-sm font-medium mb-2">
                    Vote to {activeVote.action} • {activeVote.votes.length}/{activeVote.requiredVotes} votes
                  </p>
                  <div className="flex space-x-2">
                    <button
                      className="px-3 py-1 text-sm rounded"
                      style={{
                        backgroundColor: currentTheme.primary,
                        color: '#ffffff',
                      }}
                    >
                      Vote Yes
                    </button>
                    <button
                      className="px-3 py-1 text-sm rounded"
                      style={{
                        backgroundColor: currentTheme.backgroundSecondary,
                        color: currentTheme.text,
                      }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex space-x-2">
                <input
                  type="text"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                  placeholder="Type a message..."
                  className="flex-1 px-3 py-2 rounded-lg text-sm"
                  style={{
                    backgroundColor: currentTheme.backgroundSecondary,
                    color: currentTheme.text,
                    border: `1px solid ${currentTheme.border}`,
                  }}
                />
                <button
                  onClick={sendMessage}
                  className="px-3 py-2 rounded-lg"
                  style={{
                    backgroundColor: currentTheme.primary,
                    color: '#ffffff',
                  }}
                >
                  <ChatBubbleLeftIcon className="w-4 h-4" />
                </button>
              </div>

              {/* Quick Actions */}
              <div className="flex space-x-2 mt-3">
                <button
                  onClick={() => startVote('skip')}
                  className="flex-1 py-2 text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: currentTheme.backgroundSecondary,
                    color: currentTheme.text,
                  }}
                >
                  Vote to Skip
                </button>
                <button
                  onClick={() => startVote('pause')}
                  className="flex-1 py-2 text-sm rounded-lg transition-colors"
                  style={{
                    backgroundColor: currentTheme.backgroundSecondary,
                    color: currentTheme.text,
                  }}
                >
                  Vote to Pause
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 