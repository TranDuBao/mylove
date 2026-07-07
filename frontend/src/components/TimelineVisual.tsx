import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { api } from '../utils/api.js';
import type { TimelineEvent } from '../types/index.js';
import { Heart, Calendar, Image as ImageIcon } from 'lucide-react';

export const TimelineVisual: React.FC = () => {
  const [events, setEvents] = useState<TimelineEvent[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      try {
        const list = await api.getTimelineEvents();
        setEvents(list);
      } catch (e) {
        console.error('Failed to fetch timeline:', e);
      }
    };
    fetchEvents();
  }, []);

  const getFullUrl = (url: string) => {
    return url.startsWith('/') ? `http://localhost:5000${url}` : url;
  };

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h2 className="text-white text-2xl md:text-4xl font-bold tracking-wide mb-2 uppercase text-center text-glow">
          Our Timeline
        </h2>
        <div className="glassmorphism p-8 rounded-xl max-w-md w-full text-center mt-6">
          <ImageIcon size={40} className="text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-secondary text-sm">No timeline events added yet. Compose a timeline milestone in the CMS! 📅</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 max-w-5xl mx-auto w-full relative">
      <h2 className="text-text text-2xl md:text-4xl font-bold tracking-wide text-glow mb-2 uppercase text-center">
        Our Love Story
      </h2>
      <p className="text-primary text-sm md:text-base font-handwriting text-glow-gold text-center mb-16">
        Milestones of our beautiful journey
      </p>

      {/* Central line */}
      <div className="absolute left-[30px] md:left-1/2 top-40 bottom-12 w-[2px] bg-gradient-to-b from-primary via-secondary to-accent opacity-30 transform -translate-x-1/2" />

      {/* Timeline Elements */}
      <div className="space-y-12 relative">
        {events.map((event, idx) => {
          const isEven = idx % 2 === 0;
          return (
            <div 
              key={event._id} 
              className={`flex flex-col md:flex-row items-start ${
                isEven ? 'md:flex-row-reverse' : ''
              } justify-between relative pl-[60px] md:pl-0`}
            >
              
              {/* Central Heart Marker */}
              <div 
                className="absolute left-[30px] md:left-1/2 top-3 w-8 h-8 rounded-full bg-[#FFF4F8] border border-secondary flex items-center justify-center transform -translate-x-1/2 z-10 hover:scale-125 transition-transform duration-300"
              >
                <Heart size={12} className="text-primary fill-primary animate-pulse" />
              </div>

              {/* Event Content Wrapper */}
              <motion.div
                initial={{ opacity: 0, x: isEven ? 80 : -80 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, margin: '-100px' }}
                transition={{ type: 'spring', stiffness: 50, delay: 0.1 }}
                className="w-full md:w-[45%] glassmorphism p-5 md:p-6 rounded-xl glow-border relative hover:shadow-[0_8px_32px_rgba(255,117,151,0.25)] transition-all duration-300"
              >
                {/* Event Photo */}
                {event.photoUrl && (
                  <div className="w-full h-48 md:h-56 rounded-lg overflow-hidden mb-4 shadow">
                    <img 
                      src={getFullUrl(event.photoUrl)} 
                      alt={event.title} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" 
                    />
                  </div>
                )}

                {/* Event Metadata */}
                <div className="flex items-center gap-2 text-secondary text-xs mb-2">
                  <Calendar size={12} />
                  <span>{event.date}</span>
                </div>

                <h3 className="text-primary text-lg font-bold font-sans uppercase mb-2 tracking-wide text-glow">
                  {event.title}
                </h3>

                <p className="text-text/90 text-sm font-light leading-relaxed border-t border-white/5 pt-3 mt-3">
                  {event.description}
                </p>
              </motion.div>

              {/* Spacer matching layout */}
              <div className="hidden md:block w-[45%]" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TimelineVisual;
