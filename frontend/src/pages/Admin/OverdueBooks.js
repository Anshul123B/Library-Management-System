import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/dataService';
import './AdminPages.css';

const OverdueBooks = () => {
  const [overdue, setOverdue] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchOverdue = async () => {
      try {
        const res = await reportService.getOverdueBooks();
        const overdueData = res.data?.data || [];
        
        console.log('Overdue Books Response:', overdueData);
        
        setOverdue(overdueData);
      } catch (err) {
        console.error('Error fetching overdue books:', err);
        setError(err.response?.data?.message || 'Failed to fetch overdue books');
      } finally {
        setLoading(false);
      }
    };

    fetchOverdue();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  const sortedOverdue = [...overdue].sort((a, b) => (b.overdueDays || 0) - (a.overdueDays || 0));

  return (
    <div className="admin-page fade-in">
      <div className="admin-header">
        <h1>Overdue Books</h1>
      </div>
      <p className="admin-subtitle">Items that crossed due date and require attention.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="summary-strip">
        <div className="summary-item">
          <h3>{overdue.length}</h3>
          <p>Overdue Records</p>
        </div>
        {overdue.length > 0 && (
          <div className="summary-item">
            <h3>{Math.max(...overdue.map(o => o.overdueDays || 0))}</h3>
            <p>Max Overdue Days</p>
          </div>
        )}
      </div>

      <div className="admin-table-card table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>User Email</th>
              <th>Book Title</th>
              <th>Due Date</th>
              <th>Overdue Days</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {sortedOverdue.map((item) => {
              const userName = typeof item.userId === 'object' ? item.userId?.name : 'Unknown';
              const userEmail = typeof item.userId === 'object' ? item.userId?.email : 'N/A';
              const bookTitle = typeof item.bookId === 'object' ? item.bookId?.title : 'Unknown';
              const overdueDays = item.overdueDays || 0;
              const severity = overdueDays > 30 ? 'critical' : overdueDays > 14 ? 'high' : 'medium';

              return (
                <tr key={item._id} style={{ backgroundColor: severity === 'critical' ? '#ffcccc' : severity === 'high' ? '#ffe6e6' : 'transparent' }}>
                  <td><strong>{userName}</strong></td>
                  <td>{userEmail}</td>
                  <td>{bookTitle}</td>
                  <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                  <td><span className="badge overdue">{overdueDays} days</span></td>
                  <td>
                    <span className={`badge ${severity}`}>
                      {severity === 'critical' ? 'Critical' : severity === 'high' ? 'High' : 'Medium'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {overdue.length === 0 && (
              <tr>
                <td colSpan="6" className="empty-table">No overdue books found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OverdueBooks;
