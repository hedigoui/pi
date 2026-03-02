import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, Paperclip, Mic, Phone, Video, MoreVertical } from 'lucide-react';
import styles from '../styles/shared.module.css';

const Messages = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [otherUser, setOtherUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('user') || '{}');
    if (userData.id) {
      setUser(userData);
    } else {
      navigate('/');
      return;
    }
    setLoading(false);
  }, [navigate]);

  useEffect(() => {
    if (userId && user) {
      loadMessages();
      // In a real app, you'd also load other user info
      setOtherUser({
        id: userId,
        name: 'Other User',
        avatar: null,
        role: user.role === 'instructor' ? 'student' : 'instructor'
      });
    }
  }, [userId, user]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const loadMessages = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:3000/communication/messages/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(data.data || []);
      }
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || sending) return;

    setSending(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/communication/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          receiverId: userId,
          content: newMessage.trim(),
          type: 'text'
        })
      });

      if (response.ok) {
        setNewMessage('');
        await loadMessages();
      }
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSending(false);
    }
  };

  const getSidebar = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'student':
        const StudentSidebar = require('../components/StudentSidebar').default;
        return <StudentSidebar />;
      case 'instructor':
        const TeacherSidebar = require('../components/TeacherSidebar').default;
        return <TeacherSidebar />;
      case 'admin':
        const AdminSidebar = require('../components/AdminSidebar').default;
        return <AdminSidebar />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className={styles.layout}>
        {getSidebar()}
        <div className={styles.mainContent}>
          <div className={styles.content}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '400px', color: 'var(--text-secondary)' }}>
              Loading conversation...
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Handle case when no userId is provided
  if (!userId) {
    return (
      <div className={styles.layout}>
        {getSidebar()}
        <div className={styles.mainContent}>
          <div className={styles.content}>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              height: '400px',
              color: 'var(--text-secondary)',
              textAlign: 'center',
            }}>
              <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
              <h2 style={{ color: 'var(--text-primary)', marginBottom: '1rem' }}>
                Select a Conversation
              </h2>
              <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: '1.5' }}>
                Please choose a conversation from the list, or go back to browse all conversations.
              </p>
              <button
                onClick={() => navigate('/conversations')}
                style={{
                  padding: '0.75rem 2rem',
                  background: 'linear-gradient(135deg, #E31837, #B71C1C)',
                  border: 'none',
                  borderRadius: '12px',
                  color: '#fff',
                  fontWeight: '600',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  textDecoration: 'none',
                }}
              >
                Browse Conversations
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {getSidebar()}
      <div className={styles.mainContent}>
        <div className={styles.content}>
          {/* Chat Header */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            padding: '1rem 1.5rem',
            marginBottom: '1.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: 'var(--bg-tertiary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                {otherUser?.avatar ? (
                  <img src={otherUser.avatar} alt={otherUser.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
                ) : (
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    {otherUser?.name?.charAt(0) || 'U'}
                  </div>
                )}
              </div>
              <div>
                <h3 style={{ color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '600', margin: 0 }}>
                  {otherUser?.name || 'Unknown User'}
                </h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', margin: 0 }}>
                  {otherUser?.role || 'User'}
                </p>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button style={{
                padding: '0.5rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Phone size={16} />
              </button>
              <button style={{
                padding: '0.5rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Video size={16} />
              </button>
              <button style={{
                padding: '0.5rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '8px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <MoreVertical size={16} />
              </button>
            </div>
          </div>

          {/* Messages Container */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            padding: '1.5rem',
            height: '500px',
            overflowY: 'auto',
            marginBottom: '1.5rem',
          }}>
            {messages.length === 0 ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <p style={{ textAlign: 'center' }}>
                  Start a conversation with {otherUser?.name || 'this user'}
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {messages.map((message, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      justifyContent: message.senderId === user.id ? 'flex-end' : 'flex-start',
                      maxWidth: '70%',
                    }}
                  >
                    <div style={{
                      background: message.senderId === user.id 
                        ? 'linear-gradient(135deg, #E31837, #B71C1C)' 
                        : 'var(--bg-tertiary)',
                      color: message.senderId === user.id ? 'white' : 'var(--text-primary)',
                      padding: '0.75rem 1rem',
                      borderRadius: message.senderId === user.id 
                        ? '16px 16px 4px 16px' 
                        : '16px 16px 16px 4px',
                      wordWrap: 'break-word',
                    }}>
                      {message.content}
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>

          {/* Message Input */}
          <form onSubmit={sendMessage} style={{
            display: 'flex',
            gap: '1rem',
            alignItems: 'flex-end',
          }}>
            <div style={{
              display: 'flex',
              gap: '0.5rem',
            }}>
              <button type="button" style={{
                padding: '0.75rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Paperclip size={18} />
              </button>
              <button type="button" style={{
                padding: '0.75rem',
                background: 'var(--bg-tertiary)',
                border: '1px solid var(--border-primary)',
                borderRadius: '12px',
                color: 'var(--text-primary)',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Mic size={18} />
              </button>
            </div>
            
            <div style={{ flex: 1, position: 'relative' }}>
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type a message..."
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  background: 'var(--bg-tertiary)',
                  border: '2px solid var(--border-primary)',
                  borderRadius: '12px',
                  color: 'var(--text-primary)',
                  fontSize: '0.9rem',
                  outline: 'none',
                }}
                disabled={sending}
              />
            </div>
            
            <button
              type="submit"
              disabled={!newMessage.trim() || sending}
              style={{
                padding: '0.75rem 1.5rem',
                background: newMessage.trim() && !sending 
                  ? 'linear-gradient(135deg, #E31837, #B71C1C)' 
                  : 'var(--bg-tertiary)',
                border: 'none',
                borderRadius: '12px',
                color: newMessage.trim() && !sending ? 'white' : 'var(--text-secondary)',
                cursor: newMessage.trim() && !sending ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                transition: 'all 0.3s ease',
              }}
            >
              {sending ? (
                <div style={{
                  width: '16px',
                  height: '16px',
                  border: '2px solid white',
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite',
                }} />
              ) : (
                <Send size={16} />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Messages;
