import { Settings } from '../models/Settings.js';
import { Theme } from '../models/Theme.js';
import { Effects } from '../models/Effects.js';
import { Content } from '../models/Content.js';
import { Stats } from '../models/Stats.js';
import { Admin } from '../models/Admin.js';
import { Photo } from '../models/Photo.js';
import { Timeline } from '../models/Timeline.js';
import { Letter } from '../models/Letter.js';
import { Music } from '../models/Music.js';
import { Video } from '../models/Video.js';
import { MapMarker } from '../models/MapMarker.js';
import { ScratchCardModel } from '../models/ScratchCard.js';
import { jsonDb } from './jsonDb.js';

// Type helper for collections
const modelMapping: { [key: string]: any } = {
  photos: Photo,
  timeline: Timeline,
  letters: Letter,
  music: Music,
  videos: Video,
  markers: MapMarker,
  scratchcards: ScratchCardModel,
};

export const dbHelper = {
  // --- SINGLETON SETTINGS ---
  async getSettings(): Promise<any> {
    if (global.dbFallback) {
      let settings = jsonDb.findOne('settings', () => true);
      if (!settings) {
        settings = jsonDb.insertOne('settings', {});
      }
      return settings;
    } else {
      let settings = await Settings.findOne();
      if (!settings) {
        settings = await Settings.create({});
      }
      return settings;
    }
  },

  async updateSettings(data: any): Promise<any> {
    if (global.dbFallback) {
      return jsonDb.updateOne('settings', () => true, data);
    } else {
      const { _id, createdAt, updatedAt, ...updateData } = data;
      return await Settings.findOneAndUpdate({}, { $set: updateData }, { new: true, upsert: true });
    }
  },

  // --- SINGLETON THEME ---
  async getTheme(): Promise<any> {
    if (global.dbFallback) {
      let theme = jsonDb.findOne('theme', () => true);
      if (!theme) {
        theme = jsonDb.insertOne('theme', {});
      }
      return theme;
    } else {
      let theme = await Theme.findOne();
      if (!theme) {
        theme = await Theme.create({});
      }
      return theme;
    }
  },

  async updateTheme(data: any): Promise<any> {
    if (global.dbFallback) {
      return jsonDb.updateOne('theme', () => true, data);
    } else {
      const { _id, createdAt, updatedAt, ...updateData } = data;
      return await Theme.findOneAndUpdate({}, { $set: updateData }, { new: true, upsert: true });
    }
  },

  // --- SINGLETON EFFECTS ---
  async getEffects(): Promise<any> {
    if (global.dbFallback) {
      let effects = jsonDb.findOne('effects', () => true);
      if (!effects) {
        effects = jsonDb.insertOne('effects', {});
      }
      return effects;
    } else {
      let effects = await Effects.findOne();
      if (!effects) {
        effects = await Effects.create({});
      }
      return effects;
    }
  },

  async updateEffects(data: any): Promise<any> {
    if (global.dbFallback) {
      return jsonDb.updateOne('effects', () => true, data);
    } else {
      const { _id, createdAt, updatedAt, ...updateData } = data;
      return await Effects.findOneAndUpdate({}, { $set: updateData }, { new: true, upsert: true });
    }
  },

  // --- SINGLETON CONTENT ---
  async getContent(): Promise<any> {
    if (global.dbFallback) {
      let content = jsonDb.findOne('content', () => true);
      if (!content) {
        content = jsonDb.insertOne('content', {});
      }
      return content;
    } else {
      let content = await Content.findOne();
      if (!content) {
        content = await Content.create({});
      }
      return content;
    }
  },

  async updateContent(data: any): Promise<any> {
    if (global.dbFallback) {
      return jsonDb.updateOne('content', () => true, data);
    } else {
      const { _id, createdAt, updatedAt, ...updateData } = data;
      return await Content.findOneAndUpdate({}, { $set: updateData }, { new: true, upsert: true });
    }
  },

  // --- SINGLETON VISITOR STATS ---
  async getStats(): Promise<any> {
    if (global.dbFallback) {
      let stats = jsonDb.findOne('stats', () => true);
      if (!stats) {
        stats = jsonDb.insertOne('stats', { visitsCount: 0 });
      }
      return stats;
    } else {
      let stats = await Stats.findOne();
      if (!stats) {
        stats = await Stats.create({ visitsCount: 0 });
      }
      return stats;
    }
  },

  async incrementVisits(): Promise<any> {
    if (global.dbFallback) {
      const stats = await this.getStats();
      return jsonDb.updateOne('stats', () => true, {
        visitsCount: (stats.visitsCount || 0) + 1,
        lastVisitedAt: new Date().toISOString(),
      });
    } else {
      return await Stats.findOneAndUpdate(
        {},
        { $inc: { visitsCount: 1 }, $set: { lastVisitedAt: new Date() } },
        { new: true, upsert: true }
      );
    }
  },

  // --- CRUD COLLECTIONS (Photos, Timeline, Letters, Music, Videos, MapMarkers) ---
  async listAll(collection: string): Promise<any[]> {
    if (global.dbFallback) {
      const items = jsonDb.find(collection);
      // Sort by 'order' if elements have it
      return items.sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      const model = modelMapping[collection];
      if (!model) return [];
      const hasOrder = model.schema.path('order');
      if (hasOrder) {
        return await model.find().sort({ order: 1 });
      }
      return await model.find();
    }
  },

  async getById(collection: string, id: string): Promise<any> {
    if (global.dbFallback) {
      return jsonDb.findOne(collection, item => item._id === id);
    } else {
      const model = modelMapping[collection];
      if (!model) return null;
      return await model.findById(id);
    }
  },

  async create(collection: string, data: any): Promise<any> {
    if (global.dbFallback) {
      return jsonDb.insertOne(collection, data);
    } else {
      const model = modelMapping[collection];
      if (!model) return null;
      return await model.create(data);
    }
  },

  async update(collection: string, id: string, data: any): Promise<any> {
    if (global.dbFallback) {
      return jsonDb.updateOne(collection, item => item._id === id, data);
    } else {
      const model = modelMapping[collection];
      if (!model) return null;
      return await model.findByIdAndUpdate(id, { $set: data }, { new: true });
    }
  },

  async delete(collection: string, id: string): Promise<boolean> {
    if (global.dbFallback) {
      return jsonDb.deleteOne(collection, item => item._id === id);
    } else {
      const model = modelMapping[collection];
      if (!model) return false;
      const res = await model.findByIdAndDelete(id);
      return !!res;
    }
  },

  // Batch sorting
  async reorder(collection: string, sortedIds: string[]): Promise<boolean> {
    if (global.dbFallback) {
      const items = jsonDb.getCollection(collection);
      const updated = items.map(item => {
        const idx = sortedIds.indexOf(item._id);
        if (idx !== -1) {
          return { ...item, order: idx };
        }
        return item;
      });
      jsonDb.setCollection(collection, updated);
      return true;
    } else {
      const model = modelMapping[collection];
      if (!model) return false;
      const bulkOps = sortedIds.map((id, index) => ({
        updateOne: {
          filter: { _id: id },
          update: { $set: { order: index } },
        },
      }));
      await model.bulkWrite(bulkOps);
      return true;
    }
  },
};
export default dbHelper;
