import { Router } from 'express';
import { upload, uploadFiles, uploadApp, deleteFile } from '../controllers/uploadController';

const router = Router();

// Upload files (logo, screenshots, apk) - original route
router.post('/', upload.fields([
  { name: 'logo', maxCount: 1 },
  { name: 'screenshots', maxCount: 5 },
  { name: 'apk', maxCount: 1 }
]), uploadFiles);

// Upload app files for admin panel
router.post('/app', upload.fields([
  { name: 'icon', maxCount: 1 },
  { name: 'apk', maxCount: 1 },
  { name: 'screenshot0', maxCount: 1 },
  { name: 'screenshot1', maxCount: 1 },
  { name: 'screenshot2', maxCount: 1 },
  { name: 'screenshot3', maxCount: 1 },
  { name: 'screenshot4', maxCount: 1 },
  { name: 'screenshot5', maxCount: 1 },
  { name: 'screenshot6', maxCount: 1 },
  { name: 'screenshot7', maxCount: 1 },
  { name: 'screenshot8', maxCount: 1 },
  { name: 'screenshot9', maxCount: 1 }
]), uploadApp);

// Delete file
router.delete('/:type/:filename', deleteFile);

export default router;
