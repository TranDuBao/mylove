import React from 'react';
import { motion } from 'framer-motion';
import { useThemeContext } from '../../context/ThemeContext.js';
import { useScratchCards } from './hooks/useScratchCards.js';
import ScratchCard from './ScratchCard.js';

/**
 * Home page section that renders all visible scratch cards in a responsive grid.
 */
export const ScratchCardSection: React.FC = () => {
  const { t } = useThemeContext();
  const { visibleCards, isLoaded } = useScratchCards();

  if (!isLoaded || visibleCards.length === 0) return null;

  return (
    <section className="sc-section">
      <div className="sc-section-inner">
        {/* Section Header */}
        <motion.div
          className="sc-section-header"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <h2 className="sc-section-title">
            <span className="sc-section-title-icon">✨</span>
            {t('scratchTitle') || 'Scratch to Reveal'}
          </h2>
          <p className="sc-section-subtitle">
            {t('scratchSub') || 'Scratch gently to uncover hidden surprises'}
          </p>
        </motion.div>

        {/* Card Grid */}
        <div className="sc-card-grid">
          {visibleCards
            .sort((a, b) => a.order - b.order)
            .map((card, index) => (
              <motion.div
                key={card.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{
                  duration: 0.5,
                  delay: index * 0.15,
                  ease: 'easeOut',
                }}
                className={`sc-card-grid-item ${
                  card.width >= 600
                    ? 'sc-grid-col-wide'
                    : card.width >= 450
                    ? 'sc-grid-col-medium'
                    : ''
                }`}
              >
                <ScratchCard card={card} />
              </motion.div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default ScratchCardSection;
