const LeaderboardEntry = require('../models/LeaderboardEntry');
const Competition = require('../models/Competition');
const AppError = require('../utils/AppError');

// ------------------------------------------------------------------
// GET /api/leaderboard/:competitionId
// Public. Returns ranked leaderboard for a competition.
// ------------------------------------------------------------------
exports.getLeaderboard = async (req, res, next) => {
  try {
    const { competitionId } = req.params;
    const { limit = 20, page = 1 } = req.query;

    const competition = await Competition.findById(competitionId).lean();
    if (!competition) return next(new AppError('Competition not found.', 404));

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [entries, total] = await Promise.all([
      LeaderboardEntry.find({ competition: competitionId })
        .sort({ finalScore: -1, updatedAt: 1 })
        .skip(skip)
        .limit(parseInt(limit))
        .populate('user', 'name avatar')
        .lean(),
      LeaderboardEntry.countDocuments({ competition: competitionId }),
    ]);

    // Assign ranks (accounting for ties)
    let currentRank = skip + 1;
    let previousScore = null;
    const ranked = entries.map((entry, idx) => {
      if (entry.finalScore !== previousScore) {
        currentRank = skip + idx + 1;
        previousScore = entry.finalScore;
      }
      return { ...entry, computedRank: currentRank };
    });

    res.json({
      success: true,
      competition: { _id: competition._id, title: competition.title, status: competition.status },
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: ranked,
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// GET /api/leaderboard/:competitionId/me
// Protected. Returns the authenticated user's rank and score.
// ------------------------------------------------------------------
exports.getMyRank = async (req, res, next) => {
  try {
    const { competitionId } = req.params;

    const entry = await LeaderboardEntry.findOne({
      competition: competitionId,
      user: req.user._id,
    }).lean();

    if (!entry) {
      return next(new AppError('You are not on the leaderboard for this competition.', 404));
    }

    // Count how many entries have a higher score
    const ahead = await LeaderboardEntry.countDocuments({
      competition: competitionId,
      finalScore: { $gt: entry.finalScore },
    });

    res.json({
      success: true,
      data: {
        ...entry,
        rank: ahead + 1,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ------------------------------------------------------------------
// PATCH /api/leaderboard/:competitionId/:userId/score  (admin/judge only)
// Updates a participant's score and recomputes ranks.
// ------------------------------------------------------------------
exports.updateScore = async (req, res, next) => {
  try {
    const { competitionId, userId } = req.params;
    const { judgeScore, feedback } = req.body;

    if (judgeScore === undefined || judgeScore === null) {
      return next(new AppError('judgeScore is required.', 400));
    }
    if (judgeScore < 0 || judgeScore > 100) {
      return next(new AppError('judgeScore must be between 0 and 100.', 400));
    }

    const entry = await LeaderboardEntry.findOne({ competition: competitionId, user: userId });
    if (!entry) return next(new AppError('Leaderboard entry not found.', 404));

    // Upsert judge score
    const judgeIndex = entry.judgeScores.findIndex(
      (j) => j.judgeId?.toString() === req.user._id.toString()
    );
    if (judgeIndex >= 0) {
      entry.judgeScores[judgeIndex].score = judgeScore;
      entry.judgeScores[judgeIndex].feedback = feedback || '';
      entry.judgeScores[judgeIndex].scoredAt = new Date();
    } else {
      entry.judgeScores.push({ judgeId: req.user._id, score: judgeScore, feedback: feedback || '' });
    }

    // Recompute final score as average of all judge scores
    const avg =
      entry.judgeScores.reduce((sum, j) => sum + j.score, 0) / entry.judgeScores.length;
    entry.finalScore = Math.round(avg * 100) / 100;

    await entry.save();

    res.json({ success: true, data: entry });
  } catch (err) {
    next(err);
  }
};
