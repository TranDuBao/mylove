import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dbHelper } from '../utils/dbHelper.js';

const router = Router();

// Get all letters (Public)
router.get('/', async (req, res) => {
  try {
    const letters = await dbHelper.listAll('letters');
    return res.json(letters);
  } catch (error) {
    return res.status(500).json({ message: 'Error retrieving letters' });
  }
});

// Create a love letter (Admin)
router.post('/', protect, async (req, res) => {
  const { title, content, font, color, background, isSecret } = req.body;
  if (!content) {
    return res.status(400).json({ message: 'Content is required' });
  }

  try {
    const letters = await dbHelper.listAll('letters');
    const orderIndex = letters.length;

    const newLetter = await dbHelper.create('letters', {
      title: title || 'My Love Letter',
      content,
      font: font || 'Sacramento, cursive',
      color: color || '#4A3B32',
      background: background || '#FCF8F2',
      isSecret: isSecret === true || isSecret === 'true',
      order: orderIndex
    });

    return res.status(201).json(newLetter);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to save love letter' });
  }
});

// Update a love letter (Admin)
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await dbHelper.update('letters', id, req.body);
    if (!updated) return res.status(404).json({ message: 'Letter not found' });
    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: 'Failed to update love letter' });
  }
});

// Delete a love letter (Admin)
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const success = await dbHelper.delete('letters', id);
    if (!success) return res.status(404).json({ message: 'Letter not found' });
    return res.json({ message: 'Letter deleted successfully' });
  } catch (error) {
    return res.status(500).json({ message: 'Failed to delete love letter' });
  }
});

export default router;
