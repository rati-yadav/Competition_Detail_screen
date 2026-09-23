const express = require('express');
const router = express.Router();
const {
  registerForCompetition,
  cancelRegistration,
  submitEntry,
  getMyRegistrations,
} = require('../controllers/registration.controller');
const { protect } = require('../middleware/auth');

// All registration routes require authentication
router.use(protect);

router.get('/my', getMyRegistrations);
router.post('/:competitionId/register', registerForCompetition);
router.delete('/:competitionId/cancel', cancelRegistration);
router.post('/:competitionId/submit', submitEntry);

module.exports = router;
