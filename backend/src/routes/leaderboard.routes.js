const express = require('express');
const router = express.Router();
const {
  getLeaderboard,
  getMyRank,
  updateScore,
} = require('../controllers/leaderboard.controller');
const { protect, restrictTo } = require('../middleware/auth');

// Public leaderboard
router.get('/:competitionId', getLeaderboard);

// My rank — must be authenticated
router.get('/:competitionId/me', protect, getMyRank);

// Score update — admin or instructor only
router.patch('/:competitionId/:userId/score', protect, restrictTo('admin', 'instructor'), updateScore);

module.exports = router;
