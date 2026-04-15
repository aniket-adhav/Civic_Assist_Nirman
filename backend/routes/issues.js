import express from 'express';
import multer from 'multer';
import Issue from '../models/Issue.js';
import User from '../models/User.js';
import { uploadBuffer } from '../config/cloudinary.js';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import { runAIAnalysis } from '../services/aiRunner.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

function formatForClient(issue, currentUserId) {
  const likesCount = issue.supporters?.length || 0;
  const isLiked = currentUserId ? issue.supporters.includes(currentUserId) : false;
  return {
    id: issue._id.toString(),
    _id: issue._id.toString(),
    complaintId: issue.complaintId,
    title: issue.title,
    description: issue.description,
    category: issue.category,
    location: issue.location,
    coordinates: issue.coordinates || null,
    image: issue.imageUrl || '',
    reporter: {
      name: issue.reporter?.name || 'Anonymous',
      userId: issue.reporter?.userId || '',
      phone: issue.reporter?.phone || '',
    },
    status: issue.status,
    likes: likesCount,
    isLiked,
    shares: issue.shares || 0,
    comments: (issue.comments || []).map(c => ({
      id: c._id.toString(),
      user: c.userName,
      text: c.text,
      createdAt: c.createdAt,
    })),
    assignedTo: issue.assignedTo || null,
    timeline: issue.timeline || [],
    aiAnalysis: issue.aiAnalysis || null,
    createdAt: issue.createdAt,
  };
}

router.get('/', optionalAuth, async (req, res) => {
  try {
    const issues = await Issue.find().sort({ createdAt: -1 });
    const uid = req.user?.userId || null;
    res.json(issues.map(i => formatForClient(i, uid)));
  } catch (err) {
    console.error('GET /issues error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    const { title, description, category, location, lat, lng } = req.body;

    if (!title || !description || !category || !location) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'Photo is required' });
    }

    let imageUrl = '';
    try {
      const result = await uploadBuffer(req.file.buffer);
      imageUrl = result.secure_url;
    } catch (uploadErr) {
      console.error('Cloudinary upload failed:', uploadErr.message);
      return res.status(500).json({ error: 'Image upload failed. Check Cloudinary credentials.' });
    }

    const user = await User.findById(req.user.userId);
    const reporterName = user?.name || 'Anonymous';

    const now = new Date().toLocaleString('en-IN', {
      hour: '2-digit', minute: '2-digit', hour12: true,
      day: '2-digit', month: 'short', year: 'numeric',
    });

    const aiAnalysis = await runAIAnalysis({
      description: description.trim(),
      category,
      imageBuffer: req.file?.buffer,
      imageMimeType: req.file?.mimetype,
    });

    const initialTimeline = [
      { time: now, event: 'Complaint submitted by citizen', icon: 'fa-circle-plus', color: '#2563eb' },
    ];
    if (aiAnalysis.isSpam) {
      initialTimeline.push({
        time: now,
        event: 'AI moderation flagged this complaint as SPAM',
        icon: 'fa-triangle-exclamation',
        color: '#ef4444',
      });
    }

    const issue = await Issue.create({
      title: title.trim(),
      description: description.trim(),
      category,
      location: location.trim(),
      coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
      imageUrl,
      reporter: {
        userId: req.user.userId,
        name: reporterName,
        phone: user?.phone ? `+91 ${user.phone}` : '',
      },
      status: 'pending',
      supporters: [],
      timeline: initialTimeline,
      assignedTo: aiAnalysis.isSpam ? 'Spam Queue' : null,
      aiAnalysis,
    });

    res.status(201).json(formatForClient(issue, req.user.userId));
  } catch (err) {
    console.error('POST /issues error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/like', requireAuth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });

    const uid = req.user.userId;
    const idx = issue.supporters.indexOf(uid);
    if (idx === -1) {
      issue.supporters.push(uid);
    } else {
      issue.supporters.splice(idx, 1);
    }
    await issue.save();
    res.json({ likes: issue.supporters.length, isLiked: idx === -1 });
  } catch (err) {
    console.error('POST /issues/:id/like error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/:id/comments', requireAuth, async (req, res) => {
  try {
    const { text } = req.body;
    if (!text?.trim()) return res.status(400).json({ error: 'Comment text required' });

    const user = await User.findById(req.user.userId);
    const userName = user?.name || 'Anonymous';

    const issue = await Issue.findByIdAndUpdate(
      req.params.id,
      { $push: { comments: { userId: req.user.userId, userName, text: text.trim() } } },
      { new: true }
    );

    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    const newComment = issue.comments[issue.comments.length - 1];

    res.status(201).json({
      id: newComment._id.toString(),
      user: newComment.userName,
      text: newComment.text,
      createdAt: newComment.createdAt,
    });
  } catch (err) {
    console.error('POST /issues/:id/comments error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const issue = await Issue.findById(req.params.id);
    if (!issue) return res.status(404).json({ error: 'Issue not found' });
    res.json(formatForClient(issue, req.user?.userId || null));
  } catch (err) {
    console.error('GET /issues/:id error:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

export default router;
