const mongoose = require('mongoose');

const registrationSchema = new mongoose.Schema(
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

    // Payment details
    amountPaid: { type: Number, required: true, min: 0 },
    paymentStatus: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      default: 'pending',
    },
    paymentId: { type: String, default: null }, // external payment gateway ref

    // Registration status
    status: {
      type: String,
      enum: ['active', 'cancelled', 'disqualified'],
      default: 'active',
    },

    // Submission
    submissionUrl: { type: String, default: null },
    submissionNote: { type: String, default: '' },
    submittedAt: { type: Date, default: null },

    // Unique ticket number for this registration
    ticketNumber: {
      type: String,
      unique: true,
    },
  },
  {
    timestamps: true,
  }
);

// One user can register only once per competition
registrationSchema.index({ competition: 1, user: 1 }, { unique: true });
registrationSchema.index({ competition: 1, status: 1 });
registrationSchema.index({ user: 1 });

// Auto-generate ticket number before save
registrationSchema.pre('save', function (next) {
  if (!this.ticketNumber) {
    const timestamp = Date.now().toString(36).toUpperCase();
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.ticketNumber = `FD-${timestamp}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Registration', registrationSchema);
