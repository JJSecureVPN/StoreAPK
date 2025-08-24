import type { Request, Response } from 'express';
import { query } from '../config/database';
import type { App, AppWithDetails, Comment, UserLike } from '../models/index';
import { 
  mockApps, 
  mockComments, 
  mockScreenshots, 
  getAllMockApps, 
  addMockApp, 
  updateMockApp, 
  findMockAppByPackageName,
  userUploadedApps 
} from '../data/mockData';

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
      // Return all apps including user-uploaded ones
      console.log('Database not connected - returning all mock apps including user uploads');
      const allApps = getAllMockApps();
      console.log(`Returning ${allApps.length} apps total`);
      return res.json(allApps);
    }
    
    const result = await query(`
      SELECT 
        id, name, package_name, short_description, logo_url, 
        downloads, likes, version, size_mb, category, created_at
      FROM apps 
      ORDER BY created_at DESC
    `);
    
    res.json(result.rows);
  } catch (error) {
    console.error('Error fetching apps:', error);
    // Fallback to mock data on error
    const allApps = getAllMockApps();
    res.json(allApps);
  }
};

export const getAppById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      // Get app from the current active set (user apps if they exist, otherwise mock apps)
      const allApps = getAllMockApps();
      const app = allApps.find(app => app.id === parseInt(id));
      
      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }
      
      // Check if this is a user-uploaded app (has screenshots array) or mock app
      const hasUserUploads = userUploadedApps.length > 0;
      const isUserApp = hasUserUploads && userUploadedApps.some((userApp: any) => userApp.id === app.id);
      const screenshots = isUserApp ? (app.screenshots || []) : 
                         hasUserUploads ? [] : 
                         mockScreenshots.filter(s => s.app_id === parseInt(id));
      
      const appWithDetails: AppWithDetails = {
        ...app,
        screenshots,
        comments: hasUserUploads ? [] : mockComments.filter(c => c.app_id === parseInt(id))
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
    console.log('Creating/updating app with data:', JSON.stringify(req.body, null, 2));
    
    const { 
      name, package_name, short_description, long_description, 
      logo_url, apk_url, version, size_mb 
    } = req.body;
    
    // Validate required fields
    if (!name || !package_name) {
      console.log('Validation failed - missing required fields:', { name, package_name });
      return res.status(400).json({ 
        error: 'Name and package_name are required fields',
        received: { name, package_name }
      });
    }
    
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      console.log('Database not connected - using mock data fallback');
      // Check if app with this package name already exists in memory
      const existingApp = findMockAppByPackageName(package_name);
      
      if (existingApp) {
        // Update existing app in memory
        console.log(`Updating existing app in memory: ${package_name}`);
        const updatedApp = updateMockApp(package_name, {
          name,
          short_description: short_description || '',
          long_description: long_description || '',
          logo_url: logo_url || '',
          apk_url: apk_url || '',
          version: version || '1.0.0',
          size_mb: size_mb || 0,
          updated_at: new Date().toISOString()
        });
        
        console.log('App updated in memory:', updatedApp);
        return res.status(200).json({
          ...updatedApp,
          message: 'App updated successfully (mock mode)'
        });
      } else {
        // Create new app in memory
        console.log('Creating new app in memory...');
        const mockApp = {
          id: Date.now(),
          name,
          package_name,
          short_description: short_description || '',
          long_description: long_description || '',
          logo_url: logo_url || '',
          apk_url: apk_url || '',
          version: version || '1.0.0',
          size_mb: size_mb || 0,
          category: 'Entretenimiento',
          downloads: 0,
          likes: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        };
        
        addMockApp(mockApp);
        console.log('App created in memory:', mockApp);
        return res.status(201).json({
          ...mockApp,
          message: 'App created successfully (mock mode)'
        });
      }
    }
    
    // Check if app with same package_name already exists
    console.log('Checking if app exists with package_name:', package_name);
    const existingApp = await query(
      'SELECT id FROM apps WHERE package_name = $1',
      [package_name]
    );
    
    if (existingApp.rows.length > 0) {
      // Update existing app
      const appId = existingApp.rows[0].id;
      console.log(`Updating existing app with ID: ${appId}`);
      
      const result = await query(`
        UPDATE apps SET 
          name = $1, 
          short_description = $2, 
          long_description = $3,
          logo_url = $4, 
          apk_url = $5, 
          version = $6, 
          size_mb = $7,
          updated_at = CURRENT_TIMESTAMP
        WHERE package_name = $8
        RETURNING *
      `, [name, short_description, long_description, logo_url, apk_url, version, size_mb, package_name]);
      
      console.log('App updated successfully:', result.rows[0]);
      return res.status(200).json({
        ...result.rows[0],
        message: 'App updated successfully'
      });
    } else {
      // Create new app
      console.log('Creating new app...');
      const result = await query(`
        INSERT INTO apps (
          name, package_name, short_description, long_description,
          logo_url, apk_url, version, size_mb
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `, [name, package_name, short_description, long_description, logo_url, apk_url, version, size_mb]);
      
      console.log('App created successfully:', result.rows[0]);
      return res.status(201).json({
        ...result.rows[0],
        message: 'App created successfully'
      });
    }
  } catch (error) {
    console.error('Error creating/updating app:', error);
    
    // Handle database errors gracefully
    if ((error as any).code) {
      console.log('Database error code:', (error as any).code);
      return res.status(400).json({ 
        error: 'Database error occurred',
        code: (error as any).code,
        detail: (error as any).detail || 'Unknown database error'
      });
    }
    
    // Generic error
    res.status(500).json({ error: 'Failed to create/update app' });
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
    console.log('Adding screenshots for app ID:', req.params.id);
    console.log('Screenshots data:', JSON.stringify(req.body, null, 2));
    
    const { id } = req.params;
    const { screenshots } = req.body; // Array of { image_url, position }
    
    if (!screenshots || !Array.isArray(screenshots)) {
      console.log('Invalid screenshots data - not an array');
      return res.status(400).json({ error: 'Screenshots array is required' });
    }
    
    const dbConnected = await isDatabaseConnected();
    
    if (!dbConnected) {
      console.log('Database not connected - using mock data for screenshots');
      
      // Find app in mock data (either predefined or user uploaded)
      const apps = getAllMockApps();
      let app = apps.find(a => a.id.toString() === id);
      
      if (!app) {
        return res.status(404).json({ error: 'App not found' });
      }

      // Update app with screenshots in memory
      const updatedApp = updateMockApp(app.package_name, {
        screenshots: screenshots.map((screenshot, index) => ({
          id: Date.now() + index,
          app_id: app.id,
          image_url: screenshot.image_url,
          position: screenshot.position || index,
          created_at: new Date().toISOString()
        }))
      });

      console.log('Screenshots added to mock app:', updatedApp);
      return res.status(201).json(updatedApp.screenshots || []);
    }
    
    console.log('Database connected - inserting screenshots into database');
    const results = [];
    for (const screenshot of screenshots) {
      const result = await query(
        'INSERT INTO screenshots (app_id, image_url, position) VALUES ($1, $2, $3) RETURNING *',
        [id, screenshot.image_url, screenshot.position || 0]
      );
      results.push(result.rows[0]);
    }
    
    console.log('Screenshots added successfully:', results);
    res.status(201).json(results);
  } catch (error) {
    console.error('Error adding screenshots:', error);
    res.status(500).json({ error: 'Failed to add screenshots' });
  }
};
