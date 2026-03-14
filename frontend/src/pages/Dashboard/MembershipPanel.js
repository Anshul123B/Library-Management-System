import React, { useState, useEffect } from 'react';
import { membershipService } from '../../services/dataService';
import { useAuth } from '../../context/AuthContext';
import { FiAward, FiBook, FiDollarSign, FiClock } from 'react-icons/fi';
import './MembershipPanel.css';

const MembershipPanel = () => {
  const { user } = useAuth();
  const [memberships, setMemberships] = useState([]);
  const [userMembership, setUserMembership] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMemberships = async () => {
      try {
        const res = await membershipService.getAll();
        const allMemberships = res.data?.data || [];
        setMemberships(allMemberships);

        if (user?.membershipId) {
          const membershipIdValue = typeof user.membershipId === 'object' 
            ? user.membershipId._id 
            : user.membershipId;
          
          const current = allMemberships.find(m => m._id === membershipIdValue);
          if (current) {
            setUserMembership(current);
          }
        }
      } catch (error) {
        console.error('Failed to fetch memberships', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMemberships();
  }, [user]);

  if (loading) {
    return <div className="membership-panel skeleton"><div className="skeleton-item"></div></div>;
  }

  const isMembershipExpired = () => {
    if (!user?.membershipEndDate) return false;
    return new Date() > new Date(user.membershipEndDate);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const daysUntilExpiry = () => {
    if (!user?.membershipEndDate) return null;
    const today = new Date();
    const endDate = new Date(user.membershipEndDate);
    const daysLeft = Math.ceil((endDate - today) / (1000 * 60 * 60 * 24));
    return daysLeft;
  };

  return (
    <div className="membership-panel-section">
      <div className="membership-panel-header">
        <h3><FiAward /> Your Membership Plan</h3>
      </div>

      {userMembership ? (
        <div className="membership-panel-container">
          <div className="current-membership-card">
            <div className="membership-type-badge">{userMembership.type}</div>
            
            <div className="membership-validity-dates">
              <div className="validity-item">
                <span className="validity-label">Start Date</span>
                <span className="validity-value">{formatDate(user?.membershipStartDate)}</span>
              </div>
              <div className="validity-divider">—</div>
              <div className="validity-item">
                <span className="validity-label">Expiry Date</span>
                <span className={`validity-value ${isMembershipExpired() ? 'expired' : ''}`}>
                  {formatDate(user?.membershipEndDate)}
                </span>
              </div>
            </div>

            {isMembershipExpired() && (
              <div className="membership-expired-warning">
                ⚠️ Your membership has expired. Please renew to continue issuing books.
              </div>
            )}

            {!isMembershipExpired() && daysUntilExpiry() !== null && (
              <div className="membership-active-status">
                ✅ Active - Expires in {daysUntilExpiry()} days
              </div>
            )}
            
            <div className="membership-stats">
              <div className="stat-item">
                <FiBook className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-label">Books Allowed</span>
                  <span className="stat-value">{userMembership.maxBooksAllowed}</span>
                </div>
              </div>
              <div className="stat-item">
                <FiClock className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-label">Issue Period</span>
                  <span className="stat-value">15 days</span>
                </div>
              </div>
              <div className="stat-item">
                <FiDollarSign className="stat-icon" />
                <div className="stat-info">
                  <span className="stat-label">Fine/Day</span>
                  <span className="stat-value">₹{userMembership.finePerDay}</span>
                </div>
              </div>
            </div>

            <div className="membership-note">
              <p>📌 <strong>All books have a fixed 15-day issue period</strong>, regardless of membership type. Overdue fines are calculated at ₹{userMembership.finePerDay}/day based on your membership plan.</p>
            </div>
          </div>

          <div className="membership-plans-grid">
            <h4 className="plans-title">Available Plans</h4>
            {memberships.map(membership => (
              <div 
                key={membership._id} 
                className={`plan-card ${userMembership._id === membership._id ? 'active' : ''}`}
              >
                <div className="plan-badge">{membership.type}</div>
                <div className="plan-details">
                  <div className="plan-row">
                    <span>Duration:</span>
                    <strong>{membership.duration} days</strong>
                  </div>
                  <div className="plan-row">
                    <span>Books:</span>
                    <strong>{membership.maxBooksAllowed}</strong>
                  </div>
                  <div className="plan-row">
                    <span>Price:</span>
                    <strong>₹{membership.price}</strong>
                  </div>
                </div>
                {userMembership._id === membership._id && (
                  <div className="plan-badge-current">Current</div>
                )}
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="no-membership-card">
          <p>You don't have an active membership yet. Please contact the library administrator.</p>
        </div>
      )}
    </div>
  );
};

export default MembershipPanel;
