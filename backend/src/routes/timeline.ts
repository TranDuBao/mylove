import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dbHelper } from '../utils/dbHelper.js';
import { upload, uploadFile, deleteFile } from '../utils/uploader.js';

const router = Router();

// Get all timeline events (Public)
router.get('/', async (req, res) => {
  try {
    const events = await dbHelper.listAll('timeline');
    return res.json(events);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving timeline' });
  }
});

// Create timeline event (Admin)
router.post('/', protect, upload.single('photo'), async (req: any, res) => {
  const { title, date, description } = req.body;
  if (!title || !date || !description) {
    return res.status(400).json({ message: 'Title, date, and description are required' });
  }

  try {
    let photoUrl = '';
    let photoPublicId = '';

    if (req.file) {
      const uploadResult = await uploadFile(req.file, 'timeline');
      photoUrl = uploadResult.url;
      photoPublicId = uploadResult.publicId;
    }

    const events = await dbHelper.listAll('timeline');
    const orderIndex = events.length;

    const newEvent = await dbHelper.create('timeline', {
      title,
      date,
      description,
      photoUrl,
      photoPublicId,
      order: orderIndex
    });

    return res.status(201).json(newEvent);
  } catch (error) {
    console.error('Timeline create error:', error);
    return res.status(500).json({ message: 'Failed to create timeline event' });
  }
});

// Update timeline event (Admin)
router.put('/:id', protect, upload.single('photo'), async (req: any, res) => {
  const { id } = req.params;
  const { title, date, description } = req.body;

  try {
    const existingEvent = await dbHelper.getById('timeline', id);
    if (!existingEvent) {
      return res.status(404).json({ message: 'Timeline event not found' });
    }

    let photoUrl = existingEvent.photoUrl;
    let photoPublicId = existingEvent.photoPublicId;

    if (req.file) {
      // Delete old photo if it exists
      if (existingEvent.photoPublicId) {
        await deleteFile(existingEvent.photoPublicId);
      }
      const uploadResult = await uploadFile(req.file, 'timeline');
      photoUrl = uploadResult.url;
      photoPublicId = uploadResult.publicId;
    }

    const updated = await dbHelper.update('timeline', id, {
      title: title || existingEvent.title,
      date: date || existingEvent.date,
      description: description || existingEvent.description,
      photoUrl,
      photoPublicId
    });

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update timeline event' });
  }
});

// Delete timeline event (Admin)
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const event = await dbHelper.getById('timeline', id);
    if (!event) {
      return res.status(404).json({ message: 'Timeline event not found' });
    }

    // Delete photo if exists
    if (event.photoPublicId) {
      await deleteFile(event.photoPublicId);
    }

    await dbHelper.delete('timeline', id);
    return res.json({ message: 'Timeline event deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete timeline event' });
  }
});

// Bulk update order (Admin)
router.put('/reorder', protect, async (req, res) => {
  const { sortedIds } = req.body;
  if (!Array.isArray(sortedIds)) {
    return res.status(400).json({ message: 'sortedIds array is required' });
  }

  try {
    await dbHelper.reorder('timeline', sortedIds);
    return res.json({ message: 'Timeline order updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reorder timeline' });
  }
});

export default router;
