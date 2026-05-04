import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../middleware/auth';

const router = Router();

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
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const product = await prisma.product.create({ data: parsed.data });
    res.status(201).json(product);
  } catch {
    res.status(409).json({ error: 'Product slug already exists.' });
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
    await prisma.product.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Product deleted.' });
  } catch {
    res.status(409).json({ error: 'Cannot delete — product has associated orders.' });
  }
});

export default router;
