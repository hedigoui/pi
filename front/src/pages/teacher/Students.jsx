import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../../components/TeacherSidebar';
import { Search, Filter, Eye, ClipboardCheck, MessageCircle, Users, TrendingUp, Calendar, Phone, MapPin } from 'lucide-react';
import styles from '../../styles/shared.module.css';
import studentsStyles from './Students.module.css';

const Students = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid'); // grid or list

  useEffect(() => {
    loadStudents();
  }, []);

  const loadStudents = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.log('No token found');
        setStudents([]);
        setLoading(false);
        return;
      }

      const response = await fetch('http://localhost:3000/users/students', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStudents(data.data || []);
        console.log(`✅ Loaded ${data.data?.length || 0} students from database`);
      } else {
        console.log('Failed to load students from API');
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  const startConversation = (studentId) => {
    console.log('🔍 Student ID:', studentId);
    console.log('🔍 Student data:', students[0]);
    navigate(`/messages/${studentId}`);
  };

  const getLevelColor = (level) => {
    const colors = {
      'A1': '#10b981',
      'A2': '#22c55e',
      'B1': '#3b82f6',
      'B2': '#6366f1',
      'C1': '#8b5cf6'
    };
    return colors[level] || '#6b7280';
  };

  const getStatusColor = (status) => {
    const colors = {
      'Active': '#10b981',
      'Inactive': '#ef4444',
      'Pending': '#f59e0b'
    };
    return colors[status] || '#6b7280';
  };

  const stats = {
    total: students.length,
    active: students.filter(s => s.status === 'Active').length,
    byLevel: {
      A1: students.filter(s => s.level === 'A1').length,
      A2: students.filter(s => s.level === 'A2').length,
      B1: students.filter(s => s.level === 'B1').length,
      B2: students.filter(s => s.level === 'B2').length,
      C1: students.filter(s => s.level === 'C1').length,
    }
  };

  return (
    <div className={styles.layout}>
      <TeacherSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          {/* Page Header */}
          <div className={studentsStyles.pageHeader}>
            <div className={studentsStyles.headerContent}>
              <div className={studentsStyles.headerText}>
                <h1 className={studentsStyles.pageTitle}>
                  <Users size={28} className={studentsStyles.titleIcon} />
                  Students
                </h1>
                <p className={studentsStyles.pageSubtitle}>
                  Manage and monitor your students' progress
                </p>
              </div>
              
              {/* Stats Cards */}
              <div className={studentsStyles.statsCards}>
                <div className={studentsStyles.statCard}>
                  <div className={studentsStyles.statIcon}>
                    <Users size={20} />
                  </div>
                  <div className={studentsStyles.statInfo}>
                    <span className={studentsStyles.statNumber}>{stats.total}</span>
                    <span className={studentsStyles.statLabel}>Total Students</span>
                  </div>
                </div>
                <div className={studentsStyles.statCard}>
                  <div className={studentsStyles.statIcon} style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
                    <TrendingUp size={20} style={{ color: '#10b981' }} />
                  </div>
                  <div className={studentsStyles.statInfo}>
                    <span className={studentsStyles.statNumber}>{stats.active}</span>
                    <span className={studentsStyles.statLabel}>Active</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Filters and View Toggle */}
          <div className={studentsStyles.controlsSection}>
            <div className={studentsStyles.filtersRow}>
              <div className={studentsStyles.searchBox}>
                <Search size={18} className={studentsStyles.searchIcon} />
                <input 
                  type="text" 
                  placeholder="Search students by name or email..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className={studentsStyles.searchInput}
                />
              </div>
              
              <div className={studentsStyles.filterGroup}>
                <Filter size={18} className={studentsStyles.filterIcon} />
                <select 
                  value={levelFilter} 
                  onChange={(e) => setLevelFilter(e.target.value)}
                  className={studentsStyles.filterSelect}
                >
                  <option value="all">All Levels</option>
                  <option value="A1">A1</option>
                  <option value="A2">A2</option>
                  <option value="B1">B1</option>
                  <option value="B2">B2</option>
                  <option value="C1">C1</option>
                </select>
              </div>

              <div className={studentsStyles.viewToggle}>
                <button
                  onClick={() => setViewMode('grid')}
                  className={`${studentsStyles.viewButton} ${viewMode === 'grid' ? studentsStyles.activeView : ''}`}
                  title="Grid view"
                >
                  <div className={studentsStyles.gridIcon}></div>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`${studentsStyles.viewButton} ${viewMode === 'list' ? studentsStyles.activeView : ''}`}
                  title="List view"
                >
                  <div className={studentsStyles.listIcon}></div>
                </button>
              </div>
            </div>

            {/* Level Distribution */}
            <div className={studentsStyles.levelDistribution}>
              {Object.entries(stats.byLevel).map(([level, count]) => (
                <div key={level} className={studentsStyles.levelStat}>
                  <div 
                    className={studentsStyles.levelDot}
                    style={{ backgroundColor: getLevelColor(level) }}
                  ></div>
                  <span className={studentsStyles.levelName}>{level}</span>
                  <span className={studentsStyles.levelCount}>{count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Students List/Grid */}
          <div className={studentsStyles.studentsContainer}>
            {loading ? (
              <div className={studentsStyles.loadingState}>
                <div className={studentsStyles.spinner}></div>
                <p>Loading students...</p>
              </div>
            ) : filteredStudents.length === 0 ? (
              <div className={studentsStyles.emptyState}>
                <div className={studentsStyles.emptyIcon}>👥</div>
                <h3>No students found</h3>
                <p>
                  {searchTerm || levelFilter !== 'all' 
                    ? 'No students match your current filters.' 
                    : 'No students are enrolled in your classes yet.'
                  }
                </p>
                <button 
                  onClick={() => { setSearchTerm(''); setLevelFilter('all'); }}
                  className={studentsStyles.clearFiltersBtn}
                >
                  Clear filters
                </button>
              </div>
            ) : viewMode === 'grid' ? (
              <div className={studentsStyles.studentsGrid}>
                {filteredStudents.map((student) => (
                  <div key={student.id || student._id} className={studentsStyles.studentCard}>
                    <div className={studentsStyles.cardHeader}>
                      <div className={studentsStyles.studentAvatar}>
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className={studentsStyles.avatarImage} />
                        ) : (
                          <div className={studentsStyles.avatarPlaceholder}>
                            {student.name?.charAt(0) || 'S'}
                          </div>
                        )}
                      </div>
                      <div className={studentsStyles.onlineStatus} title={student.status}></div>
                    </div>
                    
                    <div className={studentsStyles.cardBody}>
                      <div className={studentsStyles.studentInfo}>
                        <h3 className={studentsStyles.studentName}>{student.name}</h3>
                        <p className={studentsStyles.studentEmail}>{student.email}</p>
                        
                        <div className={studentsStyles.studentMeta}>
                          <span 
                            className={studentsStyles.levelBadge}
                            style={{ backgroundColor: getLevelColor(student.level) }}
                          >
                            {student.level}
                          </span>
                          <span 
                            className={studentsStyles.statusBadge}
                            style={{ backgroundColor: getStatusColor(student.status) }}
                          >
                            {student.status}
                          </span>
                        </div>
                      </div>

                      <div className={studentsStyles.studentDetails}>
                        <div className={studentsStyles.detailItem}>
                          <Phone size={14} />
                          <span>{student.phone || 'Not provided'}</span>
                        </div>
                        <div className={studentsStyles.detailItem}>
                          <MapPin size={14} />
                          <span>{student.location || 'Not provided'}</span>
                        </div>
                        <div className={studentsStyles.detailItem}>
                          <Calendar size={14} />
                          <span>Joined {new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                    </div>

                    <div className={studentsStyles.cardFooter}>
                      <div className={studentsStyles.studentStats}>
                        <div className={studentsStyles.statItem}>
                          <span className={studentsStyles.statNumber}>{student.sessions || 0}</span>
                          <span className={studentsStyles.statLabel}>Sessions</span>
                        </div>
                        <div className={studentsStyles.statItem}>
                          <span className={studentsStyles.statNumber}>{student.lastScore || 0}%</span>
                          <span className={studentsStyles.statLabel}>Score</span>
                        </div>
                      </div>
                      
                      <div className={studentsStyles.studentActions}>
                        <button 
                          onClick={() => navigate(`/teacher/evaluate/${student._id}`)}
                          className={studentsStyles.actionButton}
                          title="View student details and evaluate"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => navigate(`/teacher/evaluate/${student._id}`)}
                          className={studentsStyles.actionButton}
                          title="Evaluate student performance"
                        >
                          <ClipboardCheck size={16} />
                        </button>
                        <button 
                          onClick={() => startConversation(student._id)}
                          className={`${studentsStyles.actionButton} ${studentsStyles.messageButton}`}
                          title="Send message to student"
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className={studentsStyles.studentsList}>
                {filteredStudents.map((student) => (
                  <div key={student.id || student._id} className={studentsStyles.listItem}>
                    <div className={studentsStyles.listItemContent}>
                      <div className={studentsStyles.listItemAvatar}>
                        <img 
                          src={student.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.name || 'student')}&backgroundColor=b6e3f4,c0aede,d1d4f9`} 
                          alt={student.name} 
                        />
                      </div>
                      
                      <div className={studentsStyles.listItemInfo}>
                        <div className={studentsStyles.listItemHeader}>
                          <h4>{student.name}</h4>
                          <div className={studentsStyles.listItemMeta}>
                            <span 
                              className={studentsStyles.levelBadge}
                              style={{ backgroundColor: getLevelColor(student.level) }}
                            >
                              {student.level}
                            </span>
                            <span 
                              className={studentsStyles.statusBadge}
                              style={{ backgroundColor: getStatusColor(student.status) }}
                            >
                              {student.status}
                            </span>
                          </div>
                        </div>
                        <p>{student.email}</p>
                        <div className={studentsStyles.listItemDetails}>
                          <span>Sessions: {student.sessions || 0}</span>
                          <span>Score: {student.lastScore || 0}%</span>
                          <span>Joined: {new Date(student.createdAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      
                      <div className={studentsStyles.listItemActions}>
                        <button 
                          onClick={() => navigate(`/teacher/evaluate/${student._id}`)}
                          className={studentsStyles.actionButton}
                          title="View student details"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          onClick={() => startConversation(student._id)}
                          className={`${studentsStyles.actionButton} ${studentsStyles.messageButton}`}
                          title="Send message"
                        >
                          <MessageCircle size={16} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Students;
