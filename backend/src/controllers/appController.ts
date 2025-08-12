import type { Request, Response } from 'express';
import { query } from '../config/database';
import type { App, AppWithDetails, Comment, UserLike } from '../models/index';
import { mockApps, mockComments, mockScreenshots } from '../data/mockData';

// Check if database is connected
const isDatabaseConnected = async (): Promise<boolean> => {
  try {
    await query('SELECT 1');
    return true;
  } catch (error) {
    return false;
  }
};

export const getAllApps = async (req: Request, res: Response) => {
  try {
    // Check if database is available
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      // Return mock data if database is not available
      return res.json(mockApps);
    }
    
    const result = await query(`
      SELECT 
        id, name, package_name, short_description, logo_url, 
        downloads, likes, version, size_mb, created_at
      FROM apps 
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching apps:', error);
    // Fallback to mock data on error
    res.json(mockApps);
  }
};

export const getAppById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      // Return mock data if database is not available
      const app = mockApps.find(app => app.id === parseInt(id));
      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }
      
      const appWithDetails: AppWithDetails = {
        ...app,
        screenshots: mockScreenshots.filter(s => s.app_id === parseInt(id)),
        comments: mockComments.filter(c => c.app_id === parseInt(id))
      };
      
      return res.json(appWithDetails);
    }
    
    // Get app details from database
    const appResult = await query('SELECT * FROM apps WHERE id = $1', [id]);
    
    if (appResult.rows.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    const app = appResult.rows[0];
    
    // Get screenshots
    const screenshotsResult = await query(
      'SELECT * FROM screenshots WHERE app_id = $1 ORDER BY position',
      [id]
    );
    
    // Get comments
    const commentsResult = await query(
      'SELECT * FROM comments WHERE app_id = $1 ORDER BY created_at DESC',
      [id]
    );
    
    const appWithDetails: AppWithDetails = {
      ...app,
      screenshots: screenshotsResult.rows,
      comments: commentsResult.rows
    };
    
    res.json(appWithDetails);
  } catch (error) {
    console.error('Error fetching app:', error);
    res.status(500).json({ error: 'Failed to fetch app details' });
  }
};

export const createApp = async (req: Request, res: Response) => {
  try {
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      return res.status(503).json({ 
        error: 'Database not available. Cannot create apps without database connection.' 
      });
    }
    
    const { 
      name, package_name, short_description, long_description, 
      logo_url, apk_url, version, size_mb 
    } = req.body;
    
    const result = await query(`
      INSERT INTO apps (
        name, package_name, short_description, long_description,
        logo_url, apk_url, version, size_mb
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
      RETURNING *
    `, [name, package_name, short_description, long_description, logo_url, apk_url, version, size_mb]);
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error creating app:', error);
    if ((error as any).code === '23505') {
      res.status(400).json({ error: 'Package name already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create app' });
    }
  }
};

export const addComment = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username, content } = req.body;
    
    if (!username || !content) {
      return res.status(400).json({ error: 'Username and content are required' });
    }
    
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      // For demo purposes, return a mock comment
      const newComment = {
        id: Date.now(),
        app_id: parseInt(id),
        username,
        content,
        created_at: new Date().toISOString()
      };
      return res.status(201).json(newComment);
    }
    
    const result = await query(
      'INSERT INTO comments (app_id, username, content) VALUES ($1, $2, $3) RETURNING *',
      [id, username, content]
    );
    
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ error: 'Failed to add comment' });
  }
};

export const toggleLike = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { username } = req.body;
    const ip_address = req.ip;
    
    if (!username) {
      return res.status(400).json({ error: 'Username is required' });
    }
    
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      // For demo purposes, simulate like toggle
      const app = mockApps.find(app => app.id === parseInt(id));
      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }
      
      // Simple simulation - always toggle like
      const liked = Math.random() > 0.5;
      const likes = app.likes + (liked ? 1 : -1);
      
      return res.json({ liked, likes: Math.max(0, likes) });
    }
    
    // Check if user already liked this app
    const existingLike = await query(
      'SELECT id FROM user_likes WHERE app_id = $1 AND username = $2 AND ip_address = $3',
      [id, username, ip_address]
    );
    
    if (existingLike.rows.length > 0) {
      // Remove like
      await query('DELETE FROM user_likes WHERE id = $1', [existingLike.rows[0].id]);
      await query('UPDATE apps SET likes = likes - 1 WHERE id = $1', [id]);
      
      // Get updated like count
      const result = await query('SELECT likes FROM apps WHERE id = $1', [id]);
      res.json({ liked: false, likes: result.rows[0].likes });
    } else {
      // Add like
      await query(
        'INSERT INTO user_likes (app_id, username, ip_address) VALUES ($1, $2, $3)',
        [id, username, ip_address]
      );
      await query('UPDATE apps SET likes = likes + 1 WHERE id = $1', [id]);
      
      // Get updated like count
      const result = await query('SELECT likes FROM apps WHERE id = $1', [id]);
      res.json({ liked: true, likes: result.rows[0].likes });
    }
  } catch (error) {
    console.error('Error toggling like:', error);
    res.status(500).json({ error: 'Failed to toggle like' });
  }
};

export const downloadApp = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const ip_address = req.ip;
    const user_agent = req.get('User-Agent');
    
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      // Return mock download for demo
      const app = mockApps.find(app => app.id === parseInt(id));
      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }
      
      if (!app.apk_url) {
        return res.status(404).json({ error: 'APK file not available' });
      }
      
      return res.json({ 
        download_url: app.apk_url, 
        filename: `${app.name.replace(/\s+/g, '_')}.apk` 
      });
    }
    
    // Record download
    await query(
      'INSERT INTO downloads (app_id, ip_address, user_agent) VALUES ($1, $2, $3)',
      [id, ip_address, user_agent]
    );
    
    // Increment download counter
    await query('UPDATE apps SET downloads = downloads + 1 WHERE id = $1', [id]);
    
    // Get app details for download
    const result = await query('SELECT apk_url, name FROM apps WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'App not found' });
    }
    
    const app = result.rows[0];
    
    if (!app.apk_url) {
      return res.status(404).json({ error: 'APK file not available' });
    }
    
    res.json({ download_url: app.apk_url, filename: app.name });
  } catch (error) {
    console.error('Error downloading app:', error);
    res.status(500).json({ error: 'Failed to process download' });
  }
};

export const addScreenshots = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { screenshots } = req.body; // Array of { image_url, position }
    
    if (!screenshots || !Array.isArray(screenshots)) {
      return res.status(400).json({ error: 'Screenshots array is required' });
    }
    
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      return res.status(503).json({ 
        error: 'Database not available. Cannot add screenshots without database connection.' 
      });
    }
    
    const results = [];
    for (const screenshot of screenshots) {
      const result = await query(
        'INSERT INTO screenshots (app_id, image_url, position) VALUES ($1, $2, $3) RETURNING *',
        [id, screenshot.image_url, screenshot.position || 0]
      );
      results.push(result.rows[0]);
    }
    
    res.status(201).json(results);
  } catch (error) {
    console.error('Error adding screenshots:', error);
    res.status(500).json({ error: 'Failed to add screenshots' });
  }
};
