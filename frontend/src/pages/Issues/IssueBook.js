import React, { useState, useEffect } from 'react';
import { issueService, bookService, userService, membershipService } from '../../services/dataService';
import { FiSend, FiCheckCircle, FiSearch, FiAward } from 'react-icons/fi';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';

const IssueBook = () => {
  const { isAdmin, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [books, setBooks] = useState([]);
  const [memberships, setMemberships] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [selectedBook, setSelectedBook] = useState('');
  const [selectedUserData, setSelectedUserData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Search terms for dropdowns
  const [userSearch, setUserSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  useEffect(() => {

    if (isAdmin()) {
      fetchUsers();
    } else {
      // For non-admin users, set their own data
      if (user && user._id) {
        setSelectedUser(user._id);
        setSelectedUserData({
          ...user,
          membershipId: user.membershipId || null
        });
      }
    }
    fetchBooks();
    fetchMemberships();
  }, [isAdmin, user]);

  const fetchUsers = async () => {
    try {
      const res = await userService.getAll({ status: 'active' });
      console.log('Fetched users:', res.data.data);
      setUsers(res.data.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error(error.response?.data?.message || 'Failed to load users');
    }
  };

  const fetchBooks = async () => {
    try {
      const res = await bookService.getAll({ status: 'available', limit: 100 });
      setBooks(res.data.data);
    } catch (error) {
      toast.error('Failed to load books');
    }
  };

  const fetchMemberships = async () => {
    try {
      const res = await membershipService.getAll();
      setMemberships(res.data.data);
    } catch (error) {
      console.error('Failed to load memberships', error);
    }
  };

  const handleUserSelect = (userId) => {
    setSelectedUser(userId);
    const user = users.find(u => u._id === userId);
    if (user) {
      // Ensure membershipId is properly handled (object or string)
      setSelectedUserData({
        ...user,
        membershipId: user.membershipId || null
      });
    }
  };

  const handleIssue = async (e) => {
    e.preventDefault();
    if (!selectedUser || !selectedBook) {
      return toast.warning('Please select both a user and a book.');
    }

    setLoading(true);
    try {
      await issueService.issueBook({ userId: selectedUser, bookId: selectedBook });
      toast.success('Book issued successfully!');
      
      // Reset form and reload books to update availability
      setSelectedBook('');
      fetchBooks();
      fetchUsers();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to issue book');
    } finally {
      setLoading(false);
    }
  };

  const filteredUsers = users.filter(u => 
    u.name.toLowerCase().includes(userSearch.toLowerCase()) || 
    u.email.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredBooks = books.filter(b => 
    b.title.toLowerCase().includes(bookSearch.toLowerCase()) || 
    b.isbn.toLowerCase().includes(bookSearch.toLowerCase())
  );

  // Get user's membership details
  const getUserMembershipDetails = () => {
    if (!selectedUserData?.membershipId) return null;
    
    // Handle both cases: membershipId as object or string
    const membershipId = typeof selectedUserData.membershipId === 'object' 
      ? selectedUserData.membershipId._id 
      : selectedUserData.membershipId;
    
    return memberships.find(m => m._id === membershipId);
  };

  // Calculate due date (FIXED: always 15 days)
  const calculateDueDate = () => {
    const today = new Date();
    const dueDate = new Date(today);
    dueDate.setDate(dueDate.getDate() + 15); // Fixed 15-day rule
    return dueDate;
  };

  const userMembership = getUserMembershipDetails();
  const dueDate = calculateDueDate();

  return (
    <div className="page-container fade-in" style={{ padding: '2rem' }}>
      <div className="page-header">
        <h1>Issue Book</h1>
        <p style={{ color: 'var(--text-secondary)' }}>Assign books to members with active limits.</p>
      </div>

      <div className="modern-form" style={{ maxWidth: '800px', margin: '0 auto' }}>
        <form onSubmit={handleIssue}>
          
          {isAdmin() && (
            <div className="input-group">
              <label>Select Member *</label>
              <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
                <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
                <input 
                  type="text" 
                  placeholder="Search user by name or email..." 
                  value={userSearch} 
                  onChange={(e) => setUserSearch(e.target.value)}
                  style={{ paddingLeft: '2.5rem' }}
                />
              </div>
              <select 
                value={selectedUser} 
                onChange={(e) => handleUserSelect(e.target.value)}
                required
              >
                <option value="">-- Choose Member --</option>
                {filteredUsers.map(u => {
                  const membershipType = typeof u.membershipId === 'object' 
                    ? u.membershipId?.type 
                    : 'No Active Membership';
                  return (
                    <option key={u._id} value={u._id}>
                      {u.name} ({u.email}) - {membershipType}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {!isAdmin() && (
            <div className="input-group">
              <label>Member Name</label>
              <input type="text" value={user.name} disabled />
            </div>
          )}

          {selectedUserData && (
            <div className="membership-info-card" style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1rem' }}>
                <FiAward style={{ color: '#3b82f6', fontSize: '1.3rem' }} />
                <div>
                  <h4 style={{ margin: '0 0 0.2rem 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: '600' }}>
                    {userMembership ? userMembership.type : 'No Active Membership'}
                  </h4>
                  <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem' }}>
                    {userMembership 
                      ? `Max ${userMembership.maxBooksAllowed} books | ₹${userMembership.finePerDay}/day fine`
                      : 'Can still issue books with default 15-day period'}
                  </p>
                </div>
              </div>

              <div className="due-date-display" style={{
                background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
                border: '1px solid #93c5fd',
                borderRadius: '8px',
                padding: '1rem',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Issue Date</p>
                    <p style={{ margin: '0.4rem 0 0 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: '600' }}>
                      {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, color: '#64748b', fontSize: '0.8rem', fontWeight: '600', textTransform: 'uppercase' }}>Due Date</p>
                    <p style={{ margin: '0.4rem 0 0 0', color: '#1e293b', fontSize: '0.95rem', fontWeight: '600' }}>
                      {dueDate ? dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </p>
                  </div>
                </div>
                <p style={{ margin: 0, color: '#64748b', fontSize: '0.75rem', fontStyle: 'italic', borderTop: '1px solid #93c5fd', paddingTop: '0.75rem' }}>
                  📌 All books have a fixed 15-day issue period, regardless of membership type.
                </p>
              </div>
            </div>
          )}

          <div className="input-group">
            <label>Select Book *</label>
            <div style={{ position: 'relative', marginBottom: '0.5rem' }}>
              <FiSearch style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)' }} />
              <input 
                type="text" 
                placeholder="Search book by title or ISBN..." 
                value={bookSearch} 
                onChange={(e) => setBookSearch(e.target.value)}
                style={{ paddingLeft: '2.5rem' }}
              />
            </div>
            <select 
              value={selectedBook} 
              onChange={(e) => setSelectedBook(e.target.value)}
              required
            >
              <option value="">-- Choose Book --</option>
              {filteredBooks.map(b => (
                <option key={b._id} value={b._id}>
                  {b.title} by {b.author} (ISBN: {b.isbn}) - Avail: {b.availableCopies}
                </option>
              ))}
            </select>
            {selectedBook && (
              <div style={{ marginTop: '0.8rem', padding: '1rem', background: 'rgba(34, 197, 94, 0.1)', border: '1px solid rgba(34, 197, 94, 0.3)', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FiCheckCircle style={{ color: 'var(--success)' }} />
                <span style={{ color: 'var(--success)' }}>Book is ready for issue.</span>
              </div>
            )}
          </div>

          <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: '1rem' }} disabled={loading}>
            {loading ? <div className="spinner" style={{ width: '20px', height: '20px', borderWidth: '2px' }}></div> : <><FiSend /> Issue Book to Member</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default IssueBook;
