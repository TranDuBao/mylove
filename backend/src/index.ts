import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

import { connectDB } from './config/db.js';
import { Admin } from './models/Admin.js';
import { jsonDb } from './utils/jsonDb.js';

// Route imports
import authRouter from './routes/auth.js';
import settingsRouter from './routes/settings.js';
import galleryRouter from './routes/gallery.js';
import timelineRouter from './routes/timeline.js';
import lettersRouter from './routes/letters.js';
import musicRouter from './routes/music.js';
import videosRouter from './routes/videos.js';
import markersRouter from './routes/markers.js';
import scratchcardsRouter from './routes/scratchcards.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', 'uploads');

const app = express();
const PORT = process.env.PORT || 5000;

// Security & Logging Middlewares
app.use(helmet({
  crossOriginResourcePolicy: false, // Allow cross-origin images to be read (crucial for local uploads)
}));
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(morgan('dev'));

// Static folder for local uploads
app.use('/uploads', express.static(UPLOAD_DIR));

// Api routes mapping
app.use('/api/auth', authRouter);
app.use('/api/settings', settingsRouter);
app.use('/api/gallery', galleryRouter);
app.use('/api/timeline', timelineRouter);
app.use('/api/letters', lettersRouter);
app.use('/api/music', musicRouter);
app.use('/api/videos', videosRouter);
app.use('/api/markers', markersRouter);
app.use('/api/scratchcards', scratchcardsRouter);

// Basic health check route
app.get('/health', (req, res) => {
  res.json({ status: 'ok', time: new Date() });
});

// Setup default admin account if none exists
const seedAdmin = async () => {
  const defaultUser = process.env.INITIAL_ADMIN_USERNAME || 'admin';
  const defaultPass = process.env.INITIAL_ADMIN_PASSWORD || 'love123';

  try {
    let adminExists = false;

    if (global.dbFallback) {
      const admin = jsonDb.findOne('admins', a => a.username === defaultUser);
      adminExists = !!admin;
    } else {
      const count = await Admin.countDocuments({ username: defaultUser });
      adminExists = count > 0;
    }

    if (!adminExists) {
      const hashedPassword = await bcrypt.hash(defaultPass, 10);
      
      if (global.dbFallback) {
        jsonDb.insertOne('admins', {
          username: defaultUser,
          password: hashedPassword
        });
      } else {
        await Admin.create({
          username: defaultUser,
          password: hashedPassword
        });
      }
      
      console.log('\n======================================================');
      console.log('👤 Seeded default admin account:');
      console.log(`   Username: ${defaultUser}`);
      console.log(`   Password: ${defaultPass}`);
      console.log('   ⚠️  CHANGE THIS PASSWORD IMMEDIATELY in the Admin Panel!');
      console.log('======================================================\n');
    }
  } catch (error) {
    console.error('Failed to seed default admin:', error);
  }
};

// Start Server
const startServer = async () => {
  await connectDB();
  await seedAdmin();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📂 Serving static uploads from ${UPLOAD_DIR}`);
  });
};

startServer();
