import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dbHelper } from '../utils/dbHelper.js';
import { upload, uploadFile, deleteFile } from '../utils/uploader.js';

const router = Router();

// Get all videos (Public)
router.get('/', async (req, res) => {
  try {
    const videos = await dbHelper.listAll('videos');
    return res.json(videos);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving videos' });
  }
});

// Upload video (Admin)
// Supports fields: 'video' (video file, required) and 'thumbnail' (image file, optional)
router.post(
  '/',
  protect,
  upload.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  async (req: any, res) => {
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
    const videoFile = files?.['video']?.[0];
    const thumbnailFile = files?.['thumbnail']?.[0];

    if (!videoFile) {
      return res.status(400).json({ message: 'Video file is required' });
    }

    const { title } = req.body;
    if (!title) {
      return res.status(400).json({ message: 'Video title is required' });
    }

    try {
      // Upload video file
      const videoResult = await uploadFile(videoFile, 'videos');

      // Upload thumbnail if provided
      let thumbnailUrl = '';
      let thumbnailPublicId = '';
      if (thumbnailFile) {
        const thumbResult = await uploadFile(thumbnailFile, 'thumbnails');
        thumbnailUrl = thumbResult.url;
        thumbnailPublicId = thumbResult.publicId;
      }

      const videos = await dbHelper.listAll('videos');
      const orderIndex = videos.length;

      const newVideo = await dbHelper.create('videos', {
        title,
        url: videoResult.url,
        publicId: videoResult.publicId,
        thumbnailUrl,
        thumbnailPublicId,
        order: orderIndex
      });

      return res.status(201).json(newVideo);
    } catch (error) {
      console.error('Video upload error:', error);
      return res.status(500).json({ message: 'Failed to upload video' });
    }
  }
);

// Bulk update order (Admin)
router.put('/reorder', protect, async (req, res) => {
  const { sortedIds } = req.body;
  if (!Array.isArray(sortedIds)) {
    return res.status(400).json({ message: 'sortedIds array is required' });
  }

  try {
    await dbHelper.reorder('videos', sortedIds);
    return res.json({ message: 'Videos order updated successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to reorder videos' });
  }
});

// Delete video (Admin)
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const video = await dbHelper.getById('videos', id);
    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Delete video file
    if (video.publicId) {
      await deleteFile(video.publicId);
    }

    // Delete thumbnail file
    if (video.thumbnailPublicId) {
      await deleteFile(video.thumbnailPublicId);
    }

    await dbHelper.delete('videos', id);
    return res.json({ message: 'Video deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete video' });
  }
});

export default router;
