import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Pagination, Autoplay } from 'swiper/modules';
import { PhotoProvider, PhotoView } from 'react-photo-view';
import { api } from '../utils/api.js';
import type { Photo } from '../types/index.js';
import { Heart, Image as ImageIcon } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext.js';

// Import Swiper and Photo View Styles
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/pagination';
import 'react-photo-view/dist/react-photo-view.css';

export const GalleryCarousel: React.FC = () => {
  const { theme } = useThemeContext();
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [favoritesOnly, setFavoritesOnly] = useState(false);

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const list = await api.getPhotos();
        setPhotos(list);

        // Extract unique categories
        const cats = new Set<string>();
        list.forEach(p => {
          if (p.category) cats.add(p.category);
        });
        setCategories(['All', ...Array.from(cats)]);
      } catch (e) {
        console.error('Failed to fetch photos:', e);
      }
    };
    fetchPhotos();
  }, []);

  // Filter items
  const filteredPhotos = photos.filter(p => {
    const isPublic = !p.isSecret;
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const matchesFavorite = !favoritesOnly || p.isFavorite;
    return isPublic && matchesCategory && matchesFavorite;
  });

  const favorites = photos.filter(p => p.isFavorite && !p.isSecret);

  // Helper to format local URLs
  const getFullUrl = (url: string) => {
    return url.startsWith('/') ? `http://localhost:5000${url}` : url;
  };

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <h2 className="text-white text-2xl md:text-4xl font-bold tracking-wide mb-2 uppercase text-center text-glow">
          Our Memories
        </h2>
        <div className="glassmorphism p-8 rounded-xl max-w-md w-full text-center mt-6">
          <ImageIcon size={40} className="text-secondary mx-auto mb-4 opacity-50" />
          <p className="text-secondary text-sm">No photos uploaded yet. Open the CMS to create your album! 📸</p>
        </div>
      </div>
    );
  }

  return (
    <div className="py-16 px-4 max-w-7xl mx-auto w-full">
      <h2 className="text-text text-2xl md:text-4xl font-bold tracking-wide text-glow mb-2 uppercase text-center">
        Our Memory Album
      </h2>
      <p className="text-primary text-sm md:text-base font-handwriting text-glow-gold text-center mb-10">
        Capturing our beautiful moments forever
      </p>

      {/* 1. FAVORITES CAROUSEL (3D Coverflow) */}
      {favorites.length > 0 && (
        <div className="mb-16 w-full max-w-4xl mx-auto">
          <h3 className="text-text text-lg font-semibold tracking-wider uppercase mb-6 flex items-center gap-2">
            <Heart size={16} className="text-primary fill-primary animate-pulse" />
            Starred Highlights
          </h3>
          <PhotoProvider>
            <Swiper
              effect={'coverflow'}
              grabCursor={true}
              centeredSlides={true}
              slidesPerView={'auto'}
              coverflowEffect={{
                rotate: 20,
                stretch: 0,
                depth: 100,
                modifier: 1,
                slideShadows: true,
              }}
              pagination={{ clickable: true }}
              autoplay={{ delay: 3000, disableOnInteraction: false }}
              modules={[EffectCoverflow, Pagination, Autoplay]}
              className="swiper-container"
            >
              {favorites.map((photo) => (
                <SwiperSlide key={photo._id} style={{ width: '280px', height: '360px', borderRadius: '12px', overflow: 'hidden' }}>
                  <PhotoView src={getFullUrl(photo.url)}>
                    <div className="w-full h-full relative cursor-zoom-in group">
                      <img 
                        src={getFullUrl(photo.url)} 
                        alt={photo.description} 
                        className="w-full h-full object-cover" 
                      />
                      {/* Gradient overlay on hover */}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                        <span className="text-white font-semibold text-sm">{photo.category}</span>
                        <p className="text-white/80 text-xs mt-1 truncate">{photo.description}</p>
                      </div>
                    </div>
                  </PhotoView>
                </SwiperSlide>
              ))}
            </Swiper>
          </PhotoProvider>
        </div>
      )}

      {/* 2. GRID GALLERY WITH FILTERS */}
      <div className="border-t border-white/10 pt-12">
        {/* Filter Controls */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
          {/* Categories Tab List */}
          <div className="flex gap-2 flex-wrap justify-center">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider transition-all duration-300 ${
                  activeCategory === cat
                    ? 'bg-primary text-white shadow-[0_0_10px_var(--primary-color)]'
                    : 'bg-white/5 text-secondary border border-white/10 hover:bg-white/10'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Favorite Toggle */}
          <button
            onClick={() => setFavoritesOnly(!favoritesOnly)}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-2 border transition-all duration-300 ${
              favoritesOnly
                ? 'bg-secondary text-white border-secondary shadow-[0_0_10px_var(--secondary-color)]'
                : 'bg-white/5 border-white/10 text-secondary hover:bg-white/10'
            }`}
          >
            <Heart size={12} className={favoritesOnly ? 'fill-white' : ''} />
            Favorites Only
          </button>
        </div>

        {/* Gallery Grid */}
        <PhotoProvider>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredPhotos.map((photo) => (
              <PhotoView key={photo._id} src={getFullUrl(photo.url)}>
                <div className="glassmorphism rounded-xl overflow-hidden cursor-zoom-in relative group aspect-square hover:scale-[1.02] transition-transform duration-300">
                  <img
                    src={getFullUrl(photo.url)}
                    alt={photo.description}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                  {photo.isFavorite && (
                    <div className="absolute top-2 right-2 p-1.5 bg-black/40 backdrop-blur-md rounded-full">
                      <Heart size={12} className="text-primary fill-primary" />
                    </div>
                  )}
                  {/* Subtle info drawer overlay */}
                  <div className="absolute bottom-0 left-0 right-0 bg-black/60 backdrop-blur-sm p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <span className="text-[10px] uppercase font-bold text-secondary">{photo.category}</span>
                    <p className="text-white text-xs mt-0.5 truncate">{photo.description || 'No description'}</p>
                  </div>
                </div>
              </PhotoView>
            ))}
          </div>
        </PhotoProvider>
        
        {filteredPhotos.length === 0 && (
          <div className="text-center py-12 text-secondary text-sm">
            No matching memories found for this filter. 🥀
          </div>
        )}
      </div>
    </div>
  );
};

export default GalleryCarousel;
