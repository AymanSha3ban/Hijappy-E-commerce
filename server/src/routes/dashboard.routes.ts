import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { verifyToken } from '../middleware/auth';

const router = Router();

// ── GET /api/dashboard/stats — Protected ──────────────────────────────────────
router.get('/stats', verifyToken, async (_req: Request, res: Response): Promise<void> => {
  try {
    const [totalOrders, totalProducts, totalCategories, pendingOrders, recentOrders] =
      await Promise.all([
        prisma.order.count(),
        prisma.product.count(),
        prisma.category.count(),
        prisma.order.count({ where: { status: 'PENDING' } }),
        prisma.order.findMany({
          take: 5,
          orderBy: { createdAt: 'desc' },
          include: { product: { select: { name: true } } },
        }),
      ]);

    res.json({
      totalOrders,
      totalProducts,
      totalCategories,
      pendingOrders,
      recentOrders,
    });
  } catch {
    res.status(500).json({ error: 'Failed to fetch dashboard stats.' });
  }
});

export default router;
