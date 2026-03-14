import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { reportService, bookService, issueService } from '../../services/dataService';
import { Link } from 'react-router-dom';
import {
  FiBook,
  FiUsers,
  FiBookOpen,
  FiAlertTriangle,
  FiTrendingUp,
  FiClock,
  FiFilm
} from 'react-icons/fi';
import MembershipPanel from './MembershipPanel';
import './Dashboard.css';

const Dashboard = () => {
  const { user, isAdmin } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userIssues, setUserIssues] = useState([]);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        if (isAdmin()) {
          const res = await reportService.getDashboard();
          console.log('Dashboard stats:', res.data.data);
          setStats(res.data.data);
        } else {\n          const [booksRes, issuesRes] = await Promise.all([
            bookService.getAll({ limit: 5 }),
            issueService.getAll({ status: 'issued' })\n          ]);
          setStats({
            recentBooks: booksRes.data.data.slice(0, 5)
          });
          setUserIssues(issuesRes.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch dashboard data', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [isAdmin]);

  if (loading) {
    return <div className="page-loader"><div className="spinner"></div></div>;
  }

  const renderAdminDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-banner">
        <h2>Welcome back, Admin! 👋</h2>
        <p>Here's what is happening in your library today.</p>
      </div>

      <div className="stats-grid">
        <Link to="/users" className="stat-link">
          <div className="stat-card">
            <div className="stat-icon user-icon"><FiUsers /></div>
            <div className="stat-info">
              <h3>{stats?.totalUsers || 0}</h3>
              <p>Users</p>
              <small>Click to view all users</small>
            </div>
          </div>
        </Link>
        <Link to="/active-issues" className="stat-link">
          <div className="stat-card">
            <div className="stat-icon issue-icon"><FiBookOpen /></div>
            <div className="stat-info">
              <h3>{stats?.activeIssues || 0}</h3>
              <p>Active Issues</p>
              <small>Click to view issue details</small>
            </div>
          </div>
        </Link>
        <Link to="/overdue-books" className="stat-link">
          <div className="stat-card">
            <div className="stat-icon alert-icon"><FiAlertTriangle /></div>
            <div className="stat-info">
              <h3>{stats?.overdueIssues || 0}</h3>
              <p>Overdue Books</p>
              <small>Click to view overdue list</small>
            </div>
          </div>
        </Link>
        <Link to="/reports" className="stat-link">
          <div className="stat-card">
            <div className="stat-icon book-icon"><FiTrendingUp /></div>
            <div className="stat-info">
              <h3>{stats?.totalFinesCollected || 0}</h3>
              <p>Total Fines</p>
              <small>Click to open reports</small>
            </div>
          </div>
        </Link>
        <Link to="/movies" className="stat-link">
          <div className="stat-card">
            <div className="stat-icon movie-icon"><FiFilm /></div>
            <div className="stat-info">
              <h3>Movies</h3>
              <p>Media Library</p>
              <small>Click to view movies</small>
            </div>
          </div>
        </Link>
      </div>

      <div className="dashboard-sections">
        <div className="recent-activity section-card">
          <div className="section-header">
            <h3><FiTrendingUp /> Recent Transactions</h3>
            <Link to="/reports" className="view-all">View All</Link>
          </div>
          <div className="table-responsive">
            <table className="modern-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Book</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats?.recentTransactions?.map(tx => (
                  <tr key={tx._id}>
                    <td>{tx.userId?.name || 'Unknown'}</td>
                    <td>{tx.bookId?.title || 'N/A'}</td>
                    <td>
                      <span className={`badge ${tx.type}`}>
                        {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </span>
                    </td>
                    <td>₹{tx.amount}</td>
                    <td>{new Date(tx.date).toLocaleDateString()}</td>
                  </tr>
                ))}
                {(!stats?.recentTransactions || stats.recentTransactions.length === 0) && (
                  <tr><td colSpan="5" className="empty-state">No recent transactions</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );

  const renderUserDashboard = () => (
    <div className="dashboard-content">
      <div className="welcome-banner user-banner">
        <h2>Hello, {user.name}! 📚</h2>
        <p>Find your next great read today.</p>
      </div>

      <div className="dashboard-sections">
        <div className="membership-section section-card">
          <MembershipPanel />
        </div>

        <div className="user-issues section-card">
          <div className="section-header">
            <h3><FiClock /> My Issued Books</h3>
            <Link to="/my-issues" className="view-all">View History</Link>
          </div>
          <div className="cards-grid">
            {userIssues.map(issue => {
              const isOverdue = new Date() > new Date(issue.dueDate);
              const daysLeft = Math.ceil((new Date(issue.dueDate) - new Date()) / (1000 * 60 * 60 * 24));
              return (
                <div key={issue._id} className={`issue-card ${isOverdue ? 'overdue' : ''}`}>
                  <div className="issue-card-header">
                    <div className="issue-status-badge">
                      {isOverdue ? 'Overdue' : daysLeft <= 3 ? 'Due Soon' : 'Active'}
                    </div>
                  </div>
                  <div className="issue-book-info">
                    <h4 className="issue-book-title">{issue.bookId?.title || 'Unknown Book'}</h4>
                    <p className="issue-book-author">{issue.bookId?.author || 'Unknown Author'}</p>
                    {issue.bookId?.isbn && (
                      <p className="issue-book-details">ISBN: {issue.bookId.isbn}</p>
                    )}
                  </div>
                  <div className="issue-dates-section">
                    <div className="date-item">
                      <span className="date-label">Issued</span>
                      <span className="date-value">{new Date(issue.issueDate).toLocaleDateString()}</span>
                    </div>
                    <div className="date-item">
                      <span className="date-label">Due</span>
                      <span className={`date-value ${isOverdue ? 'overdue-text' : daysLeft <= 3 ? 'due-soon-text' : ''}`}>
                        {new Date(issue.dueDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  {!isOverdue && daysLeft > 0 && (
                    <div className="days-left-indicator">
                      {daysLeft} day{daysLeft !== 1 ? 's' : ''} left
                    </div>
                  )}
                  {isOverdue && (
                    <div className="overdue-days-indicator">
                      Overdue by {Math.abs(daysLeft)} day{Math.abs(daysLeft) !== 1 ? 's' : ''}
                    </div>
                  )}
                </div>
              );
            })}
            {userIssues.length === 0 && (
              <div className="empty-state full-width">You have no active issued books.</div>
            )}
          </div>
        </div>

        <div className="new-arrivals section-card mt-4">
          <div className="section-header">
            <h3><FiBook /> New Arrivals</h3>
            <Link to="/browse-books" className="view-all">Browse Catalog</Link>
          </div>
          <div className="books-list">
            {stats?.recentBooks?.map(book => (
              <div key={book._id} className="small-book-item">
                <div className="book-item-content">
                  <h4>{book.title}</h4>
                  <p>{book.author}</p>
                </div>
                <span className={`status-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                  {book.availableCopies > 0 ? 'Available' : 'Borrowed'}
                </span>
              </div>
            ))}
          </div>
          <Link to="/browse-books" className="section-cta-button">
            <FiBook /> Browse All Books
          </Link>
        </div>

        <div className="movies-section section-card mt-4">
          <div className="section-header">
            <h3><FiFilm /> Browse Movies</h3>
            <Link to="/browse-movies" className="view-all">View All</Link>
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: 0 }}>Explore our media collection</p>
          <Link to="/browse-movies" className="section-cta-button">
            <FiFilm /> Browse Movies
          </Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="dashboard-page fade-in">
      <div className="page-header">
        <h1>Dashboard</h1>
      </div>
      {isAdmin() ? renderAdminDashboard() : renderUserDashboard()}
    </div>
  );
};

export default Dashboard;
