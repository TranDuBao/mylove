import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dbHelper } from '../utils/dbHelper.js';
import { upload, uploadFile, deleteFile } from '../utils/uploader.js';

const router = Router();

// Get all photos (Public)
router.get('/', async (req, res) => {
  try {
    const photos = await dbHelper.listAll('photos');
    return res.json(photos);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving gallery' });
  }
});

// Upload single photo (Admin)
router.post('/', protect, upload.single('photo'), async (req: any, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'Photo file is required' });
  }

  try {
    const { category, description, isFavorite, isSecret } = req.body;
    const uploadResult = await uploadFile(req.file, 'gallery');

    // Get current photos count to set initial order index
    const photos = await dbHelper.listAll('photos');
    const orderIndex = photos.length;

    const newPhoto = await dbHelper.create('photos', {
      url: uploadResult.url,
      publicId: uploadResult.publicId,
      category: category || 'General',
      description: description || '',
      isFavorite: isFavorite === 'true' || isFavorite === true,
      isSecret: isSecret === 'true' || isSecret === true,
      order: orderIndex
    });

    return res.status(201).json(newPhoto);
  } catch (error) {
    console.error('Photo upload error:', error);
    return res.status(500).json({ message: 'Failed to upload photo' });
  }
});

// Bulk update order (Admin)
router.put('/reorder', protect, async (req, res) => {
  const { sortedIds } = req.body;
  if (!Array.isArray(sortedIds)) {
    return res.status(400).json({ message: 'sortedIds array is required' });
  }

  try {
    await dbHelper.reorder('photos', sortedIds);
    return res.json({ message: 'Photos order updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reorder photos' });
  }
});

// Edit description, category or favorite status (Admin)
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await dbHelper.update('photos', id, req.body);
    if (!updated) return res.status(404).json({ message: 'Photo not found' });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Error updating photo' });
  }
});

// Delete single photo (Admin)
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const photo = await dbHelper.getById('photos', id);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Delete media resource
    if (photo.publicId) {
      await deleteFile(photo.publicId);
    }

    const success = await dbHelper.delete('photos', id);
    if (!success) return res.status(404).json({ message: 'Failed to delete photo metadata' });

    return res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete photo' });
  }
});

export default router;
