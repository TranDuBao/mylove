import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dbHelper } from '../utils/dbHelper.js';
import { upload, uploadFile, deleteFile } from '../utils/uploader.js';

const router = Router();

// Get all markers (Public)
router.get('/', async (req, res) => {
  try {
    const markers = await dbHelper.listAll('markers');
    return res.json(markers);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving markers' });
  }
});

// Create marker (Admin)
router.post('/', protect, upload.single('photo'), async (req: any, res) => {
  const { lat, lng, title, date, description } = req.body;
  if (!lat || !lng || !title || !description) {
    return res.status(400).json({ message: 'Latitude, longitude, title, and description are required' });
  }

  try {
    let photoUrl = '';
    let photoPublicId = '';

    if (req.file) {
      const uploadResult = await uploadFile(req.file, 'markers');
      photoUrl = uploadResult.url;
      photoPublicId = uploadResult.publicId;
    }

    const newMarker = await dbHelper.create('markers', {
      lat: Number(lat),
      lng: Number(lng),
      title,
      date: date || '',
      description,
      photoUrl,
      photoPublicId
    });

    return res.status(201).json(newMarker);
  } catch (error) {
    console.error('Marker creation error:', error);
    return res.status(500).json({ message: 'Failed to create marker' });
  }
});

// Update marker details (Admin)
router.put('/:id', protect, upload.single('photo'), async (req: any, res) => {
  const { id } = req.params;
  const { lat, lng, title, date, description } = req.body;

  try {
    const marker = await dbHelper.getById('markers', id);
    if (!marker) {
      return res.status(404).json({ message: 'Marker not found' });
    }

    let photoUrl = marker.photoUrl;
    let photoPublicId = marker.photoPublicId;

    if (req.file) {
      // Remove old photo if exists
      if (marker.photoPublicId) {
        await deleteFile(marker.photoPublicId);
      }
      const uploadResult = await uploadFile(req.file, 'markers');
      photoUrl = uploadResult.url;
      photoPublicId = uploadResult.publicId;
    }

    const updatedData: any = {
      title: title || marker.title,
      date: date !== undefined ? date : marker.date,
      description: description || marker.description,
      photoUrl,
      photoPublicId
    };

    if (lat) updatedData.lat = Number(lat);
    if (lng) updatedData.lng = Number(lng);

    const updated = await dbHelper.update('markers', id, updatedData);
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update marker' });
  }
});

// Delete marker (Admin)
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const marker = await dbHelper.getById('markers', id);
    if (!marker) {
      return res.status(404).json({ message: 'Marker not found' });
    }

    // Delete photo if exists
    if (marker.photoPublicId) {
      await deleteFile(marker.photoPublicId);
    }

    await dbHelper.delete('markers', id);
    return res.json({ message: 'Marker deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete marker' });
  }
});

export default router;
