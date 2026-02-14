import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import AdminSidebar from '../../components/AdminSidebar';
import { Search, Plus, Edit2, Trash2, Filter, Power, PowerOff } from 'lucide-react';
import axios from 'axios';
import styles from '../../styles/shared.module.css';
import studentsStyles from '../teacher/Students.module.css';

const API_URL = 'http://localhost:3000';

const Users = () => {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [togglingId, setTogglingId] = useState(null);

  // Check authentication on component mount
  useEffect(() => {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (!token) {
      navigate('/', { replace: true });
      return;
    }

    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        if (user.role !== 'admin') {
          if (user.role === 'instructor') {
            navigate('/teacher/dashboard', { replace: true });
          } else if (user.role === 'student') {
            navigate('/student/dashboard', { replace: true });
          }
          return;
        }
      } catch (error) {
        console.error('Error parsing user data:', error);
        navigate('/', { replace: true });
        return;
      }
    }

    fetchUsers();
  }, [navigate]);

  // Fetch users from backend
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token'); // FIXED: Changed from 'access_token' to 'token'
      
      if (!token) {
        navigate('/');
        return;
      }

      const response = await axios.get(`${API_URL}/users`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Raw users from backend:', response.data);

      // Transform the data to match your frontend format
      const formattedUsers = response.data.map(user => ({
        id: user._id || user.id,
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        role: user.role.charAt(0).toUpperCase() + user.role.slice(1),
        level: user.role === 'student' ? 'B2' : '-',
        isActive: user.isActive,
        status: user.isActive ? 'Active' : 'Inactive',
        joined: user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { 
          month: 'short', 
          day: 'numeric', 
          year: 'numeric' 
        }) : 'N/A'
      }));

      console.log('Formatted users:', formattedUsers);
      setUsers(formattedUsers);
      setError('');
    } catch (error) {
      console.error('Error fetching users:', error);
      setError('Failed to load users. Please try again.');
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      }
    } finally {
      setLoading(false);
    }
  };

  // Delete user
  const handleDeleteUser = async (userId) => {
    console.log('Delete user with ID:', userId);
    
    if (!userId) {
      console.error('No user ID provided');
      alert('Cannot delete user: No ID provided');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('token'); // FIXED: Changed from 'access_token' to 'token'
      
      console.log(`Sending DELETE request to: ${API_URL}/users/${userId}`);
      
      const response = await axios.delete(`${API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      console.log('Delete response:', response.data);
      
      // Remove the user from local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      alert('User deleted successfully');
      
    } catch (error) {
      console.error('Error deleting user:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      } else {
        alert(`Failed to delete user: ${error.response?.data?.message || error.message}`);
      }
    }
  };

  // Toggle user active status
  const handleToggleStatus = async (userId, currentStatus) => {
    console.log('Toggle status for user ID:', userId, 'Current status:', currentStatus);
    
    if (!userId) {
      console.error('No user ID provided');
      alert('Cannot update user: No ID provided');
      return;
    }

    setTogglingId(userId);
    
    try {
      const token = localStorage.getItem('token'); // FIXED: Changed from 'access_token' to 'token'
      
      console.log(`Sending PATCH request to: ${API_URL}/users/${userId}`);
      console.log('Request body:', { isActive: !currentStatus });
      
      const response = await axios.patch(`${API_URL}/users/${userId}`, 
        { isActive: !currentStatus },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      console.log('Toggle response:', response.data);

      // Update the user in the local state
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.id === userId 
            ? { 
                ...user, 
                isActive: !currentStatus,
                status: !currentStatus ? 'Active' : 'Inactive'
              } 
            : user
        )
      );
      
    } catch (error) {
      console.error('Error updating user status:', error);
      console.error('Error response:', error.response?.data);
      
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
      } else {
        alert(`Failed to update user status: ${error.response?.data?.message || error.message}`);
      }
      
      // Refresh the users list
      fetchUsers();
    } finally {
      setTogglingId(null);
    }
  };

  // Edit user
  const handleEditUser = (userId) => {
    console.log('Edit user with ID:', userId);
    // Implement edit modal here
    alert('Edit functionality coming soon!');
  };

  // Filter users based on search term and role filter
  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          user.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || user.role.toLowerCase() === roleFilter;
    return matchesSearch && matchesRole;
  });

  // Get badge class based on role
  const getRoleBadgeClass = (role) => {
    switch (role.toLowerCase()) {
      case 'admin': return styles.cyan;
      case 'instructor': return styles.green;
      default: return styles.purple;
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className={styles.layout}>
        <AdminSidebar />
        <div className={styles.mainContent}>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
            <div className={styles.spinner} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <AdminSidebar />
      <div className={styles.mainContent}>
        <main className={styles.content}>
          {/* Page Header */}
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

          {/* Error Message */}
          {error && (
            <div style={{
              backgroundColor: '#fef2f2',
              border: '1px solid #fee2e2',
              borderRadius: '12px',
              padding: '1rem',
              marginBottom: '1.5rem',
              color: '#dc2626',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center'
            }}>
              <span>{error}</span>
              <button 
                onClick={fetchUsers}
                style={{
                  padding: '0.5rem 1rem',
                  background: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.8rem'
                }}
              >
                Retry
              </button>
            </div>
          )}

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
                {filteredUsers.length > 0 ? (
                  filteredUsers
                    .filter(user => user.role !== 'Admin') // Hide admin users
                    .map((user) => (
                      <tr key={user.id}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <div style={{ 
                              width: '40px', 
                              height: '40px', 
                              borderRadius: '10px', 
                              background: user.role === 'Admin' ? 'linear-gradient(135deg, #3b82f6, #2563eb)' : 
                                        user.role === 'Instructor' ? 'linear-gradient(135deg, #22c55e, #16a34a)' :
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
                        <td>
                          {user.level !== '-' ? 
                            <span className={`${styles.badge} ${styles.info}`}>{user.level}</span> : 
                            '-'
                          }
                        </td>
                        <td>
                          <span className={`${styles.badge} ${user.isActive ? styles.success : styles.warning}`}>
                            {user.status}
                          </span>
                        </td>
                        <td style={{ color: '#64748b' }}>{user.joined}</td>
                        <td>
                          <div style={{ display: 'flex', gap: '0.5rem' }}>
                            {/* Toggle Active/Inactive Button */}
                            <button 
                              className={studentsStyles.actionBtn}
                              title={user.isActive ? 'Deactivate User' : 'Activate User'}
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              disabled={togglingId === user.id}
                              style={{
                                backgroundColor: user.isActive 
                                  ? 'rgba(34, 197, 94, 0.1)' 
                                  : 'rgba(249, 115, 22, 0.1)',
                                color: user.isActive ? '#22c55e' : '#f97316',
                                border: '1px solid',
                                borderColor: user.isActive 
                                  ? 'rgba(34, 197, 94, 0.2)' 
                                  : 'rgba(249, 115, 22, 0.2)',
                                opacity: togglingId === user.id ? 0.7 : 1,
                                cursor: togglingId === user.id ? 'wait' : 'pointer'
                              }}
                            >
                              {togglingId === user.id ? (
                                <span style={{ 
                                  display: 'inline-block', 
                                  width: '16px', 
                                  height: '16px', 
                                  border: '2px solid currentColor',
                                  borderTopColor: 'transparent',
                                  borderRadius: '50%',
                                  animation: 'spin 0.8s linear infinite'
                                }} />
                              ) : user.isActive ? (
                                <PowerOff size={16} />
                              ) : (
                                <Power size={16} />
                              )}
                            </button>

                            {/* Edit Button */}
                            <button 
                              className={studentsStyles.actionBtn} 
                              title="Edit User"
                              onClick={() => handleEditUser(user.id)}
                              style={{ color: '#3b82f6' }}
                            >
                              <Edit2 size={16} />
                            </button>

                            {/* Delete Button - Hidden for admin users */}
                            {user.role !== 'Admin' && (
                              <button 
                                className={studentsStyles.actionBtn} 
                                title="Delete User"
                                onClick={() => handleDeleteUser(user.id)}
                                style={{ color: '#ef4444' }}
                              >
                                <Trash2 size={16} />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                ) : (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Users;