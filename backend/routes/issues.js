import express from 'express';
import multer from 'multer';
import { requireAuth, optionalAuth } from '../middleware/auth.js';
import {
  getIssues,
  createIssue,
  toggleIssueLike,
  addIssueComment,
  getIssueById,
} from '../controllers/issueController.js';

const router = express.Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.get('/', optionalAuth, getIssues);
router.post('/', requireAuth, upload.single('image'), createIssue);
router.post('/:id/like', requireAuth, toggleIssueLike);
router.post('/:id/comments', requireAuth, addIssueComment);
router.get('/:id', optionalAuth, getIssueById);

export default router;
