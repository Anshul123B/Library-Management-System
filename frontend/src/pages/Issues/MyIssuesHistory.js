import React, { useState, useEffect, useCallback } from 'react';
import { issueService } from '../../services/dataService';
import { FiClock, FiCheckCircle, FiAlertTriangle, FiBook } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './MyIssuesHistory.css';

const MyIssuesHistory = () => {
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  const fetchIssues = useCallback(async () => {
    try {
      setLoading(true);
      const res = await issueService.getAll({ limit: 1000 });
      const allIssues = res.data.data || [];
      setIssues(allIssues);
    } catch (error) {
      console.error('Error fetching issues:', error);
      toast.error('Failed to fetch issue history');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchIssues();
  }, [fetchIssues]);

  const getStatusColor = (issue) => {
    if (issue.status === 'returned') return 'returned';
    if (issue.status === 'overdue') return 'overdue';
    const isOverdue = new Date() > new Date(issue.dueDate);
    if (isOverdue) return 'overdue';
    return 'active';
  };

  const getStatusIcon = (issue) => {
    if (issue.status === 'returned') return <FiCheckCircle />;
    if (getStatusColor(issue) === 'overdue') return <FiAlertTriangle />;
    return <FiClock />;
  };

  const getStatus = (issue) => {
    if (issue.status === 'returned') return 'Returned';
    if (getStatusColor(issue) === 'overdue') return 'Overdue';
    return 'Active';
  };

  const filteredIssues = issues.filter(issue => {
    const status = getStatusColor(issue);
    if (activeTab === 'all') return true;
    if (activeTab === 'active') return status === 'active' && issue.status === 'issued';
    if (activeTab === 'returned') return issue.status === 'returned';
    if (activeTab === 'overdue') return status === 'overdue';
    return true;
  });

  const issueCounts = {
    all: issues.length,
    active: issues.filter(i => i.status === 'issued' && getStatusColor(i) === 'active').length,
    returned: issues.filter(i => i.status === 'returned').length,
    overdue: issues.filter(i => getStatusColor(i) === 'overdue').length,
  };

  if (loading) {
    return <div className="page-loader"><div className="spinner"></div></div>;
  }

  return (
    <div className="my-issues-page fade-in">
      <div className="page-header">
        <h1><FiBook /> My Issued Books</h1>
        <p>View your book issue history and status</p>
      </div>

      <div className="issues-tabs">
        {[
          { id: 'all', label: 'All Issues', count: issueCounts.all },
          { id: 'active', label: 'Active', count: issueCounts.active },
          { id: 'returned', label: 'Returned', count: issueCounts.returned },
          { id: 'overdue', label: 'Overdue', count: issueCounts.overdue },
        ].map(tab => (
          <button
            key={tab.id}
            className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
            onClick={() => setActiveTab(tab.id)}
          >
            <span className="tab-label">{tab.label}</span>
            <span className="tab-count">{tab.count}</span>
          </button>
        ))}
      </div>

      <div className="issues-container">
        {filteredIssues.length > 0 ? (
          <div className="issues-list">
            {filteredIssues.map(issue => {
              const isOverdue = new Date() > new Date(issue.dueDate);
              const daysLeft = Math.ceil((new Date(issue.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              const daysPassed = Math.ceil((new Date() - new Date(issue.issueDate)) / (1000 * 60 * 60 * 24));
              const status = getStatus(issue);
              const statusColor = getStatusColor(issue);

              return (
                <div key={issue._id} className={`issue-item status-${statusColor}`}>
                  <div className="issue-item-header">
                    <div className="issue-status-indicator">
                      <span className={`status-icon ${statusColor}`}>
                        {getStatusIcon(issue)}
                      </span>
                      <div className="issue-book-info">
                        <h3 className="issue-book-title">{issue.bookId?.title || 'Unknown Book'}</h3>
                        <p className="issue-book-author">{issue.bookId?.author || 'Unknown Author'}</p>
                      </div>
                    </div>
                    <div className="issue-status-badge">
                      <span className={`status-badge ${statusColor}`}>{status}</span>
                    </div>
                  </div>

                  <div className="issue-details-grid">
                    <div className="detail-card">
                      <span className="detail-label">Issue Date</span>
                      <span className="detail-value">{new Date(issue.issueDate).toLocaleDateString()}</span>
                      <span className="detail-subtext">{daysPassed} days ago</span>
                    </div>

                    <div className="detail-card">
                      <span className="detail-label">Due Date</span>
                      <span className="detail-value">{new Date(issue.dueDate).toLocaleDateString()}</span>
                      {isOverdue && issue.status !== 'returned' ? (
                        <span className="detail-subtext overdue">Overdue by {Math.abs(daysLeft)} days</span>
                      ) : issue.status !== 'returned' ? (
                        <span className="detail-subtext">{Math.max(0, daysLeft)} days left</span>
                      ) : (
                        <span className="detail-subtext">Returned on time</span>
                      )}
                    </div>

                    {issue.returnDate && (
                      <div className="detail-card">
                        <span className="detail-label">Return Date</span>
                        <span className="detail-value">{new Date(issue.returnDate).toLocaleDateString()}</span>
                      </div>
                    )}

                    {issue.fineAmount > 0 && (
                      <div className="detail-card highlight">
                        <span className="detail-label">Fine Amount</span>
                        <span className="detail-value fine-amount">₹{issue.fineAmount}</span>
                      </div>
                    )}
                  </div>

                  <div className="issue-item-footer">
                    <div className="issue-isbn">
                      <span className="isbn-label">ISBN:</span>
                      <span className="isbn-value">{issue.bookId?.isbn || 'N/A'}</span>
                    </div>
                    {issue.status === 'issued' && <span className="action-hint">Visit Return Book to process return</span>}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <FiBook className="empty-icon" />
            <h3>No Issues Found</h3>
            <p>
              {activeTab === 'all'
                ? 'You have not issued any books yet.'
                : `You have no ${activeTab} issues.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MyIssuesHistory;
