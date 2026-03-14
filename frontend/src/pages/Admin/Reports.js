import React, { useEffect, useState } from 'react';
import { reportService } from '../../services/dataService';
import './AdminPages.css';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [inventorySummary, setInventorySummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [txRes, invRes] = await Promise.all([
          reportService.getTransactions(),
          reportService.getInventory(),
        ]);

        console.log('Transactions response:', txRes.data?.data);
        console.log('Inventory response:', invRes.data?.summary);

        setTransactions(txRes.data?.data || []);
        setInventorySummary(invRes.data?.summary || null);
      } catch (err) {
        console.error('Error fetching reports:', err);
        setError(err.response?.data?.message || 'Failed to fetch reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  const totalFines = transactions
    .filter((t) => t.type === 'fine')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  return (
    <div className="admin-page fade-in">
      <div className="admin-header">
        <h1>Reports</h1>
      </div>
      <p className="admin-subtitle">Transactions, inventory health and fine collection overview.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="summary-strip">
        <div className="summary-item">
          <h3>{transactions.length}</h3>
          <p>Total Transactions</p>
        </div>
        <div className="summary-item">
          <h3>{inventorySummary?.totalTitles || 0}</h3>
          <p>Total Titles</p>
        </div>
        <div className="summary-item">
          <h3>{inventorySummary?.totalIssued || 0}</h3>
          <p>Issued Copies</p>
        </div>
        <div className="summary-item">
          <h3>{totalFines}</h3>
          <p>Total Fine Amount</p>
        </div>
      </div>

      <div className="admin-table-card table-responsive">
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
            {transactions.map((tx) => (
              <tr key={tx._id}>
                <td>{tx.userId?.name || 'Unknown'}</td>
                <td>{tx.bookId?.title || 'N/A'}</td>
                <td><span className={`badge ${tx.type}`}>{tx.type}</span></td>
                <td>₹{tx.amount || 0}</td>
                <td>{new Date(tx.date).toLocaleDateString()}</td>
              </tr>
            ))}
            {transactions.length === 0 && (
              <tr>
                <td colSpan="5" className="empty-table">No transactions found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Reports;
