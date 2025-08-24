import { Router } from 'express';
import {
  getAllApps,
  getAppById,
  createApp,
  addComment,
  toggleLike,
  downloadApp,
  addScreenshots
} from '../controllers/appController';

const router = Router();

// Get all apps
router.get('/', getAllApps);

// Get app by ID
router.get('/:id', getAppById);

// Create new app
router.post('/', createApp);

// Add comment to app
router.post('/:id/comments', addComment);

// Toggle like for app
router.post('/:id/like', toggleLike);

// Download app (increments counter)
router.post('/:id/download', downloadApp);

// Add screenshots to app
router.post('/:id/screenshots', addScreenshots);

export default router;
