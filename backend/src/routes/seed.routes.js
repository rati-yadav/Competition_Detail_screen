const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Competition = require('../models/Competition');
const Registration = require('../models/Registration');
const LeaderboardEntry = require('../models/LeaderboardEntry');

// GET /api/seed  — only works in non-production OR with secret key
router.get('/', async (req, res) => {
  try {
    const secret = req.query.secret;
    if (secret !== process.env.SEED_SECRET) {
      return res.status(403).json({ success: false, message: 'Forbidden' });
    }

    const now = new Date();
    const daysFromNow = (d) => new Date(now.getTime() + d * 24 * 60 * 60 * 1000);

    // Clear
    await Promise.all([
      User.deleteMany({}),
      Competition.deleteMany({}),
      Registration.deleteMany({}),
      LeaderboardEntry.deleteMany({}),
    ]);

    // Users
    const usersData = [
      { name: 'Admin User',    email: 'admin@feedants.com',  password: 'Admin@123',       role: 'admin' },
      { name: 'Mair Jo Dubey', email: 'mair@feedants.com',   password: 'Instructor@123',  role: 'instructor', avatar: 'https://i.pravatar.cc/150?img=47' },
      { name: 'Priya Sharma',  email: 'priya@example.com',   password: 'User@1234',       role: 'user', avatar: 'https://i.pravatar.cc/150?img=1' },
      { name: 'Rahul Verma',   email: 'rahul@example.com',   password: 'User@1234',       role: 'user', avatar: 'https://i.pravatar.cc/150?img=3' },
      { name: 'Sneha Patel',   email: 'sneha@example.com',   password: 'User@1234',       role: 'user', avatar: 'https://i.pravatar.cc/150?img=5' },
      { name: 'Arjun Nair',    email: 'arjun@example.com',   password: 'User@1234',       role: 'user', avatar: 'https://i.pravatar.cc/150?img=7' },
      { name: 'Deepika Singh', email: 'deepika@example.com', password: 'User@1234',       role: 'user', avatar: 'https://i.pravatar.cc/150?img=9' },
      { name: 'Karan Mehta',   email: 'karan@example.com',   password: 'User@1234',       role: 'user', avatar: 'https://i.pravatar.cc/150?img=11' },
    ];
    const users = await User.create(usersData);
    const instructor = users.find(u => u.role === 'instructor');

    // Competition
    const comp = await Competition.create({
      title: 'Feedants Classical Dance',
      slug: 'feedants-classical-dance',
      category: 'Dance',
      tags: ['classical', 'bharatanatyam', 'dance'],
      entryFee: 1500,
      discountedFee: 99,
      isFree: false,
      instructor: {
        userId: instructor._id,
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
      about: `The Feedants Classical Dance Competition is a celebration of India's rich dance heritage. Participants from all skill levels are welcome to showcase their mastery of classical dance forms including Bharatanatyam, Kathak, Odissi, Manipuri, and more.`,
      rules: [
        'Performance must be 2–5 minutes in duration.',
        'Only classical Indian dance forms accepted.',
        'Participants must submit a video recording.',
        'Background music must be original or royalty-free.',
        'Judges\' decisions are final.',
      ],
      prizes: [
        { rank: 1, label: '1st Winner', medalColor: 'gold',    amount: 5000 },
        { rank: 2, label: '2nd Winner', medalColor: 'silver',  amount: 3000 },
        { rank: 3, label: '3rd Winner', medalColor: 'bronze',  amount: 2000 },
        { rank: 4, label: '4th Winner', medalColor: 'special', amount: 1000 },
        { rank: 5, label: '5th Winner', medalColor: 'special', amount: 500  },
        { rank: 6, label: '6th Winner', medalColor: 'special', amount: 100  },
      ],
      hasCertificate: true,
      isFeatured: true,
      submissionType: 'video',
      submissionInstructions: 'Upload a clear video of your performance. Ensure good lighting and audio quality. Max file size: 500MB.',
      bannerImage: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=800',
      thumbnailImage: 'https://images.unsplash.com/photo-1545959570-a94084071b5d?w=400',
    });

    // Registrations + Leaderboard
    const regularUsers = users.filter(u => u.role === 'user');
    const scores = [92, 88, 85, 79, 75];
    const regs = await Registration.create(
      regularUsers.slice(0, 5).map(u => ({
        competition: comp._id,
        user: u._id,
        amountPaid: 99,
        paymentStatus: 'completed',
        status: 'active',
      }))
    );
    await LeaderboardEntry.create(
      regularUsers.slice(0, 5).map((u, i) => ({
        competition: comp._id,
        user: u._id,
        registration: regs[i]._id,
        finalScore: scores[i],
        judgeScores: [{ judgeId: instructor._id, score: scores[i], feedback: 'Great performance' }],
        displayName: u.name,
        avatarUrl: u.avatar || `https://i.pravatar.cc/150?img=${i + 1}`,
      }))
    );

    // Second competition
    await Competition.create({
      title: 'Online Singing Championship',
      slug: 'online-singing-championship',
      category: 'Music',
      tags: ['singing', 'vocal', 'music'],
      entryFee: 299,
      isFree: false,
      instructor: {
        name: 'Sunita Rao',
        avatar: 'https://i.pravatar.cc/150?img=20',
        bio: 'Playback singer with 20 years of experience.',
        rating: 4.9,
        totalStudents: 900,
        totalCourses: 5,
        experience: '20+ years',
      },
      registrationStart: daysFromNow(-2),
      registrationEnd: daysFromNow(20),
      competitionStart: daysFromNow(22),
      competitionEnd: daysFromNow(25),
      status: 'registration_open',
      totalSlots: 300,
      registeredCount: 87,
      about: 'Showcase your vocal talent. Open to all genres — Bollywood, classical, folk, and indie.',
      rules: ['Performance must be 2–4 minutes.', 'No offensive lyrics.'],
      prizes: [
        { rank: 1, label: '1st Winner', medalColor: 'gold',   amount: 10000 },
        { rank: 2, label: '2nd Winner', medalColor: 'silver', amount: 5000  },
        { rank: 3, label: '3rd Winner', medalColor: 'bronze', amount: 2500  },
      ],
      hasCertificate: true,
      submissionType: 'video',
      submissionInstructions: 'Record a clear audio/video.',
      bannerImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=800',
      thumbnailImage: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=400',
    });

    res.json({
      success: true,
      message: '✅ Seed complete! 2 competitions, 8 users, 5 registrations, 5 leaderboard entries created.',
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
