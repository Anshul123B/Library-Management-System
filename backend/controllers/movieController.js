const Movie = require('../models/Movie');

/**
 * @desc    Get all movies
 * @route   GET /api/movies
 * @access  Public
 */
const getMovies = async (req, res, next) => {
  try {
    const { search, genre, director } = req.query;
    const filter = {};

    if (genre) filter.genre = { $regex: genre, $options: 'i' };
    if (director) filter.director = { $regex: director, $options: 'i' };
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { director: { $regex: search, $options: 'i' } },
        { genre: { $regex: search, $options: 'i' } },
      ];
    }

    const movies = await Movie.find(filter).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: movies.length,
      data: movies,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get single movie
 * @route   GET /api/movies/:id
 * @access  Public
 */
const getMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    res.status(200).json({
      success: true,
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add a new movie
 * @route   POST /api/movies
 * @access  Admin
 */
const addMovie = async (req, res, next) => {
  try {
    const { title, director, genre, releaseYear, quantity } = req.body;

    const movie = await Movie.create({
      title,
      director,
      genre,
      releaseYear,
      quantity: quantity || 1,
      availableCopies: quantity || 1,
    });

    res.status(201).json({
      success: true,
      message: 'Movie added successfully.',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update movie
 * @route   PUT /api/movies/:id
 * @access  Admin
 */
const updateMovie = async (req, res, next) => {
  try {
    let movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    if (req.body.quantity !== undefined) {
      const issuedCopies = movie.quantity - movie.availableCopies;
      req.body.availableCopies = Math.max(0, req.body.quantity - issuedCopies);
    }

    movie = await Movie.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: 'Movie updated successfully.',
      data: movie,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Delete movie
 * @route   DELETE /api/movies/:id
 * @access  Admin
 */
const deleteMovie = async (req, res, next) => {
  try {
    const movie = await Movie.findById(req.params.id);

    if (!movie) {
      return res.status(404).json({
        success: false,
        message: 'Movie not found.',
      });
    }

    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Movie deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};

module.exports = { getMovies, getMovie, addMovie, updateMovie, deleteMovie };
