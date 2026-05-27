import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../middleware/auth';

const router = Router();

// ── Zod Schemas ───────────────────────────────────────────────────────────────

const createOrderSchema = z.object({
  customerName: z.string().min(1, 'Name is required'),
  address: z.string().min(5, 'Address is required'),
  whatsapp: z
    .string()
    .regex(/^01[0125][0-9]{8}$/, 'Invalid Egyptian phone number'),
  phone: z
    .string()
    .regex(/^01[0125][0-9]{8}$/, 'Invalid Egyptian phone number'),
  productId: z.number().int().positive('Product ID is required'),
  quantity: z.number().int().min(1, 'Quantity must be at least 1').default(1),
});

const statusSchema = z.object({
  status: z.enum(['PENDING', 'CONFIRMED', 'CANCELLED']),
  notes: z.string().optional(),
});

// ── POST /api/orders — Public (Lead Form) ─────────────────────────────────────
router.post('/', async (req: Request, res: Response): Promise<void> => {
  const parsed = createOrderSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }

  const { customerName, address, whatsapp, phone, productId, quantity } = parsed.data;

  try {
    // Fetch product to snapshot the name and validate stock
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) {
      res.status(404).json({ error: 'Product not found.' });
      return;
    }

    if (product.stock < 1) {
      res.status(400).json({ error: 'This product is out of stock.' });
      return;
    }

    if (quantity > product.stock) {
      res.status(400).json({ error: `Only ${product.stock} unit(s) available in stock.` });
      return;
    }

    const order = await prisma.order.create({
      data: {
        customerName,
        address,
        whatsapp,
        phone,
        productId,
        productName: product.name,
        quantity,
      },
      include: { product: { select: { name: true, price: true } } },
    });

    res.status(201).json({ order, message: 'Order received! We will contact you within minutes.' });
  } catch {
    res.status(500).json({ error: 'Failed to create order.' });
  }
});

// ── GET /api/orders — Protected ───────────────────────────────────────────────
router.get('/', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;

    const orders = await prisma.order.findMany({
      where: status ? { status: status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' } : {},
      include: { product: { select: { name: true, price: true, images: true } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(orders);
  } catch {
    res.status(500).json({ error: 'Failed to fetch orders.' });
  }
});

// ── GET /api/orders/:id — Protected ───────────────────────────────────────────
router.get('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: Number(req.params.id) },
      include: { product: true },
    });
    if (!order) {
      res.status(404).json({ error: 'Order not found.' });
      return;
    }
    res.json(order);
  } catch {
    res.status(500).json({ error: 'Failed to fetch order.' });
  }
});

// ── PATCH /api/orders/:id/status — Protected ──────────────────────────────────
router.patch('/:id/status', verifyToken, async (req: Request, res: Response): Promise<void> => {
  const parsed = statusSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.flatten() });
    return;
  }
  try {
    const order = await prisma.order.update({
      where: { id: Number(req.params.id) },
      data: parsed.data,
    });
    res.json(order);
  } catch {
    res.status(404).json({ error: 'Order not found.' });
  }
});

// ── DELETE /api/orders/clear-all — Protected ──────────────────────────────────
router.delete('/clear-all', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    const { status } = req.query;
    await prisma.order.deleteMany({
      where: status && status !== 'ALL' ? { status: status as 'PENDING' | 'CONFIRMED' | 'CANCELLED' } : {},
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to clear orders.' });
  }
});

// ── DELETE /api/orders/:id — Protected ────────────────────────────────────────
router.delete('/:id', verifyToken, async (req: Request, res: Response): Promise<void> => {
  try {
    await prisma.order.delete({
      where: { id: Number(req.params.id) },
    });
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: 'Failed to delete order.' });
  }
});

export default router;
