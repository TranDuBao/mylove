import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, '..', '..', 'local_db.json');

// Interface for database structure
interface DbSchema {
  admins: any[];
  settings: any[];
  theme: any[];
  effects: any[];
  photos: any[];
  timeline: any[];
  letters: any[];
  music: any[];
  markers: any[];
  videos: any[];
  stats: any[];
  [key: string]: any[];
}

const DEFAULT_DB: DbSchema = {
  admins: [],
  settings: [],
  theme: [],
  effects: [],
  photos: [],
  timeline: [],
  letters: [],
  music: [],
  markers: [],
  videos: [],
  stats: []
};

// Initialize file if not exists
if (!fs.existsSync(DB_FILE)) {
  fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
}

export const jsonDb = {
  read(): DbSchema {
    try {
      if (!fs.existsSync(DB_FILE)) {
        fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), 'utf-8');
        return DEFAULT_DB;
      }
      const raw = fs.readFileSync(DB_FILE, 'utf-8');
      return JSON.parse(raw) as DbSchema;
    } catch (e) {
      console.error('Error reading JSON DB, returning default:', e);
      return DEFAULT_DB;
    }
  },

  write(data: DbSchema) {
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.error('Error writing JSON DB:', e);
    }
  },

  getCollection(collectionName: string): any[] {
    const db = this.read();
    return db[collectionName] || [];
  },

  setCollection(collectionName: string, data: any[]) {
    const db = this.read();
    db[collectionName] = data;
    this.write(db);
  },

  find(collection: string, filterFn?: (item: any) => boolean): any[] {
    const items = this.getCollection(collection);
    return filterFn ? items.filter(filterFn) : items;
  },

  findOne(collection: string, filterFn: (item: any) => boolean): any | null {
    const items = this.getCollection(collection);
    return items.find(filterFn) || null;
  },

  insertOne(collection: string, item: any): any {
    const items = this.getCollection(collection);
    const newItem = {
      _id: Math.random().toString(36).substring(2, 9) + Date.now().toString(36),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...item
    };
    items.push(newItem);
    this.setCollection(collection, items);
    return newItem;
  },

  updateOne(collection: string, filterFn: (item: any) => boolean, update: any): any | null {
    const items = this.getCollection(collection);
    const idx = items.findIndex(filterFn);
    if (idx === -1) return null;

    const original = items[idx];
    const updated = {
      ...original,
      ...update,
      updatedAt: new Date().toISOString()
    };
    items[idx] = updated;
    this.setCollection(collection, items);
    return updated;
  },

  deleteOne(collection: string, filterFn: (item: any) => boolean): boolean {
    const items = this.getCollection(collection);
    const initialLen = items.length;
    const filtered = items.filter(item => !filterFn(item));
    this.setCollection(collection, filtered);
    return filtered.length < initialLen;
  }
};
