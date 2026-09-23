const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const AppError = require('../utils/AppError');

// ------------------------------------------------------------------
// GET /api/competitions
// Public. Supports ?category=Dance&status=registration_open&page=1&limit=10
// ------------------------------------------------------------------
exports.getAllCompetitions = async (req, res, next) => {
  try {
    const { category, status, featured, page = 1, limit = 10 } = req.query;

    const filter = { isPublished: true };
    if (category) filter.category = { $regex: category, $options: 'i' };
    if (status) filter.status = status;
    if (featured === 'true') filter.isFeatured = true;

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [competitions, total] = await Promise.all([
      Competition.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit))
        .lean({ virtuals: true }),
      Competition.countDocuments(filter),
    ]);

    res.json({
      success: true,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: competitions,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// GET /api/competitions/:idOrSlug
// Public. Returns full competition detail.
// If user is authenticated (optionalAuth), also returns their registration status.
// ------------------------------------------------------------------
exports.getCompetition = async (req, res, next) => {
  try {
    const { idOrSlug } = req.params;

    // Try by slug first, then by ObjectId
    let competition = await Competition.findOne({ slug: idOrSlug, isPublished: true }).lean({ virtuals: true });
    if (!competition) {
      competition = await Competition.findById(idOrSlug).lean({ virtuals: true });
    }

    if (!competition) {
      return next(new AppError('Competition not found.', 404));
    }

    // Check if authenticated user is registered
    let userRegistration = null;
    if (req.user) {
      userRegistration = await Registration.findOne({
        competition: competition._id,
        user: req.user._id,
        status: 'active',
      }).lean();
    }

    res.json({
      success: true,
      data: competition,
      userRegistration: userRegistration
        ? {
            registeredAt: userRegistration.createdAt,
            ticketNumber: userRegistration.ticketNumber,
            paymentStatus: userRegistration.paymentStatus,
            submittedAt: userRegistration.submittedAt,
          }
        : null,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// POST /api/competitions  (admin only)
// ------------------------------------------------------------------
exports.createCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.create(req.body);
    res.status(201).json({ success: true, data: competition });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// PATCH /api/competitions/:id  (admin only)
// ------------------------------------------------------------------
exports.updateCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!competition) return next(new AppError('Competition not found.', 404));
    res.json({ success: true, data: competition });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// DELETE /api/competitions/:id  (admin only)
// ------------------------------------------------------------------
exports.deleteCompetition = async (req, res, next) => {
  try {
    const competition = await Competition.findByIdAndDelete(req.params.id);
    if (!competition) return next(new AppError('Competition not found.', 404));
    res.json({ success: true, message: 'Competition deleted.' });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// GET /api/competitions/:id/stats  (admin only)
// Returns aggregate registration stats for a competition.
// ------------------------------------------------------------------
exports.getCompetitionStats = async (req, res, next) => {
  try {
    const competition = await Competition.findById(req.params.id);
    if (!competition) return next(new AppError('Competition not found.', 404));

    const stats = await Registration.aggregate([
      { $match: { competition: competition._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalRevenue: { $sum: '$amountPaid' },
        },
      },
    ]);

    res.json({ success: true, data: stats });
  } catch (err) {
    next(err);
  }
};
