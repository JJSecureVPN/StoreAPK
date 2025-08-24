import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, '../../../uploads');
    
    // Create subdirectories based on file type
    let subDir = '';
    if (file.fieldname === 'logo' || file.fieldname === 'icon') {
      subDir = 'logos';
    } else if (file.fieldname === 'screenshots' || file.fieldname.startsWith('screenshot')) {
      subDir = 'screenshots';
    } else if (file.fieldname === 'apk') {
      subDir = 'apks';
    }
    
    const fullPath = path.join(uploadPath, subDir);
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(fullPath)) {
      fs.mkdirSync(fullPath, { recursive: true });
    }
    
    cb(null, fullPath);
  },
  filename: (req, file, cb) => {
    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, `${timestamp}_${originalName}`);
  }
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.fieldname === 'logo' || file.fieldname === 'screenshots' || 
      file.fieldname === 'icon' || file.fieldname.startsWith('screenshot')) {
    // Accept only images
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed for logos and screenshots'));
    }
  } else if (file.fieldname === 'apk') {
    // Accept only APK files
    if (file.mimetype === 'application/vnd.android.package-archive' || 
        file.originalname.toLowerCase().endsWith('.apk')) {
      cb(null, true);
    } else {
      cb(new Error('Only APK files are allowed'));
    }
  } else {
    cb(new Error('Unknown field name'));
  }
};

export const upload = multer({ 
  storage,
  fileFilter,
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB limit
    files: 10 // Maximum 10 files
  }
});

export const uploadFiles = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // Force HTTPS for production
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
    const baseUrl = `${protocol}://${req.get('host')}`;
    
    const response: any = {};
    
    // Process logo
    if (files.logo && files.logo[0]) {
      const logoFile = files.logo[0];
      response.logo_url = `${baseUrl}/uploads/logos/${logoFile.filename}`;
    }
    
    // Process APK
    if (files.apk && files.apk[0]) {
      const apkFile = files.apk[0];
      response.apk_url = `${baseUrl}/uploads/apks/${apkFile.filename}`;
      response.size_mb = (apkFile.size / (1024 * 1024)).toFixed(2);
    }
    
    // Process screenshots
    if (files.screenshots && files.screenshots.length > 0) {
      response.screenshots = files.screenshots.map((file, index) => ({
        image_url: `${baseUrl}/uploads/screenshots/${file.filename}`,
        position: index
      }));
    }
    
    res.json({
      message: 'Files uploaded successfully',
      data: response
    });
    
  } catch (error) {
    console.error('Error uploading files:', error);
    res.status(500).json({ error: 'Failed to upload files' });
  }
};

export const uploadApp = async (req: Request, res: Response) => {
  try {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    // Force HTTPS for production
    const protocol = process.env.NODE_ENV === 'production' ? 'https' : req.protocol;
    const baseUrl = `${protocol}://${req.get('host')}`;
    
    const response: any = {};
    
    // Process icon (logo)
    if (files.icon && files.icon[0]) {
      const iconFile = files.icon[0];
      response.iconUrl = `${baseUrl}/uploads/logos/${iconFile.filename}`;
    }
    
    // Process APK
    if (files.apk && files.apk[0]) {
      const apkFile = files.apk[0];
      response.apkUrl = `${baseUrl}/uploads/apks/${apkFile.filename}`;
      response.sizeMB = parseFloat((apkFile.size / (1024 * 1024)).toFixed(2));
    }
    
    // Process screenshots
    const screenshotUrls: string[] = [];
    for (let i = 0; i < 10; i++) {
      const fieldName = `screenshot${i}`;
      if (files[fieldName] && files[fieldName][0]) {
        const screenshotFile = files[fieldName][0];
        screenshotUrls.push(`${baseUrl}/uploads/screenshots/${screenshotFile.filename}`);
      }
    }
    
    if (screenshotUrls.length > 0) {
      response.screenshotUrls = screenshotUrls;
    }
    
    res.json(response);
    
  } catch (error) {
    console.error('Error uploading app files:', error);
    res.status(500).json({ error: 'Failed to upload app files' });
  }
};

export const deleteFile = async (req: Request, res: Response) => {
  try {
    const { filename, type } = req.params;
    
    if (!['logos', 'screenshots', 'apks'].includes(type)) {
      return res.status(400).json({ error: 'Invalid file type' });
    }
    
    const filePath = path.join(__dirname, '../../../uploads', type, filename);
    
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ message: 'File deleted successfully' });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
    
  } catch (error) {
    console.error('Error deleting file:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
};
