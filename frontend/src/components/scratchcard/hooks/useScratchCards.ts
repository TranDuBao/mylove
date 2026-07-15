import { useState, useCallback, useEffect } from 'react';
import type { ScratchCard } from '../../../types/scratchcard.js';
import { STARTER_CARDS, createDefaultCard } from '../../../types/scratchcard.js';
import { api } from '../../../utils/api.js';

/**
 * CRUD hook for scratch card data with MongoDB backend persistence.
 * On first load, if the DB is empty, auto-seeds starter cards.
 */
export function useScratchCards() {
  const [cards, setCards] = useState<ScratchCard[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Helper: map MongoDB document → frontend ScratchCard shape
  const mapDoc = (doc: any): ScratchCard => ({
    ...doc,
    id: doc._id || doc.id, // Use MongoDB _id as the card id
  });

  // ─── Load from API on mount ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await api.getScratchCards();
        if (data.length > 0) {
          setCards(data.map(mapDoc).sort((a, b) => a.order - b.order));
        } else {
          // First-time: seed starter cards to the database
          try {
            const seedResult = await api.seedScratchCards(STARTER_CARDS);
            if (seedResult.cards) {
              setCards(seedResult.cards.map(mapDoc).sort((a, b) => a.order - b.order));
            } else {
              // Seed endpoint said cards already exist, re-fetch
              const refetch = await api.getScratchCards();
              setCards(refetch.map(mapDoc).sort((a, b) => a.order - b.order));
            }
          } catch {
            // If seed fails (e.g. not logged in), show starter cards locally
            setCards(STARTER_CARDS);
          }
        }
      } catch (error) {
        console.error('[ScratchCards] Failed to load from API:', error);
        // Fallback: show default starter cards locally
        setCards(STARTER_CARDS);
      }
      setIsLoaded(true);
    };
    load();
  }, []);

  // ─── CRUD Operations ──────────────────────────────────────────────

  const addCard = useCallback(async (overrides?: Partial<ScratchCard>) => {
    try {
      // Use createDefaultCard to construct the complete default structure (including nested configs)
      const { id, ...cardData } = createDefaultCard({
        order: cards.length,
        ...overrides,
      });
      const created = await api.createScratchCard(cardData);
      const mapped = mapDoc(created);
      setCards(prev => [...prev, mapped]);
    } catch (error) {
      console.error('[ScratchCards] Failed to create card:', error);
    }
  }, [cards.length]);

  const updateCard = useCallback(async (id: string, changes: Partial<ScratchCard>) => {
    try {
      const updated = await api.updateScratchCard(id, changes);
      const mapped = mapDoc(updated);
      setCards(prev => prev.map(c => (c.id === id ? mapped : c)));
    } catch (error) {
      console.error('[ScratchCards] Failed to update card:', error);
    }
  }, []);

  const deleteCard = useCallback(async (id: string) => {
    try {
      await api.deleteScratchCard(id);
      setCards(prev => {
        const updated = prev.filter(c => c.id !== id).map((c, i) => ({ ...c, order: i }));
        return updated;
      });
    } catch (error) {
      console.error('[ScratchCards] Failed to delete card:', error);
    }
  }, []);

  const duplicateCard = useCallback(async (id: string) => {
    const source = cards.find(c => c.id === id);
    if (!source) return;

    try {
      // Strip the id so the backend creates a new document
      const { id: _id, ...rest } = source;
      const cardData = {
        ...rest,
        title: `${source.title} (Copy)`,
        order: cards.length,
      };
      const created = await api.createScratchCard(cardData);
      const mapped = mapDoc(created);
      setCards(prev => [...prev, mapped]);
    } catch (error) {
      console.error('[ScratchCards] Failed to duplicate card:', error);
    }
  }, [cards]);

  const moveCard = useCallback(async (id: string, direction: 'up' | 'down') => {
    setCards(prev => {
      const index = prev.findIndex(c => c.id === id);
      if (index < 0) return prev;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      [updated[index], updated[targetIndex]] = [updated[targetIndex], updated[index]];
      const reordered = updated.map((c, i) => ({ ...c, order: i }));

      // Fire & forget reorder API call
      const sortedIds = reordered.map(c => c.id);
      api.reorderScratchCards(sortedIds).catch(err =>
        console.error('[ScratchCards] Failed to reorder:', err)
      );

      return reordered;
    });
  }, []);

  // Get only visible cards (for frontend rendering)
  const visibleCards = cards.filter(c => c.isVisible);

  return {
    cards,
    visibleCards,
    isLoaded,
    addCard,
    updateCard,
    deleteCard,
    duplicateCard,
    moveCard,
  };
}
