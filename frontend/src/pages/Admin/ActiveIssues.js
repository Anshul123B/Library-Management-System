import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/dataService';
import './AdminPages.css';

const ActiveIssues = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchActiveIssues = async () => {
      try {
        const res = await reportService.getActiveIssues();
        const issuesData = res.data?.data || [];
        
        console.log('Active Issues Response:', issuesData);
        
        setIssues(issuesData);
      } catch (err) {
        console.error('Error fetching active issues:', err);
        setError(err.response?.data?.message || 'Failed to fetch active issues');
      } finally {
        setLoading(false);
      }
    };

    fetchActiveIssues();
  }, []);

  const getIssueDaysCount = (issueDate) => {
    const today = new Date();
    const issued = new Date(issueDate);
    const diffTime = Math.abs(today - issued);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const isDueOrOverdue = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    return today > due;
  };

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div className="admin-page fade-in">
      <div className="admin-header">
        <h1>Active Issues</h1>
      </div>
      <p className="admin-subtitle">Books that are currently issued to users.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="summary-strip">
        <div className="summary-item">
          <h3>{issues.length}</h3>
          <p>Issued Books</p>
        </div>
        <div className="summary-item">
          <h3>{issues.filter(i => isDueOrOverdue(i.dueDate)).length}</h3>
          <p>Due/Overdue</p>
        </div>
      </div>

      <div className="admin-table-card table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>User Name</th>
              <th>User Email</th>
              <th>Book Title</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Days Issued</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {issues.map((item) => {
              const userName = typeof item.userId === 'object' ? item.userId?.name : 'Unknown';
              const userEmail = typeof item.userId === 'object' ? item.userId?.email : 'N/A';
              const bookTitle = typeof item.bookId === 'object' ? item.bookId?.title : 'Unknown';
              const isOverdue = isDueOrOverdue(item.dueDate);
              const daysIssued = getIssueDaysCount(item.issueDate);

              return (
                <tr key={item._id} style={{ backgroundColor: isOverdue ? '#ffe6e6' : 'transparent' }}>
                  <td><strong>{userName}</strong></td>
                  <td>{userEmail}</td>
                  <td>{bookTitle}</td>
                  <td>{new Date(item.issueDate).toLocaleDateString()}</td>
                  <td>{new Date(item.dueDate).toLocaleDateString()}</td>
                  <td>{daysIssued} days</td>
                  <td>
                    <span className={`badge ${isOverdue ? 'overdue' : 'issued'}`}>
                      {isOverdue ? 'Overdue' : 'Issued'}
                    </span>
                  </td>
                </tr>
              );
            })}
            {issues.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-table">No active issues found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ActiveIssues;
