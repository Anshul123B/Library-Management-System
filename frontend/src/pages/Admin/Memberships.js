import React, { useEffect, useState } from 'react';
import { membershipService } from '../../services/dataService';
import './AdminPages.css';

const Memberships = () => {
  const [memberships, setMemberships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await membershipService.getAll();
        setMemberships(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch memberships');
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  const activeMemberships = memberships.filter((m) => m.status === 'active').length;

  return (
    <div className="admin-page fade-in">
      <div className="admin-header">
        <h1>Memberships</h1>
      </div>
      <p className="admin-subtitle">Manage membership tiers and subscription plans.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="summary-strip">
        <div className="summary-item">
          <h3>{memberships.length}</h3>
          <p>Total Plans</p>
        </div>
        <div className="summary-item">
          <h3>{activeMemberships}</h3>
          <p>Active Plans</p>
        </div>
      </div>

      <div className="admin-table-card">
        <div className="memberships-grid">
          {memberships.map((membership) => (
            <div key={membership._id} className={`membership-card ${membership.status}`}>
              <div className="membership-header">
                <h3>{membership.type}</h3>
                <span className={`status-badge ${membership.status === 'active' ? 'available' : 'unavailable'}`}>
                  {membership.status}
                </span>
              </div>

              <div className="membership-details">
                <div className="detail-row">
                  <span className="label">Duration:</span>
                  <span className="value">{membership.duration} days</span>
                </div>
                <div className="detail-row">
                  <span className="label">Max Books:</span>
                  <span className="value">{membership.maxBooksAllowed}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Price:</span>
                  <span className="value highlight">₹{membership.price}</span>
                </div>
                <div className="detail-row">
                  <span className="label">Fine/Day:</span>
                  <span className="value">₹{membership.finePerDay}</span>
                </div>
              </div>

              <div className="membership-footer">
                <button className="btn-secondary btn-sm">Edit</button>
                <button className="btn-secondary btn-sm btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>

        {memberships.length === 0 && (
          <div className="empty-table">No memberships found.</div>
        )}
      </div>
    </div>
  );
};

export default Memberships;
