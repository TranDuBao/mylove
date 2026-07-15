import { Router } from 'express';
import { protect } from '../middleware/auth.js';
import { dbHelper } from '../utils/dbHelper.js';

const router = Router();

// Get all scratch cards (Public - for frontend rendering)
router.get('/', async (req, res) => {
  try {
    const cards = await dbHelper.listAll('scratchcards');
    return res.json(cards);
  } catch (error) {
    console.error('[ScratchCards] GET error:', error);
    return res.status(500).json({ message: 'Error retrieving scratch cards' });
  }
});

// Seed starter cards if collection is empty (Admin - on-demand)
// Must be BEFORE /:id routes
router.post('/seed', protect, async (req, res) => {
  try {
    const existing = await dbHelper.listAll('scratchcards');
    if (existing.length > 0) {
      return res.json({ message: 'Cards already exist, skipping seed', count: existing.length });
    }

    const starterCards = req.body.cards;
    if (!Array.isArray(starterCards) || starterCards.length === 0) {
      return res.status(400).json({ message: 'cards array is required' });
    }

    const created = [];
    for (const card of starterCards) {
      const result = await dbHelper.create('scratchcards', card);
      created.push(result);
    }

    return res.status(201).json({ message: 'Seeded starter cards', count: created.length, cards: created });
  } catch (error) {
    console.error('[ScratchCards] SEED error:', error);
    return res.status(500).json({ message: 'Failed to seed starter cards' });
  }
});

// Reorder scratch cards (Admin)
// Must be BEFORE /:id routes
router.put('/reorder', protect, async (req, res) => {
  const { sortedIds } = req.body;
  if (!Array.isArray(sortedIds)) {
    return res.status(400).json({ message: 'sortedIds array is required' });
  }
  try {
    await dbHelper.reorder('scratchcards', sortedIds);
    return res.json({ message: 'Reorder successful' });
  } catch (error) {
    console.error('[ScratchCards] REORDER error:', error);
    return res.status(500).json({ message: 'Failed to reorder scratch cards' });
  }
});

// Create a scratch card (Admin)
router.post('/', protect, async (req, res) => {
  try {
    const cards = await dbHelper.listAll('scratchcards');
    const orderIndex = cards.length;

    const cardData = {
      ...req.body,
      order: req.body.order ?? orderIndex,
    };

    const newCard = await dbHelper.create('scratchcards', cardData);
    return res.status(201).json(newCard);
  } catch (error) {
    console.error('[ScratchCards] POST error:', error);
    return res.status(500).json({ message: 'Failed to create scratch card' });
  }
});

// Update a scratch card (Admin)
router.put('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const updated = await dbHelper.update('scratchcards', id, req.body);
    if (!updated) return res.status(404).json({ message: 'Scratch card not found' });
    return res.json(updated);
  } catch (error) {
    console.error('[ScratchCards] PUT error:', error);
    return res.status(500).json({ message: 'Failed to update scratch card' });
  }
});

// Delete a scratch card (Admin)
router.delete('/:id', protect, async (req, res) => {
  const { id } = req.params;
  try {
    const success = await dbHelper.delete('scratchcards', id);
    if (!success) return res.status(404).json({ message: 'Scratch card not found' });
    return res.json({ message: 'Scratch card deleted successfully' });
  } catch (error) {
    console.error('[ScratchCards] DELETE error:', error);
    return res.status(500).json({ message: 'Failed to delete scratch card' });
  }
});

export default router;
