import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../middleware/auth';

const router = Router();

// ── Zod Schemas ──────────────────────────────────────────────────────────────

const categorySchema = z.object({
  name: z.string().min(1, 'Name is required'),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/, 'Slug must be lowercase letters, numbers, or hyphens'),
});

// ── GET /api/categories — Public ─────────────────────────────────────────────
router.get('/', async (_req: Request, res: Response): Promise<void> => {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { name: 'asc' },
      include: { _count: { select: { products: true } } },
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories.' });
  }
});

// ── GET /api/categories/:id — Public ─────────────────────────────────────────
router.get('/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const category = await prisma.category.findUnique({
      where: { id: Number(req.params.id) },
      include: { products: true },
    });
    if (!category) {
      res.status(404).json({ error: 'Category not found.' });
      return;
    }
    res.json(category);
  } catch {
    res.status(500).json({ error: 'Failed to fetch category.' });
  }
});

// ── POST /api/categories — Protected ─────────────────────────────────────────
router.post('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const category = await prisma.category.create({ data: parsed.data });
    res.status(201).json(category);
  } catch {
    res.status(409).json({ error: 'Category name or slug already exists.' });
  }
});

// ── PUT /api/categories/:id — Protected ──────────────────────────────────────
router.put('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const parsed = categorySchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const category = await prisma.category.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });
    res.json(category);
  } catch {
    res.status(404).json({ error: 'Category not found or slug conflict.' });
  }
});

// ── DELETE /api/categories/:id — Protected ───────────────────────────────────
router.delete('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.category.delete({ where: { id: Number(req.params.id) } });
    res.json({ message: 'Category deleted.' });
  } catch {
    res
      .status(409)
      .json({ error: 'Cannot delete — category has associated products.' });
  }
});

export default router;
