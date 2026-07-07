import React, { useState, useEffect, useRef } from 'react';
import { api } from '../utils/api.js';
import type { Song } from '../types/index.js';
import { Play, Pause, SkipForward, SkipBack, Volume2, Music, List, X, Loader2 } from 'lucide-react';
import { useThemeContext } from '../context/ThemeContext.js';

const DEFAULT_SONG: Song = {
  _id: 'default',
  title: 'Romantic Piano Melody',
  artist: 'Sweet Memory',
  url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  publicId: '',
  coverUrl: 'https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=120&auto=format&fit=crop&q=60',
  coverPublicId: '',
  order: 0
};

export const MusicPlayer: React.FC = () => {
  const { theme, settings } = useThemeContext();
  const [songs, setSongs] = useState<Song[]>([DEFAULT_SONG]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showPlaylist, setShowPlaylist] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(0.5);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);

  // Audio Context and Visualizer state
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | null>(null);
  const barRefs = useRef<(HTMLDivElement | null)[]>([]);
  const animationFrameRef = useRef<number | null>(null);

  const activeSong = songs[currentIdx] || DEFAULT_SONG;

  // Load songs list from backend
  useEffect(() => {
    const fetchMusic = async () => {
      try {
        const list = await api.getSongs();
        if (list.length > 0) {
          setSongs(list);
        }
      } catch (e) {
        console.error('Failed to load songs:', e);
      }
    };
    fetchMusic();
  }, []);

  // Update volume
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  // Audio visualizer loop
  const startVisualizer = () => {
    if (!audioRef.current) return;

    // Initialize AudioContext on first click (browser restrictions)
    if (!audioCtxRef.current) {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 64; // Small size for 16 bars
        
        // Connect nodes
        const source = ctx.createMediaElementSource(audioRef.current);
        source.connect(analyser);
        analyser.connect(ctx.destination);

        audioCtxRef.current = ctx;
        analyserRef.current = analyser;
        sourceRef.current = source;
      } catch (e) {
        console.warn('AudioContext failed to start:', e);
      }
    }

    // Start drawing loop
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    const dataArray = new Uint8Array(bufferLength);

    const draw = () => {
      if (!audioRef.current || audioRef.current.paused) return;

      analyser.getByteFrequencyData(dataArray);

      // Map frequency data to height of our visualizer bars
      for (let i = 0; i < 12; i++) {
        const value = dataArray[i * 2] || 0;
        const heightPercent = Math.max(6, Math.round((value / 255) * 100));
        const bar = barRefs.current[i];
        if (bar) {
          bar.style.height = `${heightPercent}%`;
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();
  };

  const stopVisualizer = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    // Return bars to rest height
    barRefs.current.forEach(bar => {
      if (bar) bar.style.height = '6px';
    });
  };

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
      stopVisualizer();
    } else {
      setIsLoadingAudio(true);
      // Auto-resume audio context if suspended
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        await audioCtxRef.current.resume();
      }
      
      audioRef.current.play()
        .then(() => {
          setIsPlaying(true);
          setIsLoadingAudio(false);
          startVisualizer();
        })
        .catch((e) => {
          console.error('Playback failed:', e);
          setIsLoadingAudio(false);
        });
    }
  };

  const playNext = () => {
    let nextIdx = currentIdx + 1;
    if (nextIdx >= songs.length) nextIdx = 0;
    setCurrentIdx(nextIdx);
    setIsPlaying(false);
    
    // Play new track after index change resolves
    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        togglePlay();
      }
    }, 100);
  };

  const playPrev = () => {
    let prevIdx = currentIdx - 1;
    if (prevIdx < 0) prevIdx = songs.length - 1;
    setCurrentIdx(prevIdx);
    setIsPlaying(false);

    setTimeout(() => {
      if (audioRef.current) {
        audioRef.current.load();
        togglePlay();
      }
    }, 100);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!audioRef.current || duration === 0) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const pct = x / rect.width;
    audioRef.current.currentTime = pct * duration;
    setCurrentTime(pct * duration);
  };

  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const mins = Math.floor(time / 60);
    const secs = Math.floor(time % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getFullUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    if (url.startsWith('music/') || url.startsWith('/music/')) {
      return url.startsWith('/') ? url : `/${url}`;
    }
    const baseUrl = (import.meta.env.VITE_API_URL as string)?.replace('/api', '') || 'http://localhost:5000';
    return `${baseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">
      {/* Invisible HTML5 Audio Tag */}
      <audio
        ref={audioRef}
        src={getFullUrl(activeSong.url)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={playNext}
        crossOrigin="anonymous"
      />

      {/* Expanded Main Player Board */}
      {isExpanded && (
        <div className="w-[320px] glassmorphism-dark rounded-2xl glow-border p-5 shadow-2xl mb-3 flex flex-col">
          {/* Header */}
          <div className="flex justify-between items-center mb-4">
            <span className="text-white font-bold text-xs uppercase tracking-wider flex items-center gap-1.5">
              <Music size={14} className="text-primary animate-pulse" />
              Now Playing
            </span>
            <button 
              onClick={() => setIsExpanded(false)}
              className="text-secondary hover:text-white p-1 rounded-full hover:bg-white/5 transition-colors"
            >
              <X size={16} />
            </button>
          </div>

          {/* Vinyl cover container */}
          <div className="flex gap-4 items-center mb-4">
            <div className="relative w-20 h-20 rounded-full border-4 border-black/60 shadow-lg overflow-hidden flex-shrink-0">
              <img
                src={getFullUrl(activeSong.coverUrl)}
                alt={activeSong.title}
                className={`w-full h-full object-cover rounded-full ${isPlaying ? 'animate-spin-slow' : ''}`}
              />
              {/* Vinyl center dot */}
              <div className="absolute inset-0 m-auto w-4 h-4 bg-black border-2 border-white/20 rounded-full" />
            </div>

            <div className="overflow-hidden flex-grow">
              <h4 className="text-white font-bold text-sm truncate">{activeSong.title}</h4>
              <p className="text-secondary text-xs truncate mt-0.5">{activeSong.artist}</p>
              
              {/* Dancing Wave bars wrapper */}
              <div className="flex items-end gap-[3px] h-6 mt-2">
                {Array.from({ length: 12 }).map((_, i) => (
                  <div
                    key={i}
                    ref={el => { barRefs.current[i] = el; }}
                    className="w-[3px] rounded-full bg-primary"
                    style={{ height: '6px', transition: isPlaying ? 'none' : 'height 0.3s ease' }}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div 
              onClick={handleProgressClick}
              className="w-full h-1.5 bg-white/10 rounded-full cursor-pointer relative group"
            >
              <div
                className="h-full bg-primary rounded-full absolute left-0 top-0 group-hover:bg-secondary transition-colors"
                style={{ width: `${(currentTime / duration) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[10px] text-secondary mt-1">
              <span>{formatTime(currentTime)}</span>
              <span>{formatTime(duration)}</span>
            </div>
          </div>

          {/* Controls button panel */}
          <div className="flex justify-between items-center">
            <button 
              onClick={() => setShowPlaylist(!showPlaylist)}
              className={`p-2 rounded-full border transition-colors ${
                showPlaylist ? 'bg-primary/20 text-white border-primary' : 'bg-white/5 text-secondary border-white/5 hover:bg-white/10'
              }`}
            >
              <List size={16} />
            </button>

            <div className="flex gap-3 items-center">
              <button onClick={playPrev} className="text-secondary hover:text-white transition-colors">
                <SkipBack size={18} />
              </button>
              
              <button
                onClick={togglePlay}
                disabled={isLoadingAudio}
                className="w-10 h-10 rounded-full bg-primary border border-primary/20 hover:bg-primary/80 text-white flex items-center justify-center transition-all hover:shadow-[0_0_10px_var(--primary-color)] transform active:scale-95"
              >
                {isLoadingAudio ? (
                  <Loader2 size={18} className="animate-spin" />
                ) : isPlaying ? (
                  <Pause size={18} />
                ) : (
                  <Play size={18} className="ml-0.5" />
                )}
              </button>

              <button onClick={playNext} className="text-secondary hover:text-white transition-colors">
                <SkipForward size={18} />
              </button>
            </div>

            {/* Volume slider */}
            <div className="flex items-center gap-1.5 group">
              <Volume2 size={16} className="text-secondary" />
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={volume}
                onChange={(e) => setVolume(parseFloat(e.target.value))}
                className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer accent-primary"
              />
            </div>
          </div>

          {/* Playlist list Drawer */}
          {showPlaylist && (
            <div className="border-t border-white/10 pt-3 mt-3 max-h-[140px] overflow-y-auto space-y-1.5">
              {songs.map((song, idx) => (
                <div
                  key={song._id}
                  onClick={() => {
                    setCurrentIdx(idx);
                    setIsPlaying(false);
                    setTimeout(() => {
                      if (audioRef.current) {
                        audioRef.current.load();
                        togglePlay();
                      }
                    }, 100);
                  }}
                  className={`px-3 py-1.5 rounded-lg flex items-center gap-2 cursor-pointer transition-colors text-xs ${
                    currentIdx === idx ? 'bg-primary/10 text-primary font-bold' : 'hover:bg-white/5 text-secondary'
                  }`}
                >
                  <img src={getFullUrl(song.coverUrl)} alt="" className="w-5 h-5 rounded object-cover" />
                  <div className="truncate flex-grow">
                    <p className="truncate">{song.title}</p>
                    <p className="text-[10px] text-secondary opacity-60 truncate">{song.artist}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Floating play/pause bubble when collapsed */}
      {!isExpanded && (
        <button
          onClick={() => setIsExpanded(true)}
          className="w-12 h-12 rounded-full glassmorphism border border-white/10 text-white flex items-center justify-center shadow-2xl hover:scale-110 active:scale-95 transition-all glow-border"
        >
          <Music size={20} className={isPlaying ? 'animate-bounce text-primary' : 'text-secondary'} />
        </button>
      )}
    </div>
  );
};

export default MusicPlayer;
