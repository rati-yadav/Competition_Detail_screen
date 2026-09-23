const mongoose = require('mongoose');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const LeaderboardEntry = require('../models/LeaderboardEntry');
const AppError = require('../utils/AppError');

// ------------------------------------------------------------------
// POST /api/registrations/:competitionId/register
// Protected. Registers the authenticated user for a competition.
// Uses a MongoDB transaction to safely decrement available slots.
// ------------------------------------------------------------------
exports.registerForCompetition = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { competitionId } = req.params;
    const userId = req.user._id;

    // Lock the competition document for update
    const competition = await Competition.findOneAndUpdate(
      {
        _id: competitionId,
        isPublished: true,
        status: 'registration_open',
        $expr: { $lt: ['$registeredCount', '$totalSlots'] },
      },
      { $inc: { registeredCount: 1 } },
      { new: true, session }
    );

    if (!competition) {
      await session.abortTransaction();
      session.endSession();

      // Determine why it failed for a helpful message
      const comp = await Competition.findById(competitionId);
      if (!comp) return next(new AppError('Competition not found.', 404));
      if (!comp.isPublished) return next(new AppError('This competition is not available.', 400));
      if (comp.status !== 'registration_open') {
        return next(new AppError(`Registration is not open. Competition status: ${comp.status}`, 400));
      }
      return next(new AppError('No slots remaining for this competition.', 409));
    }

    // Check for duplicate registration
    const existing = await Registration.findOne(
      { competition: competitionId, user: userId },
      null,
      { session }
    );
    if (existing) {
      await session.abortTransaction();
      session.endSession();
      // Roll back the count increment
      await Competition.findByIdAndUpdate(competitionId, { $inc: { registeredCount: -1 } });
      return next(new AppError('You are already registered for this competition.', 409));
    }

    // Create registration
    const [registration] = await Registration.create(
      [
        {
          competition: competitionId,
          user: userId,
          amountPaid: competition.discountedFee ?? competition.entryFee,
          paymentStatus: competition.isFree ? 'completed' : 'pending',
        },
      ],
      { session }
    );

    // Create a leaderboard entry placeholder
    await LeaderboardEntry.create(
      [
        {
          competition: competitionId,
          user: userId,
          registration: registration._id,
          displayName: req.user.name,
          avatarUrl: req.user.avatar,
        },
      ],
      { session }
    );

    await session.commitTransaction();
    session.endSession();

    res.status(201).json({
      success: true,
      message: 'Successfully registered for the competition.',
      data: {
        ticketNumber: registration.ticketNumber,
        paymentStatus: registration.paymentStatus,
        registeredAt: registration.createdAt,
        amountPaid: registration.amountPaid,
        competition: {
          _id: competition._id,
          title: competition.title,
          slug: competition.slug,
          competitionStart: competition.competitionStart,
        },
      },
    });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// ------------------------------------------------------------------
// DELETE /api/registrations/:competitionId/cancel
// Protected. Cancels the authenticated user's registration.
// ------------------------------------------------------------------
exports.cancelRegistration = async (req, res, next) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { competitionId } = req.params;
    const userId = req.user._id;

    const registration = await Registration.findOne(
      { competition: competitionId, user: userId, status: 'active' },
      null,
      { session }
    );

    if (!registration) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('No active registration found.', 404));
    }

    // Check cancellation window — only before competition starts
    const competition = await Competition.findById(competitionId).session(session);
    if (competition && new Date() >= competition.competitionStart) {
      await session.abortTransaction();
      session.endSession();
      return next(new AppError('Cancellations are not allowed after the competition has started.', 400));
    }

    registration.status = 'cancelled';
    await registration.save({ session });

    // Decrement slot count
    await Competition.findByIdAndUpdate(
      competitionId,
      { $inc: { registeredCount: -1 } },
      { session }
    );

    // Remove leaderboard entry
    await LeaderboardEntry.deleteOne({ competition: competitionId, user: userId }, { session });

    await session.commitTransaction();
    session.endSession();

    res.json({ success: true, message: 'Registration cancelled successfully.' });
  } catch (err) {
    await session.abortTransaction();
    session.endSession();
    next(err);
  }
};

// ------------------------------------------------------------------
// POST /api/registrations/:competitionId/submit
// Protected. Submits competition entry.
// ------------------------------------------------------------------
exports.submitEntry = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const { submissionUrl, submissionNote } = req.body;

    if (!submissionUrl) {
      return next(new AppError('Submission URL is required.', 400));
    }

    const competition = await Competition.findById(competitionId);
    if (!competition) return next(new AppError('Competition not found.', 404));

    const now = new Date();
    if (now < competition.competitionStart || now > competition.competitionEnd) {
      return next(new AppError('Submissions are only accepted during the competition window.', 400));
    }

    const registration = await Registration.findOneAndUpdate(
      { competition: competitionId, user: req.user._id, status: 'active' },
      { submissionUrl, submissionNote, submittedAt: now },
      { new: true }
    );

    if (!registration) {
      return next(new AppError('You are not registered for this competition.', 403));
    }

    res.json({ success: true, message: 'Submission received.', data: registration });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// GET /api/registrations/my
// Protected. Returns all registrations for the authenticated user.
// ------------------------------------------------------------------
exports.getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('competition', 'title slug category bannerImage competitionStart status')
      .sort({ createdAt: -1 })
      .lean();

    res.json({ success: true, count: registrations.length, data: registrations });
  } catch (err) {
    next(err);
  }
};
