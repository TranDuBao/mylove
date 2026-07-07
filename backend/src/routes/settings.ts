import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dbHelper } from '../utils/dbHelper.js';
import { upload, uploadFile, deleteFile } from '../utils/uploader.js';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

const router = Router();

// Get all settings, theme, effects, content in a single query (Public)
router.get('/', async (req, res) => {
  try {
    const settings = await dbHelper.getSettings();
    const theme = await dbHelper.getTheme();
    const effects = await dbHelper.getEffects();
    const content = await dbHelper.getContent();
    
    return res.json({
      settings,
      theme,
      effects,
      content
    });
  } catch (error) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Error retrieving settings config' });
  }
});

// Update settings (Admin)
router.put('/config', protect, async (req, res) => {
  try {
    const updated = await dbHelper.updateSettings(req.body);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating settings config:', error);
    return res.status(500).json({ message: 'Error updating settings' });
  }
});

// Update theme (Admin)
router.put('/theme', protect, async (req, res) => {
  try {
    const updated = await dbHelper.updateTheme(req.body);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating theme builder:', error);
    return res.status(500).json({ message: 'Error updating theme' });
  }
});

// Update effects toggles (Admin)
router.put('/effects', protect, async (req, res) => {
  try {
    const updated = await dbHelper.updateEffects(req.body);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating visual effects toggles:', error);
    return res.status(500).json({ message: 'Error updating visual effects' });
  }
});

// Update dynamic texts/anniversary contents (Admin)
router.put('/content', protect, async (req, res) => {
  try {
    const updated = await dbHelper.updateContent(req.body);
    return res.json(updated);
  } catch (error) {
    console.error('Error updating core contents:', error);
    return res.status(500).json({ message: 'Error updating core contents' });
  }
});

// Upload global background music (Admin)
router.post('/bg-music', protect, upload.single('music'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Audio file is required' });
  }

  try {
    const settings = await dbHelper.getSettings();
    
    // Delete existing music if present
    if (settings.bgMusicPublicId) {
      await deleteFile(settings.bgMusicPublicId);
    }

    // Upload new file
    const result = await uploadFile(req.file, 'bg_music');
    const updated = await dbHelper.updateSettings({
      bgMusicUrl: result.url,
      bgMusicPublicId: result.publicId
    });

    return res.json(updated);
  } catch (error) {
    console.error('BG music upload error:', error);
    return res.status(500).json({ message: 'Failed to upload background music' });
  }
});

// Delete background music (Admin)
router.delete('/bg-music', protect, async (req, res) => {
  try {
    const settings = await dbHelper.getSettings();
    if (settings.bgMusicPublicId) {
      await deleteFile(settings.bgMusicPublicId);
    }
    const updated = await dbHelper.updateSettings({
      bgMusicUrl: '',
      bgMusicPublicId: ''
    });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Error deleting background music' });
  }
});

// Get admin status details & storage metrics
router.get('/stats', protect, async (req, res) => {
  try {
    const stats = await dbHelper.getStats();
    const photos = await dbHelper.listAll('photos');
    const timeline = await dbHelper.listAll('timeline');
    const music = await dbHelper.listAll('music');
    const videos = await dbHelper.listAll('videos');

    // Count local files sizes
    let localDiskBytes = 0;
    try {
      if (fs.existsSync(UPLOAD_DIR)) {
        const files = fs.readdirSync(UPLOAD_DIR);
        files.forEach(file => {
          if (file !== '.gitkeep') {
            const stat = fs.statSync(path.join(UPLOAD_DIR, file));
            localDiskBytes += stat.size;
          }
        });
      }
    } catch (e) {
      console.error('Error counting files size:', e);
    }

    return res.json({
      visitsCount: stats.visitsCount || 0,
      lastVisitedAt: stats.lastVisitedAt || null,
      totalPhotos: photos.length,
      totalTimelineEvents: timeline.length,
      totalSongs: music.length,
      totalVideos: videos.length,
      storageUsed: `${(localDiskBytes / (1024 * 1024)).toFixed(2)} MB`,
      dbType: global.dbFallback ? 'JSON Fallback File' : 'MongoDB Atlas / Local'
    });
  } catch (error) {
    return res.status(500).json({ message: 'Error fetching stats dashboard' });
  }
});

// Increment visitor count (Public)
router.post('/visit', async (req, res) => {
  try {
    const updated = await dbHelper.incrementVisits();
    return res.json({ visitsCount: updated.visitsCount });
  } catch (error) {
    return res.status(500).json({ message: 'Error logging visit' });
  }
});

export default router;
