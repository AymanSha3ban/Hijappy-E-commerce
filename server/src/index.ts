import 'dotenv/config';
import express from 'express';
import cors from 'cors';

import authRoutes from './routes/auth.routes';
import categoryRoutes from './routes/categories.routes';
import productRoutes from './routes/products.routes';
import orderRoutes from './routes/orders.routes';
import dashboardRoutes from './routes/dashboard.routes';
import uploadRoutes from './routes/upload.routes';

const app = express();
const PORT = process.env.PORT ?? 3001;

// ─────────────────────────────────────────────
// Global Middleware
// ─────────────────────────────────────────────
app.use(cors({
  origin: [
    'https://hijappy-e-commerce.vercel.app',
    'http://localhost:5173'
  ],
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ─────────────────────────────────────────────
// Security & Privacy Headers
// Fixes Edge "Tracking Prevention blocked access to storage" for Cloudinary CDN
// ─────────────────────────────────────────────
app.use((_req, res, next) => {
  // Allow cross-origin images (Cloudinary CDN) without credential leakage
  res.setHeader('Cross-Origin-Resource-Policy', 'cross-origin');
  // Tell browsers not to send the Referer header to third-party CDNs
  res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
  // Content Security Policy to allow Cloudinary and Fonts
  res.setHeader(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://res.cloudinary.com; connect-src 'self' https://res.cloudinary.com http://localhost:3001;"
  );
  // Disable storage-access for embedded third-party content
  res.setHeader(
    'Permissions-Policy',
    'storage-access=(), interest-cohort=()',
  );
  next();
});

// ─────────────────────────────────────────────
// Health Check
// ─────────────────────────────────────────────
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ─────────────────────────────────────────────
// API Routes
// ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/upload', uploadRoutes);

// ─────────────────────────────────────────────
// 404 Handler
// ─────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: 'Route not found.' });
});

// ─────────────────────────────────────────────
// Global Error Handler
// ─────────────────────────────────────────────
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error('[Server Error]', err.message);
  res.status(500).json({ error: 'Internal server error.' });
});

// ─────────────────────────────────────────────
// Start Server
// ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🚀 Hijappy Server running on http://localhost:${PORT}`);
  console.log(`   Environment : ${process.env.NODE_ENV ?? 'development'}`);
  console.log(`   CORS Origin : ${process.env.CLIENT_URL ?? 'http://localhost:5173'}`);
  console.log(`   Cloudinary  : ${process.env.CLOUDINARY_NAME ?? '⚠️  not configured'}\n`);
});

export default app;
