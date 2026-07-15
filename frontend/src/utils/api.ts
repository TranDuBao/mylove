import type { SiteData, Photo, TimelineEvent, Letter, Song, Video, MapMarker, AdminStats, AdminSession } from '../types/index.js';

const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

// Get token helper
const getHeaders = (isMultipart = false) => {
  const headers: HeadersInit = {};
  if (!isMultipart) {
    headers['Content-Type'] = 'application/json';
  }
  const token = localStorage.getItem('love_token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// Error handling helper
const handleResponse = async (res: Response) => {
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.message || `API error: ${res.status}`);
  }
  return res.json();
};

export const api = {
  // --- PUBLIC DATA ---
  async getSiteData(): Promise<SiteData> {
    const res = await fetch(`${API_URL}/settings`);
    return handleResponse(res);
  },

  async logVisit(): Promise<{ visitsCount: number }> {
    const res = await fetch(`${API_URL}/settings/visit`, {
      method: 'POST',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- AUTHENTICATION ---
  async login(credentials: any): Promise<AdminSession> {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(res);
    localStorage.setItem('love_token', data.token);
    return data;
  },

  logout() {
    localStorage.removeItem('love_token');
  },

  async getMe(): Promise<any> {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async changePassword(passwords: any): Promise<{ message: string }> {
    const res = await fetch(`${API_URL}/auth/change-password`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(passwords),
    });
    return handleResponse(res);
  },

  // --- CONFIG / THEME OVERRIDES (ADMIN) ---
  async updateConfig(config: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/config`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(config),
    });
    return handleResponse(res);
  },

  async updateTheme(theme: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/theme`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(theme),
    });
    return handleResponse(res);
  },

  async updateEffects(effects: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/effects`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(effects),
    });
    return handleResponse(res);
  },

  async updateContent(content: any): Promise<any> {
    const res = await fetch(`${API_URL}/settings/content`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(content),
    });
    return handleResponse(res);
  },

  async uploadBgMusic(formData: FormData): Promise<any> {
    const res = await fetch(`${API_URL}/settings/bg-music`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteBgMusic(): Promise<any> {
    const res = await fetch(`${API_URL}/settings/bg-music`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getStats(): Promise<AdminStats> {
    const res = await fetch(`${API_URL}/settings/stats`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- PHOTOS GALLERY (CRUD) ---
  async getPhotos(): Promise<Photo[]> {
    const res = await fetch(`${API_URL}/gallery`);
    return handleResponse(res);
  },

  async uploadPhoto(formData: FormData): Promise<Photo> {
    const res = await fetch(`${API_URL}/gallery`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async updatePhoto(id: string, update: Partial<Photo>): Promise<Photo> {
    const res = await fetch(`${API_URL}/gallery/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(update),
    });
    return handleResponse(res);
  },

  async reorderPhotos(sortedIds: string[]): Promise<any> {
    const res = await fetch(`${API_URL}/gallery/reorder`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ sortedIds }),
    });
    return handleResponse(res);
  },

  async deletePhoto(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/gallery/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- TIMELINE EVENTS (CRUD) ---
  async getTimelineEvents(): Promise<TimelineEvent[]> {
    const res = await fetch(`${API_URL}/timeline`);
    return handleResponse(res);
  },

  async createTimelineEvent(formData: FormData): Promise<TimelineEvent> {
    const res = await fetch(`${API_URL}/timeline`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async updateTimelineEvent(id: string, formData: FormData): Promise<TimelineEvent> {
    const res = await fetch(`${API_URL}/timeline/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteTimelineEvent(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/timeline/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async reorderTimeline(sortedIds: string[]): Promise<any> {
    const res = await fetch(`${API_URL}/timeline/reorder`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ sortedIds }),
    });
    return handleResponse(res);
  },

  // --- LOVE LETTERS (CRUD) ---
  async getLetters(): Promise<Letter[]> {
    const res = await fetch(`${API_URL}/letters`);
    return handleResponse(res);
  },

  async createLetter(letter: Partial<Letter>): Promise<Letter> {
    const res = await fetch(`${API_URL}/letters`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(letter),
    });
    return handleResponse(res);
  },

  async updateLetter(id: string, letter: Partial<Letter>): Promise<Letter> {
    const res = await fetch(`${API_URL}/letters/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(letter),
    });
    return handleResponse(res);
  },

  async deleteLetter(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/letters/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- SONGS PLAYLIST (CRUD) ---
  async getSongs(): Promise<Song[]> {
    const res = await fetch(`${API_URL}/music`);
    return handleResponse(res);
  },

  async uploadSong(formData: FormData): Promise<Song> {
    const res = await fetch(`${API_URL}/music`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteSong(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/music/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async reorderSongs(sortedIds: string[]): Promise<any> {
    const res = await fetch(`${API_URL}/music/reorder`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ sortedIds }),
    });
    return handleResponse(res);
  },

  // --- VIDEO MEMORIES (CRUD) ---
  async getVideos(): Promise<Video[]> {
    const res = await fetch(`${API_URL}/videos`);
    return handleResponse(res);
  },

  async uploadVideo(formData: FormData): Promise<Video> {
    const res = await fetch(`${API_URL}/videos`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteVideo(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/videos/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async reorderVideos(sortedIds: string[]): Promise<any> {
    const res = await fetch(`${API_URL}/videos/reorder`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ sortedIds }),
    });
    return handleResponse(res);
  },

  // --- MAP MARKERS (CRUD) ---
  async getMarkers(): Promise<MapMarker[]> {
    const res = await fetch(`${API_URL}/markers`);
    return handleResponse(res);
  },

  async createMarker(formData: FormData): Promise<MapMarker> {
    const res = await fetch(`${API_URL}/markers`, {
      method: 'POST',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async updateMarker(id: string, formData: FormData): Promise<MapMarker> {
    const res = await fetch(`${API_URL}/markers/${id}`, {
      method: 'PUT',
      headers: getHeaders(true),
      body: formData,
    });
    return handleResponse(res);
  },

  async deleteMarker(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/markers/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- SCRATCH CARDS (CRUD) ---
  async getScratchCards(): Promise<any[]> {
    const res = await fetch(`${API_URL}/scratchcards`);
    return handleResponse(res);
  },

  async createScratchCard(card: any): Promise<any> {
    const res = await fetch(`${API_URL}/scratchcards`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(card),
    });
    return handleResponse(res);
  },

  async updateScratchCard(id: string, card: any): Promise<any> {
    const res = await fetch(`${API_URL}/scratchcards/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(card),
    });
    return handleResponse(res);
  },

  async deleteScratchCard(id: string): Promise<any> {
    const res = await fetch(`${API_URL}/scratchcards/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async seedScratchCards(cards: any[]): Promise<any> {
    const res = await fetch(`${API_URL}/scratchcards/seed`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ cards }),
    });
    return handleResponse(res);
  },

  async reorderScratchCards(sortedIds: string[]): Promise<any> {
    const res = await fetch(`${API_URL}/scratchcards/reorder`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ sortedIds }),
    });
    return handleResponse(res);
  },
};
