import { useState } from 'react';
import AdminSidebar from '../../components/AdminSidebar';
import { Search, Plus, Edit2, Trash2, Filter } from 'lucide-react';
import styles from '../../styles/shared.module.css';
import studentsStyles from '../teacher/Students.module.css';

const allUsers = [
  { id: 1, name: 'Hedi Goui', email: 'hedi@example.com', role: 'Student', level: 'B2', status: 'Active', joined: 'Jan 15, 2026' },
  { id: 2, name: 'Ahmed Fatnassi', email: 'ahmed@example.com', role: 'Instructor', level: '-', status: 'Active', joined: 'Sep 1, 2025' },
  { id: 3, name: 'Aziz Azizi', email: 'aziz@example.com', role: 'Student', level: 'B1', status: 'Active', joined: 'Dec 5, 2025' },
  { id: 4, name: 'Prof. Emily Johnson', email: 'emily@example.com', role: 'Instructor', level: '-', status: 'Active', joined: 'Aug 15, 2025' },
  { id: 5, name: 'Ahmed Hassan', email: 'ahmed@example.com', role: 'Student', level: 'B2', status: 'Active', joined: 'Nov 20, 2025' },
  { id: 6, name: 'Admin User', email: 'admin@example.com', role: 'Admin', level: '-', status: 'Active', joined: 'Jun 1, 2025' },
  { id: 7, name: 'Maria Garcia', email: 'maria@example.com', role: 'Student', level: 'B1', status: 'Inactive', joined: 'Oct 10, 2025' },
];

const Users = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const filteredUsers = allUsers.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return styles.cyan;
      case 'Instructor': return styles.green;
      default: return styles.purple;
    }
  };

  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          <div className={styles.pageHeader}>
            <div>
              <h1 className={styles.pageTitle}>User Management</h1>
              <p className={styles.pageSubtitle}>Manage all platform users</p>
            </div>
            <button className={styles.primaryButton}>
              <Plus size={18} />
              Add User
            </button>
          </div>

          {/* Filters */}
          <div className={studentsStyles.filters}>
            <div className={studentsStyles.searchBox}>
              <Search size={18} className={studentsStyles.searchIcon} />
              <input 
                type="text" 
                placeholder="Search users..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className={studentsStyles.searchInput}
              />
            </div>
            
            <div className={studentsStyles.filterGroup}>
              <Filter size={18} />
              <select 
                value={roleFilter} 
                onChange={(e) => setRoleFilter(e.target.value)}
                className={studentsStyles.filterSelect}
              >
                <option value="all">All Roles</option>
                <option value="student">Students</option>
                <option value="instructor">Instructors</option>
                <option value="admin">Admins</option>
              </select>
            </div>
          </div>

          {/* Users Table */}
          <div className={styles.card}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>User</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Level</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div style={{ 
                          width: '40px', 
                          height: '40px', 
                          borderRadius: '10px', 
                          background: user.role === 'Admin' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 
                                     user.role === 'Teacher' ? 'linear-gradient(135deg, #22c55e, #16a34a)' :
                                     'linear-gradient(135deg, #E31837, #B71C1C)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'white',
                          fontWeight: '600',
                          fontSize: '0.85rem'
                        }}>
                          {user.name.charAt(0)}
                        </div>
                        <span style={{ fontWeight: '500' }}>{user.name}</span>
                      </div>
                    </td>
                    <td style={{ color: '#64748b' }}>{user.email}</td>
                    <td>
                      <span className={`${styles.badge} ${getRoleBadgeClass(user.role)}`}>
                        {user.role}
                      </span>
                    </td>
                    <td>{user.level !== '-' ? <span className={`${styles.badge} ${styles.info}`}>{user.level}</span> : '-'}</td>
                    <td>
                      <span className={`${styles.badge} ${user.status === 'Active' ? styles.success : styles.warning}`}>
                        {user.status}
                      </span>
                    </td>
                    <td style={{ color: '#64748b' }}>{user.joined}</td>
                    <td>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button className={studentsStyles.actionBtn} title="Edit">
                          <Edit2 size={16} />
                        </button>
                        <button 
                          className={studentsStyles.actionBtn} 
                          title="Delete"
                          style={{ '--hover-bg': 'rgba(239, 68, 68, 0.2)', '--hover-color': '#ef4444' }}
                        >
                          <Trash2 size={16} />
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

export default Users;
