import React, { useEffect, useState } from 'react';
import { userService } from '../../services/dataService';
import './AdminPages.css';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await userService.getAll({ role: 'user' });
        setUsers(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch users');
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div className="admin-page fade-in">
      <div className="admin-header">
        <h1>Users</h1>
      </div>
      <p className="admin-subtitle">Manage and review all registered members.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="summary-strip">
        <div className="summary-item">
          <h3>{users.length}</h3>
          <p>Total Users</p>
        </div>
        <div className="summary-item">
          <h3>{users.filter((u) => u.status === 'active').length}</h3>
          <p>Active Users</p>
        </div>
      </div>

      <div className="admin-table-card table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Status</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id}>
                <td>{u.name}</td>
                <td>{u.email}</td>
                <td><span className={`badge ${u.status === 'active' ? 'returned' : 'overdue'}`}>{u.status}</span></td>
                <td>{u.role}</td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="4" className="empty-table">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default UsersList;
