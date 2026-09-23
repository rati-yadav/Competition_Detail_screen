const User = require('../models/User');
const AppError = require('../utils/AppError');

// GET /api/users/profile  (protected)
exports.getProfile = async (req, res, next) => {
  try {
    res.json({ success: true, data: req.user });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/users/profile  (protected)
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, avatar, phone } = req.body;

    // Disallow password update via this route
    if (req.body.password) {
      return next(new AppError('Use /api/auth/change-password to update your password.', 400));
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      { name, avatar, phone },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
};
