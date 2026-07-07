import React, { useState, useEffect } from 'react';
import { useThemeContext } from '../context/ThemeContext.js';

interface TimeDifference {
  years: number;
  months: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

export const LoveCounter: React.FC = () => {
  const { t, content } = useThemeContext();
  const [timeDiff, setTimeDiff] = useState<TimeDifference | null>(null);

  useEffect(() => {
    if (!content || !content.relationshipStartDate) return;

    const startDate = new Date(content.relationshipStartDate);

    const calculateDifference = () => {
      const now = new Date();
      
      let years = now.getFullYear() - startDate.getFullYear();
      let months = now.getMonth() - startDate.getMonth();
      let days = now.getDate() - startDate.getDate();
      let hours = now.getHours() - startDate.getHours();
      let minutes = now.getMinutes() - startDate.getMinutes();
      let seconds = now.getSeconds() - startDate.getSeconds();

      // Adjust negative values
      if (seconds < 0) {
        seconds += 60;
        minutes--;
      }
      if (minutes < 0) {
        minutes += 60;
        hours--;
      }
      if (hours < 0) {
        hours += 24;
        days--;
      }
      if (days < 0) {
        // Get number of days in the previous month
        const prevMonth = new Date(now.getFullYear(), now.getMonth(), 0);
        days += prevMonth.getDate();
        months--;
      }
      if (months < 0) {
        months += 12;
        years--;
      }

      setTimeDiff({ years, months, days, hours, minutes, seconds });
    };

    calculateDifference();
    const interval = setInterval(calculateDifference, 1000);

    return () => clearInterval(interval);
  }, [content]);

  if (!content || !timeDiff) return null;

  const timeBlocks = [
    { label: t('years'), value: timeDiff.years },
    { label: t('months'), value: timeDiff.months },
    { label: t('days'), value: timeDiff.days },
    { label: t('hours'), value: timeDiff.hours },
    { label: t('minutes'), value: timeDiff.minutes },
    { label: t('seconds'), value: timeDiff.seconds },
  ];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      {/* Title */}
      <h2 className="text-text text-2xl md:text-4xl font-bold text-center tracking-wide text-glow mb-2 uppercase">
        {content.relationshipTitle || 'Our Love Journey'}
      </h2>
      <p className="text-primary text-sm md:text-base font-handwriting text-center mb-10 text-glow-gold">
        {t('loveCounterSub')}
      </p>

      {/* Clock Blocks Grid */}
      <div className="grid grid-cols-3 md:grid-cols-6 gap-4 max-w-4xl w-full">
        {timeBlocks.map((block, idx) => (
          <div
            key={idx}
            className="glassmorphism p-4 md:p-6 rounded-xl flex flex-col items-center justify-center glow-border transition-all duration-300 hover:scale-105"
          >
            <span className="text-3xl md:text-5xl font-bold text-primary text-glow mb-1 font-sans">
              {block.value.toString().padStart(2, '0')}
            </span>
            <span className="text-xs uppercase tracking-wider text-secondary font-medium font-sans">
              {block.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LoveCounter;
