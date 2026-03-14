import React, { useState, useEffect } from 'react';
import { bookService } from '../../services/dataService';
import { FiPlus, FiEdit2, FiTrash2, FiSearch, FiX } from 'react-icons/fi';
import { toast } from 'react-toastify';

const BookManagement = () => {
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    author: '',
    category: '',
    isbn: '',
    price: '',
    quantity: '1',
    location: ''
  });
  const [currentId, setCurrentId] = useState(null);

  const fetchBooks = async () => {
    try {
      setLoading(true);
      const res = await bookService.getAll({ search: searchTerm });
      setBooks(res.data.data);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {\n    const delayDebounceFn = setTimeout(() => {
      fetchBooks();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({
      title: '', author: '', category: '', isbn: '',
      price: '', quantity: '1', location: ''
    });
    setShowModal(true);
  };

  const openEditModal = (book) => {
    setEditMode(true);
    setCurrentId(book._id);
    setFormData({
      title: book.title,
      author: book.author,
      category: book.category,
      isbn: book.isbn,
      price: book.price,
      quantity: book.quantity,
      location: book.location || ''
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await bookService.update(currentId, formData);
        toast.success('Book updated successfully');
      } else {
        await bookService.create(formData);
        toast.success('Book added successfully');
      }
      setShowModal(false);
      fetchBooks();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Error saving book');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      try {
        await bookService.delete(id);
        toast.success('Book deleted successfully');
        fetchBooks();
      } catch (error) {
        toast.error('Failed to delete book');
      }
    }
  };

  if (loading && books.length === 0) return <div className="page-loader"><div className="spinner"></div></div>;

  return (
    <div className="page-container fade-in" style={{ padding: '2rem' }}>
      <div className="flex-header">
        <h1>Book Management</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <div className="search-container">
            <FiSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search title, author, isbn..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={openAddModal}>
            <FiPlus /> Add Book
          </button>
        </div>
      </div>

      <div className="table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Title & Author</th>
              <th>Category</th>
              <th>ISBN</th>
              <th>Status</th>
              <th>Inventory</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {books.map(book => (
              <tr key={book._id}>
                <td>
                  <div style={{ fontWeight: 600 }}>{book.title}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{book.author}</div>
                </td>
                <td><span className="badge" style={{ background: 'rgba(255,255,255,0.1)' }}>{book.category}</span></td>
                <td style={{ fontFamily: 'monospace', color: 'var(--accent-light)' }}>{book.isbn}</td>
                <td>
                  <span className={`status-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                    {book.availableCopies > 0 ? 'Available' : 'Borrowed'}
                  </span>
                </td>
                <td>
                  <span style={{ color: 'var(--success)', fontWeight: 600 }}>{book.availableCopies}</span> 
                  <span style={{ color: 'var(--text-secondary)' }}> / {book.quantity}</span>
                </td>
                <td>
                  <button className="btn-icon edit" onClick={() => openEditModal(book)} title="Edit"><FiEdit2 /></button>
                  <button className="btn-icon delete" onClick={() => handleDelete(book._id)} title="Delete"><FiTrash2 /></button>
                </td>
              </tr>
            ))}
            {books.length === 0 && !loading && (
              <tr><td colSpan="6" className="empty-state">No books found in inventory.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(5px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1100
        }}>
          <div className="modern-form fade-in" style={{ width: '100%', position: 'relative' }}>
            <button 
              className="btn-icon" 
              onClick={() => setShowModal(false)}
              style={{ position: 'absolute', top: '1.5rem', right: '1.5rem' }}
            >
              <FiX />
            </button>
            <h2 style={{ marginBottom: '1.5rem' }}>{editMode ? 'Edit Book' : 'Add New Book'}</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="input-group">
                  <label>Book Title *</label>
                  <input type="text" name="title" required value={formData.title} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Author *</label>
                  <input type="text" name="author" required value={formData.author} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Category *</label>
                  <input type="text" name="category" required value={formData.category} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>ISBN *</label>
                  <input type="text" name="isbn" required value={formData.isbn} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Price (₹) *</label>
                  <input type="number" name="price" min="0" required value={formData.price} onChange={handleInputChange} />
                </div>
                <div className="input-group">
                  <label>Total Quantity *</label>
                  <input type="number" name="quantity" min="1" required value={formData.quantity} onChange={handleInputChange} />
                </div>
              </div>
              <div className="input-group">
                <label>Location / Shelf</label>
                <input type="text" name="location" value={formData.location} onChange={handleInputChange} placeholder="e.g. Shelf A-1" />
              </div>
              <div className="form-actions" style={{ justifyContent: 'flex-end', marginTop: '2rem' }}>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn-primary">Save Book</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookManagement;
