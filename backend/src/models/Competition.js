const mongoose = require('mongoose');

// Prize tier sub-schema
const prizeTierSchema = new mongoose.Schema(
  {
    rank: { type: Number, required: true },          // 1, 2, 3 …
    label: { type: String, required: true },          // "1st Winner", "2nd Winner" …
    medalColor: {
      type: String,
      enum: ['gold', 'silver', 'bronze', 'special'],
      default: 'special',
    },
    amount: { type: Number, required: true },         // prize in INR
  },
  { _id: false }
);

// Instructor sub-schema (embedded for read performance)
const instructorSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    name: { type: String, required: true },
    avatar: { type: String, default: null },
    bio: { type: String, default: '' },
    rating: { type: Number, min: 0, max: 5, default: 0 },
    totalStudents: { type: Number, default: 0 },
    totalCourses: { type: Number, default: 0 },
    experience: { type: String, default: '' },       // e.g. "10+ years"
  },
  { _id: false }
);

const competitionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Competition title is required'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      lowercase: true,
      trim: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },                                                // e.g. "Dance", "Music"
    tags: [{ type: String, trim: true }],

    // Pricing
    entryFee: {
      type: Number,
      required: true,
      min: [0, 'Entry fee cannot be negative'],
    },
    discountedFee: {
      type: Number,
      default: null,
    },
    isFree: {
      type: Boolean,
      default: false,
    },

    // Instructor / host
    instructor: { type: instructorSchema, required: true },

    // Lifecycle dates
    registrationStart: { type: Date, required: true },
    registrationEnd: { type: Date, required: true },
    competitionStart: { type: Date, required: true },
    competitionEnd: { type: Date, required: true },
    resultDate: { type: Date, default: null },

    // Status — computed from dates but also manually overridable
    status: {
      type: String,
      enum: ['upcoming', 'registration_open', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },

    // Participation
    totalSlots: { type: Number, required: true, min: 1 },
    registeredCount: { type: Number, default: 0, min: 0 },

    // Content
    about: { type: String, default: '' },
    rules: [{ type: String }],
    prizes: [prizeTierSchema],

    // Media
    bannerImage: { type: String, default: null },
    thumbnailImage: { type: String, default: null },

    // Certificate
    hasCertificate: { type: Boolean, default: false },

    // Flags
    isFeatured: { type: Boolean, default: false },
    isPublished: { type: Boolean, default: true },

    // Submission info
    submissionType: {
      type: String,
      enum: ['video', 'image', 'audio', 'text', 'live'],
      default: 'video',
    },
    submissionInstructions: { type: String, default: '' },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: remaining slots
competitionSchema.virtual('remainingSlots').get(function () {
  return Math.max(0, this.totalSlots - this.registeredCount);
});

// Virtual: participation percentage
competitionSchema.virtual('participationPercent').get(function () {
  if (this.totalSlots === 0) return 0;
  return Math.min(100, Math.round((this.registeredCount / this.totalSlots) * 100));
});

// Virtual: computed live status based on current time
competitionSchema.virtual('liveStatus').get(function () {
  const now = new Date();
  if (this.status === 'cancelled') return 'cancelled';
  if (now < this.registrationStart) return 'upcoming';
  if (now >= this.registrationStart && now <= this.registrationEnd) return 'registration_open';
  if (now > this.registrationEnd && now <= this.competitionEnd) return 'ongoing';
  return 'completed';
});

// Auto-generate slug from title before save
competitionSchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }
  next();
});

// Index for common queries
competitionSchema.index({ status: 1, isPublished: 1 });
competitionSchema.index({ category: 1 });
competitionSchema.index({ slug: 1 });
competitionSchema.index({ registrationEnd: 1 });

module.exports = mongoose.model('Competition', competitionSchema);
