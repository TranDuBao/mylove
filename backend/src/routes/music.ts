import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dbHelper } from '../utils/dbHelper.js';
import { upload, uploadFile, deleteFile } from '../utils/uploader.js';

const router = Router();

// Get all songs (Public)
router.get('/', async (req, res) => {
  try {
    const songs = await dbHelper.listAll('music');
    return res.json(songs);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving music playlist' });
  }
});

// Upload song (Admin)
// Supports fields: 'song' (audio file, required) and 'cover' (image file, optional)
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'song', maxCount: 1 },
    { name: 'cover', maxCount: 1 }
  ]),
  async (req: any, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const songFile = files?.['song']?.[0];
    const coverFile = files?.['cover']?.[0];

    if (!songFile) {
      return res.status(400).json({ message: 'Audio file (song) is required' });
    }

    const { title, artist } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Song title is required' });
    }

    try {
      // Upload song file
      const songResult = await uploadFile(songFile, 'songs');

      // Upload cover file if provided
      let coverUrl = '';
      let coverPublicId = '';
      if (coverFile) {
        const coverResult = await uploadFile(coverFile, 'covers');
        coverUrl = coverResult.url;
        coverPublicId = coverResult.publicId;
      }

      const songs = await dbHelper.listAll('music');
      const orderIndex = songs.length;

      const newSong = await dbHelper.create('music', {
        title,
        artist: artist || 'Unknown Artist',
        url: songResult.url,
        publicId: songResult.publicId,
        coverUrl,
        coverPublicId,
        order: orderIndex
      });

      return res.status(201).json(newSong);
    } catch (error) {
      console.error('Song upload error:', error);
      return res.status(500).json({ message: 'Failed to upload song' });
    }
  }
);

// Update song metadata (Admin) — title/artist only, audio stays
router.put('/:id', protect, upload.none(), async (req: any, res) => {
  const { id } = req.params;
  const { title, artist } = req.body;
  try {
    const existing = await dbHelper.getById('music', id);
    if (!existing) {
      return res.status(404).json({ message: 'Song not found' });
    }
    const updated = await dbHelper.update('music', id, {
      title: title || existing.title,
      artist: artist !== undefined ? artist : existing.artist,
    });
    return res.json(updated);
  } catch (error) {
    console.error('Song update error:', error);
    return res.status(500).json({ message: 'Failed to update song' });
  }
});

// Bulk update order (Admin)
router.put('/reorder', protect, async (req, res) => {
  const { sortedIds } = req.body;
  if (!Array.isArray(sortedIds)) {
    return res.status(400).json({ message: 'sortedIds array is required' });
  }

  try {
    await dbHelper.reorder('music', sortedIds);
    return res.json({ message: 'Music playlist order updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reorder playlist' });
  }
});

// Delete song (Admin)
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const song = await dbHelper.getById('music', id);
    if (!song) {
      return res.status(404).json({ message: 'Song not found' });
    }

    // Delete song file
    if (song.publicId) {
      await deleteFile(song.publicId);
    }

    // Delete cover file
    if (song.coverPublicId) {
      await deleteFile(song.coverPublicId);
    }

    await dbHelper.delete('music', id);
    return res.json({ message: 'Song deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete song' });
  }
});

export default router;
