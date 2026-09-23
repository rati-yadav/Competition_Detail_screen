/**
 * Seed script — populates the database with realistic sample data.
 * Run: npm run seed
 *
 * WARNING: Clears existing Competition, Registration, LeaderboardEntry, and User data.
 */
require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const LeaderboardEntry = require('../models/LeaderboardEntry');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/feedants';

// ─── Sample Users ─────────────────────────────────────────────────
const usersData = [
  { name: 'Admin User', email: 'admin@feedants.com', password: 'Admin@123', role: 'admin' },
  { name: 'Mair Jo Dubey', email: 'mair@feedants.com', password: 'Instructor@123', role: 'instructor', avatar: 'https://i.pravatar.cc/150?img=47' },
  { name: 'Priya Sharma', email: 'priya@example.com', password: 'User@1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=1' },
  { name: 'Rahul Verma', email: 'rahul@example.com', password: 'User@1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=3' },
  { name: 'Sneha Patel', email: 'sneha@example.com', password: 'User@1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=5' },
  { name: 'Arjun Nair', email: 'arjun@example.com', password: 'User@1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=7' },
  { name: 'Deepika Singh', email: 'deepika@example.com', password: 'User@1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=9' },
  { name: 'Karan Mehta', email: 'karan@example.com', password: 'User@1234', role: 'user', avatar: 'https://i.pravatar.cc/150?img=11' },
];

// ─── Sample Competitions ──────────────────────────────────────────
const now = new Date();
const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

const competitionsData = [
  {
    title: 'Feedants Classical Dance',
    slug: 'feedants-classical-dance',
    category: 'Dance',
    tags: ['classical', 'bharatanatyam', 'dance'],
    entryFee: 1500,
    discountedFee: 99,
    isFree: false,
    instructor: {
      name: 'Mair Jo Dubey',
      avatar: 'https://i.pravatar.cc/150?img=47',
      bio: 'Award-winning classical dancer with 15+ years of teaching experience across India.',
      rating: 4.8,
      totalStudents: 1200,
      totalCourses: 8,
      experience: '15+ years',
    },
    registrationStart: daysFromNow(-5),
    registrationEnd: daysFromNow(10),
    competitionStart: daysFromNow(12),
    competitionEnd: daysFromNow(15),
    resultDate: daysFromNow(18),
    status: 'registration_open',
    totalSlots: 500,
    registeredCount: 312,
    about: `The Feedants Classical Dance Competition is a celebration of India's rich dance heritage. 
    Participants from all skill levels are welcome to showcase their mastery of classical dance forms 
    including Bharatanatyam, Kathak, Odissi, Manipuri, and more. Our expert panel of judges will 
    evaluate based on technique, expression, rhythm, and overall presentation. 
    This is your chance to shine on a national stage!`,
    rules: [
      'Performance must be 2–5 minutes in duration.',
      'Only classical Indian dance forms accepted.',
      'Participants must submit a video recording.',
      'Background music must be original or royalty-free.',
      'Costumes must be appropriate to the dance form.',
      'Judges\' decisions are final.',
    ],
    prizes: [
      { rank: 1, label: '1st Winner', medalColor: 'gold', amount: 5000 },
      { rank: 2, label: '2nd Winner', medalColor: 'silver', amount: 3000 },
      { rank: 3, label: '3rd Winner', medalColor: 'bronze', amount: 2000 },
      { rank: 4, label: '4th Winner', medalColor: 'special', amount: 1000 },
      { rank: 5, label: '5th Winner', medalColor: 'special', amount: 500 },
      { rank: 6, label: '6th Winner', medalColor: 'special', amount: 100 },
    ],
    hasCertificate: true,
    isFeatured: true,
    submissionType: 'video',
    submissionInstructions: 'Upload a clear video of your performance. Ensure good lighting and audio quality. Max file size: 500MB.',
    bannerImage: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=800',
    thumbnailImage: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=400',
  },
  {
    title: 'Online Singing Championship',
    slug: 'online-singing-championship',
    category: 'Music',
    tags: ['singing', 'vocal', 'music'],
    entryFee: 299,
    discountedFee: null,
    isFree: false,
    instructor: {
      name: 'Sunita Rao',
      avatar: 'https://i.pravatar.cc/150?img=20',
      bio: 'Playback singer with 20 years of experience in Bollywood and classical music.',
      rating: 4.9,
      totalStudents: 900,
      totalCourses: 5,
      experience: '20+ years',
    },
    registrationStart: daysFromNow(-2),
    registrationEnd: daysFromNow(20),
    competitionStart: daysFromNow(22),
    competitionEnd: daysFromNow(25),
    resultDate: daysFromNow(28),
    status: 'registration_open',
    totalSlots: 300,
    registeredCount: 87,
    about: 'Showcase your vocal talent in the Online Singing Championship. Open to all genres — Bollywood, classical, folk, and indie.',
    rules: ['Performance must be 2–4 minutes.', 'Live or recorded accepted.', 'No offensive lyrics.'],
    prizes: [
      { rank: 1, label: '1st Winner', medalColor: 'gold', amount: 10000 },
      { rank: 2, label: '2nd Winner', medalColor: 'silver', amount: 5000 },
      { rank: 3, label: '3rd Winner', medalColor: 'bronze', amount: 2500 },
    ],
    hasCertificate: true,
    isFeatured: false,
    submissionType: 'video',
    submissionInstructions: 'Record a clear audio/video. Ensure no background noise.',
    bannerImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
    thumbnailImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
  },
  {
    title: 'Photography Contest — Nature',
    slug: 'photography-contest-nature',
    category: 'Photography',
    tags: ['photography', 'nature', 'art'],
    entryFee: 0,
    isFree: true,
    instructor: {
      name: 'Vikram Desai',
      avatar: 'https://i.pravatar.cc/150?img=33',
      bio: 'National Geographic contributing photographer.',
      rating: 4.7,
      totalStudents: 500,
      totalCourses: 3,
      experience: '12+ years',
    },
    registrationStart: daysFromNow(5),
    registrationEnd: daysFromNow(30),
    competitionStart: daysFromNow(32),
    competitionEnd: daysFromNow(40),
    resultDate: daysFromNow(45),
    status: 'upcoming',
    totalSlots: 1000,
    registeredCount: 0,
    about: 'Capture the beauty of nature in this free-to-enter photography contest. Winners receive equipment vouchers.',
    rules: ['Photos must be original.', 'Minimum resolution: 4MP.', 'No heavy post-processing.'],
    prizes: [
      { rank: 1, label: '1st Winner', medalColor: 'gold', amount: 3000 },
      { rank: 2, label: '2nd Winner', medalColor: 'silver', amount: 1500 },
      { rank: 3, label: '3rd Winner', medalColor: 'bronze', amount: 500 },
    ],
    hasCertificate: true,
    isFeatured: false,
    submissionType: 'image',
    submissionInstructions: 'Upload up to 3 original photographs. JPG or PNG format.',
    bannerImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=800',
    thumbnailImage: 'https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=400',
  },
];

// ─── Leaderboard sample entries ───────────────────────────────────
const leaderboardScores = [
  { score: 92, displayIdx: 2 },
  { score: 88, displayIdx: 3 },
  { score: 85, displayIdx: 4 },
  { score: 79, displayIdx: 5 },
  { score: 75, displayIdx: 6 },
];

// ─── Main seed function ────────────────────────────────────────────
async function seed() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Competition.deleteMany({}),
      Registration.deleteMany({}),
      LeaderboardEntry.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users (passwords hashed via pre-save hook)
    const users = await User.create(usersData);
    console.log(`Created ${users.length} users`);

    // Attach instructor userId to first competition
    const instructorUser = users.find((u) => u.role === 'instructor');
    competitionsData[0].instructor.userId = instructorUser._id;

    // Create competitions
    const competitions = await Competition.create(competitionsData);
    console.log(`Created ${competitions.length} competitions`);

    // Register sample users for the first competition (Classical Dance)
    const classDance = competitions[0];
    const regularUsers = users.filter((u) => u.role === 'user');

    const registrations = [];
    const leaderboardEntries = [];

    for (let i = 0; i < Math.min(regularUsers.length, 5); i++) {
      const reg = {
        competition: classDance._id,
        user: regularUsers[i]._id,
        amountPaid: classDance.discountedFee ?? classDance.entryFee,
        paymentStatus: 'completed',
        status: 'active',
      };
      registrations.push(reg);
    }

    const createdRegs = await Registration.create(registrations);
    console.log(`Created ${createdRegs.length} registrations`);

    // Create leaderboard entries with scores
    for (let i = 0; i < createdRegs.length; i++) {
      const scoreData = leaderboardScores[i] || { score: Math.floor(Math.random() * 40) + 40 };
      const user = regularUsers[i];
      leaderboardEntries.push({
        competition: classDance._id,
        user: user._id,
        registration: createdRegs[i]._id,
        finalScore: scoreData.score,
        judgeScores: [{ judgeId: instructorUser._id, score: scoreData.score, feedback: 'Good performance' }],
        displayName: user.name,
        avatarUrl: user.avatar || `https://i.pravatar.cc/150?img=${i + 1}`,
      });
    }

    await LeaderboardEntry.create(leaderboardEntries);
    console.log(`Created ${leaderboardEntries.length} leaderboard entries`);

    console.log('\n✅ Seed complete!\n');
    console.log('Test credentials:');
    console.log('  Admin:      admin@feedants.com / Admin@123');
    console.log('  Instructor: mair@feedants.com / Instructor@123');
    console.log('  User:       priya@example.com / User@1234');
    console.log(`\nCompetition slug: ${classDance.slug}`);
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

seed();
