import React, { useState, useEffect } from 'react';
import { issueService } from '../../services/dataService';
import { FiRotateCcw, FiSearch, FiAlertTriangle, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const ReturnBook = () => {
  const { isAdmin, user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const res = await issueService.getAll({ status: 'issued' });
      setIssues(res.data.data);
    } catch (error) {
      toast.error('Failed to load active issues');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIssues();
  }, []);

  const handleReturn = async (id) => {
    if (window.confirm('Are you sure you want to return this book?')) {
      try {
        const res = await issueService.returnBook(id);
        toast.success(res.data.message);
        fetchIssues();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Error returning book');
      }
    }
  };

  const filteredIssues = issues.filter(issue => {
    const searchLow = searchTerm.toLowerCase();
    const titleMatch = issue.bookId?.title?.toLowerCase().includes(searchLow);
    const userMatch = issue.userId?.name?.toLowerCase().includes(searchLow);
    const isbnMatch = issue.bookId?.isbn?.toLowerCase().includes(searchLow);
    return titleMatch || userMatch || isbnMatch;
  });

  return (
    <div className="page-container fade-in" style={{ padding: '2rem' }}>
      <div className="flex-header">
        <h1>Return Book</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search user, book, isbn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Member</th>
              <th>Book Details</th>
              <th>Issue Date</th>
              <th>Due Date</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan="6" className="empty-state">Loading actual issues...</td></tr>
            ) : filteredIssues.length > 0 ? (
              filteredIssues.map(issue => {
                const now = new Date();
                const due = new Date(issue.dueDate);
                const isOverdue = now > due;
                const overdueDays = isOverdue ? Math.ceil((now - due) / (1000 * 60 * 60 * 24)) : 0;

                return (
                  <tr key={issue._id} style={{ background: isOverdue ? 'rgba(239, 68, 68, 0.05)' : '' }}>
                    <td>
                      <div style={{ fontWeight: 600 }}>{issue.userId?.name}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{issue.userId?.email}</div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 600 }}>{issue.bookId?.title}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--accent-light)', fontFamily: 'monospace' }}>ISBN: {issue.bookId?.isbn}</div>
                    </td>
                    <td>{new Date(issue.issueDate).toLocaleDateString()}</td>
                    <td style={{ color: isOverdue ? 'var(--danger)' : 'inherit', fontWeight: isOverdue ? 600 : 400 }}>
                      {due.toLocaleDateString()}
                    </td>
                    <td>
                      {isOverdue ? (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--danger)', fontSize: '0.85rem' }}>
                          <FiAlertTriangle /> {overdueDays} days late
                        </div>
                      ) : (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--success)', fontSize: '0.85rem' }}>
                          <FiCheck /> On time
                        </div>
                      )}
                    </td>
                    <td>
                      <button 
                        className="btn-primary" 
                        style={{ padding: '0.5rem 1rem', fontSize: '0.85rem' }}
                        onClick={() => handleReturn(issue._id)}
                      >
                        <FiRotateCcw /> Process Return
                      </button>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr><td colSpan="6" className="empty-state">No active issued books found.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ReturnBook;
