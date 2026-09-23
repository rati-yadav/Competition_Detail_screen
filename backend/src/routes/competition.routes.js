const express = require('express');
const router = express.Router();
const {
  getAllCompetitions,
  getCompetition,
  createCompetition,
  updateCompetition,
  deleteCompetition,
  getCompetitionStats,
} = require('../controllers/competition.controller');
const { protect, optionalAuth, restrictTo } = require('../middleware/auth');

// Public routes (optionalAuth attaches user context if logged in)
router.get('/', optionalAuth, getAllCompetitions);
router.get('/:idOrSlug', optionalAuth, getCompetition);

// Admin-only routes
router.post('/', protect, restrictTo('admin'), createCompetition);
router.patch('/:id', protect, restrictTo('admin'), updateCompetition);
router.delete('/:id', protect, restrictTo('admin'), deleteCompetition);
router.get('/:id/stats', protect, restrictTo('admin'), getCompetitionStats);

module.exports = router;
