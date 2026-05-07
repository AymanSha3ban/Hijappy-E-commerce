import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import cloudinary from '../lib/cloudinary';
import { verifyToken } from '../middleware/auth';

const router = Router();
 
// ── Helper: Cleanup Cloudinary Images ────────────────────────────────────────
const deleteImagesFromCloudinary = async (urls: string[]) => {
  try {
    const publicIds = urls
      .map((url) => {
        // Cloudinary URL: https://res.cloudinary.com/cloud_name/image/upload/v1234567/folder/public_id.jpg
        const parts = url.split('/');
        const uploadIndex = parts.indexOf('upload');
        if (uploadIndex === -1) return null;
        // The public_id starts after the version (v1234567)
        const publicIdWithExt = parts.slice(uploadIndex + 2).join('/');
        // Remove file extension
        return publicIdWithExt.replace(/\.[^/.]+$/, '');
      })
      .filter(Boolean) as string[];

    if (publicIds.length > 0) {
      console.log('Cleaning up Cloudinary images:', publicIds);
      await Promise.all(publicIds.map((id) => cloudinary.uploader.destroy(id)));
    }
  } catch (error) {
    console.error('Cloudinary cleanup error:', error);
  }
};

// ── Zod Schema ────────────────────────────────────────────────────────────────

const productSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, or hyphens'),
  description: z.string().min(1, 'Description is required'),
  price: z.number().positive('Price must be a positive number'),
  images: z.array(z.string().url('Each image must be a valid URL')).min(1),
  colors: z.array(z.string()).default([]),
  stock: z.number().int().min(0).default(0),
  featured: z.boolean().default(false),
  categoryId: z.number().int().positive('CategoryId is required'),
});

// ── GET /api/products — Public ────────────────────────────────────────────────
router.get('/', async (req: Request, res: Response): Promise<void> => {
  try {
    const { categoryId, featured, search } = req.query;

    const products = await prisma.product.findMany({
      where: {
        ...(categoryId ? { categoryId: Number(categoryId) } : {}),
        ...(featured === 'true' ? { featured: true } : {}),
        ...(search
          ? {
              OR: [
                { name: { contains: search as string, mode: 'insensitive' } },
                { description: { contains: search as string, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { category: { select: { id: true, name: true, slug: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(products);
  } catch {
    res.status(500).json({ error: 'Failed to fetch products.' });
  }
});

// ── GET /api/products/:id — Public ───────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: Number(req.params.id) },
      include: { category: true },
    });
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }
    res.json(product);
  } catch {
    res.status(500).json({ error: 'Failed to fetch product.' });
  }
});

// ── POST /api/products — Protected ───────────────────────────────────────────
router.post('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const parsed = productSchema.safeParse(req.body);

  if (!parsed.success) {
    // If validation fails, cleanup any uploaded images provided in the request
    if (req.body.images && Array.isArray(req.body.images)) {
      await deleteImagesFromCloudinary(req.body.images);
    }
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  try {
    const product = await prisma.product.create({ data: parsed.data });
    res.status(201).json(product);
  } catch (error) {
    // If database creation fails, cleanup the images
    if (parsed.data.images) {
      await deleteImagesFromCloudinary(parsed.data.images);
    }
    res.status(409).json({ error: 'Product slug already exists or database error.' });
  }
});

// ── PUT /api/products/:id — Protected ────────────────────────────────────────
router.put('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const product = await prisma.product.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });
    res.json(product);
  } catch {
    res.status(404).json({ error: 'Product not found or slug conflict.' });
  }
});

// ── DELETE /api/products/:id — Protected ─────────────────────────────────────
router.delete('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const productId = Number(req.params.id);

    // 1. Find product to get image URLs
    const product = await prisma.product.findUnique({
      where: { id: productId },
      select: { images: true },
    });

    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    // 2. Delete from database
    await prisma.product.delete({ where: { id: productId } });

    // 3. Cleanup images from Cloudinary
    if (product.images && product.images.length > 0) {
      await deleteImagesFromCloudinary(product.images);
    }

    res.json({ message: 'Product and associated images deleted.' });
  } catch (error) {
    res.status(409).json({ error: 'Cannot delete — product may have associated orders.' });
  }
});

export default router;
