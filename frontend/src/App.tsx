import React, { useState, useEffect } from 'react';
import { ThemeProvider, useThemeContext } from './context/ThemeContext.js';
import { ParticleLayer } from './components/ParticleLayer.js';
import { MusicPlayer } from './components/MusicPlayer.js';
import { Home } from './pages/Home.js';
import { AdminDashboard } from './pages/AdminDashboard.js';
import { SecretPage } from './pages/SecretPage.js';
import { Heart, Lock, LayoutDashboard, Home as HomeIcon } from 'lucide-react';

const PageRouter: React.FC = () => {
  const { isLoading, settings, t, language, setLanguage } = useThemeContext();
  const [hash, setHash] = useState(window.location.hash || '#/');

  useEffect(() => {
    const handleHashChange = () => {
      setHash(window.location.hash || '#/');
    };
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF4F8] flex flex-col items-center justify-center text-center p-6">
        <Heart size={48} className="text-primary fill-primary animate-pulse filter drop-shadow-[0_0_10px_var(--primary-color)]" />
        <span className="text-text text-xs uppercase tracking-widest mt-4 animate-pulse">Initializing Core...</span>
      </div>
    );
  }

  // Header Nav Bar
  return (
    <div className="w-full min-h-screen flex flex-col justify-between">
      
      {/* Dynamic Header Floating Menu */}
      <header className="fixed top-4 left-1/2 transform -translate-x-1/2 z-40 bg-black/35 backdrop-blur-md border border-white/10 px-6 py-2.5 rounded-full shadow-lg flex items-center justify-between gap-6 max-w-xl w-auto">
        <a href="#/" className="flex items-center gap-1.5 text-white font-bold text-sm tracking-wider uppercase">
          <Heart size={14} className="text-primary fill-primary animate-beat" />
          <span>{settings?.logo || 'Love Story'}</span>
        </a>

        <nav className="flex items-center gap-4 text-xs font-semibold text-white/70 uppercase tracking-widest">
          <a href="#/" className={`hover:text-white flex items-center gap-1 transition-colors ${hash === '#/' ? 'text-primary' : ''}`}>
            <HomeIcon size={12} />
            <span className="hidden sm:inline">{t('home')}</span>
          </a>
          
          {settings?.isSecretPageEnabled && (
            <a href="#/secret" className={`hover:text-white flex items-center gap-1 transition-colors ${hash === '#/secret' ? 'text-primary' : ''}`}>
              <Lock size={12} />
              <span className="hidden sm:inline">{t('archive')}</span>
            </a>
          )}

          <a href="#/admin" className={`hover:text-white flex items-center gap-1 transition-colors ${hash === '#/admin' ? 'text-primary' : ''}`}>
            <LayoutDashboard size={12} />
            <span className="hidden sm:inline">{t('cms')}</span>
          </a>
        </nav>

        {/* Language switch button */}
        <button
          onClick={() => setLanguage(language === 'vi' ? 'en' : 'vi')}
          className="px-2 py-1 rounded bg-white/10 hover:bg-white/20 border border-white/15 text-white text-[9px] font-bold tracking-wider transition-all cursor-pointer transform active:scale-95"
        >
          {language === 'vi' ? 'EN 🇬🇧' : 'VI 🇻🇳'}
        </button>
      </header>

      {/* Main Pages rendering */}
      <main className="flex-grow pt-10">
        {hash === '#/admin' ? (
          <AdminDashboard />
        ) : hash === '#/secret' ? (
          <SecretPage />
        ) : (
          <Home />
        )}
      </main>

      {/* Floating Media overlay items */}
      <ParticleLayer />
      <MusicPlayer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <PageRouter />
    </ThemeProvider>
  );
};

export default App;
