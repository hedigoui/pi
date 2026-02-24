import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import TeacherSidebar from '../../components/TeacherSidebar';
import { Search, Filter, Eye, ClipboardCheck } from 'lucide-react';
import styles from '../../styles/shared.module.css';
import studentsStyles from './Students.module.css';

const allStudents = [
  { id: 1, name: 'Hedi Goui', email: 'hedi@example.com', level: 'B2', sessions: 12, lastScore: 85, status: 'Active', avatar: '/images/hedi.jpg' },
  { id: 2, name: 'Sarah Miller', email: 'sarah@example.com', level: 'B1', sessions: 8, lastScore: 72, status: 'Active', avatar: null },
  { id: 3, name: 'Ahmed Hassan', email: 'ahmed@example.com', level: 'B2', sessions: 15, lastScore: 88, status: 'Active', avatar: null },
  { id: 4, name: 'Emma Wilson', email: 'emma@example.com', level: 'C1', sessions: 20, lastScore: 92, status: 'Active', avatar: null },
  { id: 5, name: 'John Doe', email: 'john@example.com', level: 'A2', sessions: 5, lastScore: 65, status: 'Active', avatar: null },
  { id: 6, name: 'Maria Garcia', email: 'maria@example.com', level: 'B1', sessions: 10, lastScore: 78, status: 'Inactive', avatar: null },
  { id: 7, name: 'James Brown', email: 'james@example.com', level: 'B2', sessions: 14, lastScore: 82, status: 'Active', avatar: null },
  { id: 8, name: 'Lisa Chen', email: 'lisa@example.com', level: 'C1', sessions: 18, lastScore: 90, status: 'Active', avatar: null },
];

const Students = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [levelFilter, setLevelFilter] = useState('all');

  const filteredStudents = allStudents.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          student.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesLevel = levelFilter === 'all' || student.level === levelFilter;
    return matchesSearch && matchesLevel;
  });

  return (
    <div className={styles.layout}>
      <TeacherSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>Students</h1>
              <p className={styles.pageSubtitle}>Manage and view all your students</p>
            </div>
          </div>

          {/* Filters */}
          <div className={studentsStyles.filters}>
            <div className={studentsStyles.searchBox}>
              <Search size={18} className={studentsStyles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search students..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={studentsStyles.searchInput}
              />
            </div>
            
            <div className={studentsStyles.filterGroup}>
              <Filter size={18} />
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
                <option value="C2">C2</option>
              </select>
            </div>
          </div>

          {/* Students Table */}
          <div className={styles.card}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Email</th>
                  <th>Level</th>
                  <th>Sessions</th>
                  <th>Last Score</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredStudents.map((student) => (
                  <tr key={student.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        {student.avatar ? (
                          <img src={student.avatar} alt={student.name} className={styles.avatar} />
                        ) : (
                          <div style={{ 
                            width: '40px', 
                            height: '40px', 
                            borderRadius: '10px', 
                            background: 'linear-gradient(135deg, #E31837, #B71C1C)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '0.85rem'
                          }}>
                            {student.name.charAt(0)}
                          </div>
                        )}
                        <span style={{ fontWeight: '500' }}>{student.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>{student.email}</td>
                    <td><span className={`${styles.badge} ${styles.purple}`}>{student.level}</span></td>
                    <td>{student.sessions}</td>
                    <td style={{ color: student.lastScore >= 80 ? '#22c55e' : student.lastScore >= 60 ? '#f97316' : '#ef4444' }}>
                      {student.lastScore}/100
                    </td>
                    <td>
                      <span className={`${styles.badge} ${student.status === 'Active' ? styles.success : styles.warning}`}>
                        {student.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          className={studentsStyles.actionBtn}
                          title="View Profile"
                        >
                          <Eye size={16} />
                        </button>
                        <button 
                          className={studentsStyles.actionBtn}
                          title="Evaluate"
                          onClick={() => navigate(`/teacher/evaluate/${student.id}`)}
                        >
                          <ClipboardCheck size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Students;
