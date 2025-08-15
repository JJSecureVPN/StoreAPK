import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER || 'postgres',
  host: process.env.DB_HOST || 'localhost',
  database: process.env.DB_NAME || 'apk_store',
  password: process.env.DB_PASSWORD || 'password',
  port: parseInt(process.env.DB_PORT || '5432'),
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export const initDatabase = async () => {
  try {
    // Create apps table
    await query(`
      CREATE TABLE IF NOT EXISTS apps (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        package_name VARCHAR(255) UNIQUE NOT NULL,
        short_description TEXT,
        long_description TEXT,
        logo_url VARCHAR(500),
        apk_url VARCHAR(500),
        version VARCHAR(50),
        size_mb DECIMAL(10,2),
        category VARCHAR(100) DEFAULT 'Otras',
        downloads INTEGER DEFAULT 0,
        likes INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create screenshots table
    await query(`
      CREATE TABLE IF NOT EXISTS screenshots (
        id SERIAL PRIMARY KEY,
        app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
        image_url VARCHAR(500) NOT NULL,
        position INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create comments table
    await query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create likes table (to track individual likes)
    await query(`
      CREATE TABLE IF NOT EXISTS user_likes (
        id SERIAL PRIMARY KEY,
        app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
        username VARCHAR(100) NOT NULL,
        ip_address INET,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(app_id, username, ip_address)
      )
    `);

    // Create downloads table (to track downloads)
    await query(`
      CREATE TABLE IF NOT EXISTS downloads (
        id SERIAL PRIMARY KEY,
        app_id INTEGER REFERENCES apps(id) ON DELETE CASCADE,
        ip_address INET,
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Create indexes for better performance
    await query('CREATE INDEX IF NOT EXISTS idx_apps_package_name ON apps(package_name)');
    await query('CREATE INDEX IF NOT EXISTS idx_apps_category ON apps(category)');
    await query('CREATE INDEX IF NOT EXISTS idx_comments_app_id ON comments(app_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_user_likes_app_id ON user_likes(app_id)');
    await query('CREATE INDEX IF NOT EXISTS idx_downloads_app_id ON downloads(app_id)');

    // Add category column if it doesn't exist (migration)
    try {
      await query(`
        ALTER TABLE apps 
        ADD COLUMN IF NOT EXISTS category VARCHAR(100) DEFAULT 'Otras'
      `);
    } catch (error) {
      // Column might already exist
      console.log('Category column already exists or error adding it');
    }

    console.log('Database tables created successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
};

export default pool;
