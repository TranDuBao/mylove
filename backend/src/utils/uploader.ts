import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { cloudinary, isCloudinaryConfigured } from '../config/cloudinary.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const UPLOAD_DIR = path.join(__dirname, '..', '..', 'uploads');

// Ensure directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Multer temporary disk storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

// File filter (images, videos, and audio only)
const fileFilter = (req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedTypes = /jpeg|jpg|png|webp|gif|mp3|wav|mp4|webm|mov/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext && mime) {
    cb(null, true);
  } else {
    cb(new Error('Only images, videos (mp4/webm/mov), and audio (mp3/wav) files are allowed!'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 100 * 1024 * 1024 } // 100MB max file size limit
});

export interface UploadResult {
  url: string;
  publicId: string;
}

/**
 * Uploads a local temp file to Cloudinary, or keeps it local depending on credentials.
 */
export const uploadFile = async (file: Express.Multer.File, folderName: string = 'love_story'): Promise<UploadResult> => {
  if (isCloudinaryConfigured) {
    try {
      let resourceType: 'image' | 'video' | 'raw' = 'image';
      if (file.mimetype.startsWith('video/')) {
        resourceType = 'video';
      } else if (file.mimetype.startsWith('audio/')) {
        resourceType = 'raw';
      }

      const res = await cloudinary.uploader.upload(file.path, {
        folder: folderName,
        resource_type: resourceType
      });

      // Remove local temp file
      if (fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }

      return {
        url: res.secure_url,
        publicId: res.public_id
      };
    } catch (error) {
      console.error('Cloudinary upload failed, falling back to local storage:', error);
    }
  }

  // Local storage fallback
  // Create a permanent filename and serve it statically
  const filename = file.filename;
  const webPath = `/uploads/${filename}`;
  
  // Since Multer already saved it to UPLOAD_DIR, we just keep it there!
  return {
    url: webPath,
    publicId: `local-${filename}`
  };
};

/**
 * Deletes a file. If Cloudinary, removes it online. If local, deletes it from disk.
 */
export const deleteFile = async (publicId: string): Promise<boolean> => {
  if (!publicId) return false;

  if (publicId.startsWith('local-')) {
    const filename = publicId.replace('local-', '');
    const filepath = path.join(UPLOAD_DIR, filename);
    try {
      if (fs.existsSync(filepath)) {
        fs.unlinkSync(filepath);
        return true;
      }
    } catch (e) {
      console.error('Local file delete failed:', e);
    }
    return false;
  }

  if (isCloudinaryConfigured) {
    try {
      const res = await cloudinary.uploader.destroy(publicId);
      return res.result === 'ok';
    } catch (error) {
      console.error('Cloudinary delete failed:', error);
    }
  }
  
  return false;
};
