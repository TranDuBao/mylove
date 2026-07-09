import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../utils/api.js';
import type { Letter } from '../types/index.js';
import { Mail, MailOpen } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext.js';

// Typewriter component for typing out letters
interface TypewriterTextProps {
  text: string;
  speed?: number;
}

const TypewriterText: React.FC<TypewriterTextProps> = ({ text, speed = 40 }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    let index = 0;
    setDisplayedText('');
    const timer = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(index));
      index++;
      if (index >= text.length) {
        clearInterval(timer);
      }
    }, speed);

    return () => clearInterval(timer);
  }, [text, speed]);

  return (
    <div className="whitespace-pre-wrap leading-loose font-handwriting text-2xl">
      {displayedText}
      <span className="inline-block w-1.5 h-6 bg-current ml-1 animate-pulse" />
    </div>
  );
};

export const LetterContainer: React.FC = () => {
  const { t } = useThemeContext();
  const [letters, setLetters] = useState<Letter[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [isTyping, setIsTyping] = useState(false);

  useEffect(() => {
    const fetchLetters = async () => {
      try {
        const list = await api.getLetters();
        // Hide secret letters from home page
        setLetters(list.filter(l => !l.isSecret));
      } catch (e) {
        console.error('Failed to load love letters:', e);
      }
    };
    fetchLetters();
  }, []);

  const handleOpenEnvelope = () => {
    setIsOpen(true);
    // Delay typing slightly until the sheet animation finishes
    setTimeout(() => {
      setIsTyping(true);
    }, 1000);
  };

  const handleCloseEnvelope = () => {
    setIsOpen(false);
    setIsTyping(false);
  };

  if (letters.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h2 className="text-text text-2xl md:text-4xl font-bold tracking-wide mb-2 uppercase text-center text-glow">
          {t('loveLetters')}
        </h2>
        <div className="glassmorphism p-8 rounded-xl max-w-md w-full text-center mt-6">
          <Mail size={40} className="text-primary mx-auto mb-4 opacity-50" />
          <p className="text-text text-sm">No letters written yet. Log in to the CMS to compose your first letter! ✍️</p>
        </div>
      </div>
    );
  }

  const activeLetter = letters[activeIdx];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 relative w-full min-h-[600px]">
      <h2 className="text-text text-2xl md:text-4xl font-bold tracking-wide text-glow mb-2 uppercase text-center">
        {t('loveLetters')}
      </h2>
      <p className="text-primary text-sm md:text-base font-handwriting text-glow-gold text-center mb-10">
        {t('loveLettersSub')}
      </p>

      {/* Select active letter tabs if multiple exist */}
      {letters.length > 1 && !isOpen && (
        <div className="flex gap-2 mb-8 overflow-x-auto max-w-full pb-2">
          {letters.map((letter, idx) => (
            <button
              key={letter._id}
              onClick={() => setActiveIdx(idx)}
              className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                activeIdx === idx
                  ? 'bg-primary text-white shadow-[0_0_10px_var(--primary-color)]'
                  : 'bg-primary/5 text-text border border-primary/10 hover:bg-primary/10'
              }`}
            >
              Letter {idx + 1}
            </button>
          ))}
        </div>
      )}

      {/* Physical Envelope Animation Container */}
      {!isOpen ? (
        <motion.div
          onClick={handleOpenEnvelope}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="relative w-[340px] h-[220px] bg-[#E5D3C3] rounded-md shadow-2xl border border-[#D5C2B2] cursor-pointer flex flex-col items-center justify-center overflow-hidden"
        >
          {/* Back flap triangles lines */}
          <div className="absolute inset-0 bg-[#E5D3C3] border-b-2 border-r-2 border-[#D5C2B2] origin-top-left" 
            style={{ clipPath: 'polygon(0% 0%, 50% 50%, 0% 100%)', background: '#DBCAB9' }} 
          />
          <div className="absolute inset-0 bg-[#E5D3C3] border-b-2 border-l-2 border-[#D5C2B2] origin-top-right" 
            style={{ clipPath: 'polygon(100% 0%, 50% 50%, 100% 100%)', background: '#DBCAB9' }} 
          />
          <div className="absolute inset-0 bg-[#E5D3C3] border-t-2 border-[#C5B2A2]" 
            style={{ clipPath: 'polygon(0% 100%, 50% 50%, 100% 100%)' }} 
          />
          
          {/* Top flap folded down */}
          <div className="absolute top-0 left-0 right-0 h-[110px] bg-[#E0CEBE] border-b border-[#C5B2A2] origin-top" 
            style={{ clipPath: 'polygon(0% 0%, 50% 100%, 100% 0%)' }} 
          />

          <div className="z-10 flex flex-col items-center text-center px-4">
            <Mail size={32} className="text-[#8B7355] animate-bounce mb-2" />
            <span className="text-[#8B7355] font-sans text-xs uppercase font-bold tracking-wider">
              {t('clickOpenEnv')}
            </span>
            <span className="text-[#A58D6F] font-handwriting text-sm mt-1 whitespace-pre-wrap">{activeLetter.title}</span>
          </div>
        </motion.div>
      ) : (
        <div className="w-full flex items-center justify-center">
          {/* Open envelope icon floating back */}
          <button
            onClick={handleCloseEnvelope}
            className="absolute top-0 right-4 px-4 py-2 rounded-full text-xs font-semibold bg-primary/10 border border-primary/20 text-text hover:bg-primary/20 transition-colors cursor-pointer"
          >
            {t('closeLetter')}
          </button>
        </div>
      )}

      {/* Letter sheet reveal overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 150 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 150 }}
            transition={{ type: 'spring', damping: 20 }}
            className="w-full max-w-2xl min-h-[450px] p-8 md:p-12 rounded-xl shadow-2xl relative border z-30 overflow-hidden"
            style={{
              backgroundColor: activeLetter.background || '#FCF8F2',
              color: activeLetter.color || '#4A3B32',
              fontFamily: activeLetter.font || 'Sacramento, cursive',
              boxShadow: '0 20px 50px rgba(0, 0, 0, 0.4)'
            }}
          >
            {/* Paper Texture Lines */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03] bg-[linear-gradient(rgba(0,0,0,1)_1px,transparent_1px)] bg-[size:100%_28px]" />

            {/* Letter Content Header */}
            <div className="border-b border-black/10 pb-4 mb-6 flex justify-between items-end">
              <h3 className="text-3xl font-bold font-handwriting capitalize whitespace-pre-wrap">
                {activeLetter.title}
              </h3>
              <span className="text-sm font-sans opacity-60">
                {activeLetter.createdAt ? new Date(activeLetter.createdAt).toLocaleDateString() : ''}
              </span>
            </div>

            {/* Typewriter message */}
            {isTyping && (
              <TypewriterText text={activeLetter.content} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default LetterContainer;
