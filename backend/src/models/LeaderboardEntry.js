const mongoose = require('mongoose');

const leaderboardEntrySchema = new mongoose.Schema(
  {
    competition: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Competition',
      required: true,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    registration: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      required: true,
    },

    // Scoring
    score: { type: Number, default: 0, min: 0 },
    rank: { type: Number, default: null },

    // Judge scores (array to support multiple judges)
    judgeScores: [
      {
        judgeId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        score: { type: Number, min: 0, max: 100 },
        feedback: { type: String, default: '' },
        scoredAt: { type: Date, default: Date.now },
        _id: false,
      },
    ],

    // Votes from public (if public voting is enabled)
    voteCount: { type: Number, default: 0, min: 0 },

    // Final computed score = avg(judgeScores) + weight * voteCount
    finalScore: { type: Number, default: 0 },

    // Display name cached for performance (denormalized)
    displayName: { type: String, default: '' },
    avatarUrl: { type: String, default: null },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// One entry per user per competition
leaderboardEntrySchema.index({ competition: 1, user: 1 }, { unique: true });
// Fast rank queries
leaderboardEntrySchema.index({ competition: 1, finalScore: -1 });
leaderboardEntrySchema.index({ competition: 1, rank: 1 });

module.exports = mongoose.model('LeaderboardEntry', leaderboardEntrySchema);
