import { Router, Request, Response } from 'express';
import crypto from 'crypto';
import multer from 'multer';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import cloudinary from '../lib/cloudinary';
import { verifyToken } from '../middleware/auth';

// ── Multer × Cloudinary Storage ──────────────────────────────────────────────
const storage = new CloudinaryStorage({
  cloudinary,
  params: async (_req, file) => {
    const uniqueId = crypto.randomUUID();
    return {
      folder: 'hijappy/products',
      allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
      transformation: [{ width: 1200, height: 1600, crop: 'limit', quality: 'auto:best' }],
      public_id: `hijappy-product-${uniqueId}`,
    };
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB per file
});

const router = Router();

// ── POST /api/upload — Protected ─────────────────────────────────────────────
// Accepts field name "images", up to 10 files
router.post(
  '/',
  verifyToken,
  upload.array('images', 10),
  (req: Request, res: Response): void => {
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      res.status(400).json({ error: 'No files uploaded.' });
      return;
    }

    const urls = (req.files as Express.Multer.File[]).map(
      // multer-storage-cloudinary attaches .path as the secure_url
      (f: Express.Multer.File & { path?: string }) => f.path,
    );

    res.json({ urls, count: urls.length });
  },
);

export default router;
