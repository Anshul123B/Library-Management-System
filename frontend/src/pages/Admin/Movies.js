import React, { useEffect, useState } from 'react';
import { movieService } from '../../services/dataService';
import './AdminPages.css';

const Movies = () => {
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const res = await movieService.getAll();
        setMovies(res.data?.data || []);
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to fetch movies');
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner"></div></div>;

  const totalCopies = movies.reduce((sum, m) => sum + m.quantity, 0);
  const availableCopies = movies.reduce((sum, m) => sum + m.availableCopies, 0);
  const issuedCopies = totalCopies - availableCopies;

  return (
    <div className="admin-page fade-in">
      <div className="admin-header">
        <h1>Movies</h1>
      </div>
      <p className="admin-subtitle">Manage and view all movies in the library's media collection.</p>

      {error && <p className="error-text">{error}</p>}

      <div className="summary-strip">
        <div className="summary-item">
          <h3>{movies.length}</h3>
          <p>Total Titles</p>
        </div>
        <div className="summary-item">
          <h3>{totalCopies}</h3>
          <p>Total Copies</p>
        </div>
        <div className="summary-item">
          <h3>{availableCopies}</h3>
          <p>Available</p>
        </div>
        <div className="summary-item">
          <h3>{issuedCopies}</h3>
          <p>Issued</p>
        </div>
      </div>

      <div className="admin-table-card table-responsive">
        <table className="modern-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Director</th>
              <th>Genre</th>
              <th>Year</th>
              <th>Quantity</th>
              <th>Available</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {movies.map((movie) => (
              <tr key={movie._id}>
                <td><strong>{movie.title}</strong></td>
                <td>{movie.director}</td>
                <td>{movie.genre}</td>
                <td>{movie.releaseYear}</td>
                <td>{movie.quantity}</td>
                <td>{movie.availableCopies}</td>
                <td>
                  <span className={`status-badge ${movie.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                    {movie.availableCopies > 0 ? 'Available' : 'Out of Stock'}
                  </span>
                </td>
              </tr>
            ))}
            {movies.length === 0 && (
              <tr>
                <td colSpan="7" className="empty-table">No movies found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Movies;
