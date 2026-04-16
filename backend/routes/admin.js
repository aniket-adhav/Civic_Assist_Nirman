import express from 'express';
import { requireAdmin } from '../middleware/auth.js';
import {
  getAdminIssues,
  getAdminIssueById,
  getAdminStats,
  updateIssueStatus,
  assignIssue,
  reanalyzeIssue,
  getOfficers,
  createOfficer,
  getAdminAnalysis,
} from '../controllers/adminController.js';

const router = express.Router();

router.get('/issues', requireAdmin, getAdminIssues);
router.get('/issues/:id', requireAdmin, getAdminIssueById);
router.get('/stats', requireAdmin, getAdminStats);
router.patch('/issues/:id/status', requireAdmin, updateIssueStatus);
router.patch('/issues/:id/assign', requireAdmin, assignIssue);
router.post('/issues/:id/reanalyze', requireAdmin, reanalyzeIssue);
router.get('/officers', requireAdmin, getOfficers);
router.post('/officers', requireAdmin, createOfficer);
router.get('/analysis', requireAdmin, getAdminAnalysis);

export default router;
