import React, { useState, useEffect, useCallback } from 'react';
import { bookService } from '../../services/dataService';
import { FiSearch, FiBook, FiUser, FiMapPin } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './BrowseBooks.css';

const BrowseBooks = () => {
  const [books, setBooks] = useState([]);
  const [filteredBooks, setFilteredBooks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [categories, setCategories] = useState([]);

  const fetchBooks = useCallback(async () => {
    try {
      setLoading(true);
      const res = await bookService.getAll({ limit: 1000 });
      const booksData = res.data.data || [];
      setBooks(booksData);
      
      const uniqueCategories = [...new Set(booksData.map(b => b.category))];
      setCategories(uniqueCategories);
      
      filterBooks(booksData, searchTerm, categoryFilter);
    } catch (error) {
      toast.error('Failed to fetch books');
    } finally {
      setLoading(false);
    }
  }, [searchTerm, categoryFilter]);

  const filterBooks = (booksToFilter, search, category) => {
    let filtered = booksToFilter;

    if (search) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.isbn.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (category) {
      filtered = filtered.filter(b => b.category === category);
    }

    setFilteredBooks(filtered);
  };

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  useEffect(() => {
    filterBooks(books, searchTerm, categoryFilter);
  }, [searchTerm, categoryFilter, books]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setCategoryFilter(e.target.value);
  };

  if (loading) {
    return <div className="page-loader"><div className="spinner"></div></div>;
  }

  return (
    <div className="browse-books-page fade-in">
      <div className="page-header">
        <h1><FiBook /> Browse Books</h1>
        <p>Explore our library collection</p>
      </div>

      <div className="browse-filters">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, author, or ISBN..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>

        <select 
          value={categoryFilter} 
          onChange={handleCategoryChange}
          className="category-filter"
        >
          <option value="">All Categories</option>
          {categories.map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      <div className="books-count">
        Showing {filteredBooks.length} of {books.length} books
      </div>

      <div className="books-grid">
        {filteredBooks.map(book => (
          <div key={book._id} className="book-card">
            <div className="book-card-header">
              <div className="book-icon-wrapper">
                <FiBook className="book-icon" />
              </div>
              <div className="book-availability">
                <span className={`status-badge ${book.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                  {book.availableCopies > 0 ? `${book.availableCopies} Available` : 'Not Available'}
                </span>
              </div>
            </div>

            <div className="book-card-body">
              <h3 className="book-title">{book.title}</h3>
              <p className="book-author">
                <FiUser className="inline-icon" />
                {book.author}
              </p>

              <div className="book-details">
                <div className="detail-item">
                  <span className="detail-label">Category</span>
                  <span className="detail-value">{book.category}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">ISBN</span>
                  <span className="detail-value">{book.isbn}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Copies</span>
                  <span className="detail-value">{book.quantity}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Price</span>
                  <span className="detail-value">₹{book.price}</span>
                </div>
              </div>

              {book.location && (
                <div className="book-location">
                  <FiMapPin className="location-icon" />
                  <span>Located at: {book.location}</span>
                </div>
              )}
            </div>

            <div className="book-card-footer">
              {book.availableCopies > 0 ? (
                <span className="book-status-text">Available to Issue</span>
              ) : (
                <span className="book-status-text unavailable">Currently Unavailable</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredBooks.length === 0 && (
        <div className="empty-state">
          <FiBook className="empty-icon" />
          <h3>No Books Found</h3>
          <p>Try adjusting your search or filter criteria</p>
        </div>
      )}
    </div>
  );
};

export default BrowseBooks;
