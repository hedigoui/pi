import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, MessageCircle, Phone, Video, MoreVertical, User } from 'lucide-react';
import TeacherSidebar from '../components/TeacherSidebar';
import StudentSidebar from '../components/StudentSidebar';
import AdminSidebar from '../components/AdminSidebar';
import styles from '../styles/shared.module.css';

const Conversations = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

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
    if (user) {
      loadConversations();
    }
  }, [user]);

  const loadConversations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:3000/communication/conversations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setConversations(data.data || []);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // For demo purposes, create mock conversations
      const mockConversations = user.role === 'instructor' ? [
        {
          _id: '1',
          participantIds: [user.id, 'student1'],
          lastMessageContent: 'Hi teacher, I need help with my assignment',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 5), // 5 minutes ago
          otherParticipant: {
            id: 'student1',
            name: 'Sarah Miller',
            email: 'sarah@example.com',
            role: 'student',
            avatar: null
          }
        },
        {
          _id: '2',
          participantIds: [user.id, 'student2'],
          lastMessageContent: 'Thank you for the feedback!',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
          otherParticipant: {
            id: 'student2',
            name: 'John Doe',
            email: 'john@example.com',
            role: 'student',
            avatar: null
          }
        }
      ] : user.role === 'student' ? [
        {
          _id: '1',
          participantIds: [user.id, 'teacher1'],
          lastMessageContent: 'Great job on your practice session!',
          lastMessageTime: new Date(Date.now() - 1000 * 60 * 2), // 2 minutes ago
          otherParticipant: {
            id: 'teacher1',
            name: 'Dr. Smith',
            email: 'smith@example.com',
            role: 'instructor',
            avatar: null
          }
        }
      ] : [];
      setConversations(mockConversations);
    }
  };

  const filteredConversations = conversations.filter(conv => {
    if (!searchTerm) return true;
    const otherUser = conv.otherParticipant;
    return otherUser?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
           otherUser?.email?.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const getSidebar = () => {
    if (!user) return null;
    
    switch (user.role) {
      case 'student':
        return <StudentSidebar />;
      case 'instructor':
        return <TeacherSidebar />;
      case 'admin':
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
              Loading conversations...
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
          {/* Page Header */}
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Messages</h1>
              <p className={styles.pageSubtitle}>Communicate with students and teachers</p>
            </div>
            <button
              style={{
                padding: '0.6rem 1.4rem',
                background: 'linear-gradient(135deg, #E31837, #B71C1C)',
                border: 'none',
                borderRadius: '12px',
                color: '#fff',
                fontWeight: '600',
                fontSize: '0.88rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem',
                boxShadow: '0 4px 20px rgba(227,24,55,0.3)',
              }}
            >
              <MessageCircle size={16} />
              New Message
            </button>
          </div>

          {/* Search Bar */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            padding: '1rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
          }}>
            <Search size={20} style={{ color: 'var(--text-secondary)' }} />
            <input
              type="text"
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                outline: 'none',
                color: 'var(--text-primary)',
                fontSize: '0.9rem',
              }}
            />
          </div>

          {/* Conversations List */}
          <div style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--border-primary)',
            borderRadius: '16px',
            overflow: 'hidden',
          }}>
            {filteredConversations.length === 0 ? (
              <div style={{
                padding: '3rem',
                textAlign: 'center',
                color: 'var(--text-secondary)',
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>💬</div>
                <h3 style={{ color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                  No conversations yet
                </h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.5' }}>
                  {searchTerm 
                    ? 'No conversations found matching your search.' 
                    : user?.role === 'instructor' 
                      ? 'Start a conversation with your students by clicking "New Message" or navigate to their profile.'
                      : 'Reach out to your teachers for help and guidance.'
                  }
                </p>
                {!searchTerm && (
                  <button
                    onClick={() => navigate('/messages')}
                    style={{
                      padding: '0.75rem 1.5rem',
                      background: 'linear-gradient(135deg, #E31837, #B71C1C)',
                      border: 'none',
                      borderRadius: '12px',
                      color: '#fff',
                      fontWeight: '600',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      marginTop: '1rem',
                    }}
                  >
                    Browse All Users
                  </button>
                )}
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                {filteredConversations.map((conversation) => (
                  <div
                    key={conversation._id}
                    onClick={() => navigate(`/messages/${conversation.otherParticipant.id}`)}
                    style={{
                      padding: '1rem 1.5rem',
                      borderBottom: '1px solid var(--border-primary)',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '1rem',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = 'var(--bg-tertiary)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = 'var(--bg-secondary)';
                    }}
                  >
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      background: 'var(--bg-tertiary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      {conversation.otherParticipant?.avatar ? (
                        <img 
                          src={conversation.otherParticipant.avatar} 
                          alt={conversation.otherParticipant.name}
                          style={{ 
                            width: '100%', 
                            height: '100%', 
                            borderRadius: '50%',
                            objectFit: 'cover' 
                          }} 
                        />
                      ) : (
                        <div style={{ 
                          color: 'var(--text-secondary)', 
                          fontSize: '1.2rem',
                          fontWeight: '600' 
                        }}>
                          {conversation.otherParticipant?.name?.charAt(0) || 'U'}
                        </div>
                      )}
                    </div>
                    
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '0.5rem',
                      }}>
                        <h3 style={{ 
                          color: 'var(--text-primary)', 
                          fontSize: '1rem', 
                          fontWeight: '600',
                          margin: 0 
                        }}>
                          {conversation.otherParticipant?.name || 'Unknown User'}
                        </h3>
                        <span style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          background: 'rgba(227, 24, 55, 0.1)',
                          color: '#E31837',
                          padding: '0.25rem 0.75rem',
                          borderRadius: '12px',
                          textTransform: 'uppercase',
                          fontWeight: '500',
                        }}>
                          {conversation.otherParticipant?.role || 'User'}
                        </span>
                      </div>
                      <p style={{ 
                        color: 'var(--text-secondary)', 
                        fontSize: '0.85rem',
                        margin: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {conversation.lastMessageContent}
                      </p>
                    </div>
                    
                    <div style={{
                      fontSize: '0.75rem',
                      color: 'var(--text-secondary)',
                      textAlign: 'right',
                    }}>
                      {conversation.lastMessageTime && 
                        new Date(conversation.lastMessageTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })
                      }
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Conversations;
