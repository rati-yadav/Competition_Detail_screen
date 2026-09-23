const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('../controllers/user.controller');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/profile', getProfile);
router.patch('/profile', updateProfile);

module.exports = router;
