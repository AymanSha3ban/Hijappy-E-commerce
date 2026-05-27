# Product Requirements Document (PRD)

## 1. Project Overview
**Project Name:** Hijappy E-commerce Platform  
**Platform URL (Live):** [https://hijappy-e-commerce.vercel.app/](https://hijappy-e-commerce.vercel.app/)  
**Description:** Hijappy is a comprehensive, modern, and high-performance full-stack e-commerce platform designed to offer a seamless shopping experience for users while providing an integrated, powerful admin dashboard for product and order management.

## 2. Objectives & Goals
- Provide an intuitive and dynamic shopping experience with multilingual support (Arabic and English).
- Offer robust product categorization, rich media integration, and interactive user interfaces.
- Enable smooth checkout and order submission flows that cater to local requirements (e.g., WhatsApp integration, lead form submissions).
- Deliver a secure and fully-featured Admin Dashboard for managing the catalog, stock, and customer orders.
- Maintain high performance and clean code architecture using modern technologies.

## 3. Tech Stack
### **Frontend (Client)**
- **Framework & Build:** React 19, TypeScript, Vite
- **Styling:** Tailwind CSS, Framer Motion (Animations), Lucide React (Icons)
- **State Management:** React Context API (Authentication, Shopping Cart)
- **Routing:** React Router v7
- **Internationalization:** i18next & react-i18next

### **Backend (Server)**
- **Runtime & Framework:** Node.js, Express
- **Language:** TypeScript
- **Database & ORM:** PostgreSQL (Hosted on Neon), Prisma ORM
- **Validation:** Zod
- **Authentication & Security:** JWT (JSON Web Tokens), bcryptjs, CORS
- **Media Storage:** Cloudinary & Multer (Image upload handling)

## 4. Key Features & Requirements
### 4.1. User/Customer Features
- **Multilingual Support:** Users can seamlessly switch between English and Arabic.
- **Product Browsing:** 
  - View products by category.
  - View detailed product pages (images, description, price, available colors, stock status).
- **Shopping Cart:** Add, update quantities, or remove products from the cart easily.
- **Checkout Process:** 
  - Submit order details via a "Lead Form".
  - Capture essential info (Name, Address, Phone, WhatsApp).
  - Snapshot the product details at the time of purchase.

### 4.2. Admin Features (Dashboard)
- **Authentication:** Secure login using JWT.
- **Category Management:** Create, view, update, and delete product categories.
- **Product Management:** Add new products with rich text descriptions, images (uploaded to Cloudinary), color variants, price, and stock levels. Set featured products.
- **Order Management:** View incoming orders, check customer details, update order status (PENDING, CONFIRMED, CANCELLED), and add internal admin notes.

## 5. System Architecture
The application follows a client-server architectural pattern.
- **Client (`/client`):** A Single Page Application (SPA) providing the user interface and admin dashboard. Communicates with the server via RESTful APIs using `axios`.
- **Server (`/server`):** A REST API providing business logic, validation, authentication, and database interaction. Serves endpoints for products, categories, orders, and authentication.

## 6. Database Schema (High-Level)
The database structure relies on three main models linked via Prisma:
- **Category Model:** `id`, `name`, `slug`, `createdAt`
- **Product Model:** `id`, `name`, `slug`, `description`, `price`, `images` (array), `colors` (array), `stock`, `featured`, `categoryId` (relation), `createdAt`, `updatedAt`
- **Order Model:** `id`, `customerName`, `address`, `whatsapp`, `phone`, `productName`, `quantity`, `productId` (relation), `status` (Enum: PENDING, CONFIRMED, CANCELLED), `notes`, `createdAt`, `updatedAt`

## 7. Setup & Installation
### Local Development
1. Clone the repository.
2. Install dependencies for the server: `cd server && npm install`
3. Install dependencies for the client: `cd client && npm install`
4. Configure environment variables for both client and server based on `.env.example`.
5. Run database migrations: `cd server && npx prisma generate && npx prisma migrate dev`
6. Start development servers:
   - Server: `npm run dev`
   - Client: `npm run dev`

## 8. Future Enhancements (Roadmap)
- Integration with external payment gateways (e.g., Stripe, PayPal, or local providers).
- Customer accounts and order history tracking.
- Reviews and ratings for products.
- Advanced filtering and sorting options on the product listing page.
- Admin dashboard analytics (sales, traffic, conversion rates).
