import React, { useState, useEffect, useCallback } from 'react';
import { movieService } from '../../services/dataService';
import { FiSearch, FiFilm } from 'react-icons/fi';
import { toast } from 'react-toastify';
import './BrowseMovies.css';

const BrowseMovies = () => {
  const [movies, setMovies] = useState([]);
  const [filteredMovies, setFilteredMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  const fetchMovies = useCallback(async () => {
    try {
      setLoading(true);
      const res = await movieService.getAll({ limit: 1000 });
      const moviesData = res.data.data || [];
      setMovies(moviesData);
      filterMovies(moviesData, searchTerm);
    } catch (error) {
      console.error('Error fetching movies:', error);
      toast.error('Failed to fetch movies');
    } finally {
      setLoading(false);
    }
  }, [searchTerm]);

  const filterMovies = (moviesToFilter, search) => {
    let filtered = moviesToFilter;

    if (search) {
      filtered = filtered.filter(m =>
        m.title.toLowerCase().includes(search.toLowerCase()) ||
        m.director.toLowerCase().includes(search.toLowerCase()) ||
        (m.imdbId && m.imdbId.toLowerCase().includes(search.toLowerCase()))
      );
    }

    setFilteredMovies(filtered);
  };

  useEffect(() => {
    fetchMovies();
  }, [fetchMovies]);

  useEffect(() => {
    filterMovies(movies, searchTerm);
  }, [searchTerm, movies]);

  const handleSearch = (e) => {
    setSearchTerm(e.target.value);
  };

  if (loading) {
    return <div className="page-loader"><div className="spinner"></div></div>;
  }

  const totalCopies = movies.reduce((sum, m) => sum + m.quantity, 0);
  const availableCopies = movies.reduce((sum, m) => sum + m.availableCopies, 0);

  return (
    <div className="browse-movies-page fade-in">
      <div className="page-header">
        <h1><FiFilm /> Browse Movies</h1>
        <p>Explore our media collection</p>
      </div>

      <div className="movies-summary">
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
          <p>Available Now</p>
        </div>
      </div>

      <div className="movies-search">
        <div className="search-container">
          <FiSearch className="search-icon" />
          <input
            type="text"
            placeholder="Search by title, director, or IMDB ID..."
            value={searchTerm}
            onChange={handleSearch}
            className="search-input"
          />
        </div>
      </div>

      <div className="movies-count">
        Showing {filteredMovies.length} of {movies.length} movies
      </div>

      <div className="movies-grid">
        {filteredMovies.map(movie => (
          <div key={movie._id} className="movie-card">
            <div className="movie-card-header">
              <div className="movie-poster-wrapper">
                {movie.posterUrl ? (
                  <img src={movie.posterUrl} alt={movie.title} className="movie-poster" />
                ) : (
                  <div className="movie-poster-placeholder">
                    <FiFilm className="placeholder-icon" />
                  </div>
                )}
              </div>
              <div className="movie-availability">
                <span className={`status-badge ${movie.availableCopies > 0 ? 'available' : 'unavailable'}`}>
                  {movie.availableCopies > 0 ? `${movie.availableCopies} Available` : 'Not Available'}
                </span>
              </div>
            </div>

            <div className="movie-card-body">
              <h3 className="movie-title">{movie.title}</h3>
              
              {movie.director && (
                <p className="movie-director">
                  <strong>Director:</strong> {movie.director}
                </p>
              )}

              {movie.genre && (
                <p className="movie-genre">
                  <strong>Genre:</strong> {movie.genre}
                </p>
              )}

              <div className="movie-details">
                <div className="detail-item">
                  <span className="detail-label">Release Year</span>
                  <span className="detail-value">{movie.releaseYear || 'N/A'}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Duration</span>
                  <span className="detail-value">{movie.duration || 'N/A'} mins</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Total Copies</span>
                  <span className="detail-value">{movie.quantity}</span>
                </div>
              </div>

              {movie.description && (
                <p className="movie-description">{movie.description}</p>
              )}

              {movie.imdbId && (
                <div className="movie-rating">
                  <span className="rating-label">IMDB ID:</span>
                  <span className="rating-value">{movie.imdbId}</span>
                </div>
              )}
            </div>

            <div className="movie-card-footer">
              {movie.availableCopies > 0 ? (
                <span className="movie-status-text">Available to Issue</span>
              ) : (
                <span className="movie-status-text unavailable">Currently Unavailable</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredMovies.length === 0 && (
        <div className="empty-state">
          <FiFilm className="empty-icon" />
          <h3>No Movies Found</h3>
          <p>Try adjusting your search criteria</p>
        </div>
      )}
    </div>
  );
};

export default BrowseMovies;
