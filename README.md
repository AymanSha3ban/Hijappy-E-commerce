# 🛍️ Hijappy E-commerce Platform

**Hijappy** هو منصة تجارة إلكترونية متكاملة (Full-stack) مصممة لتقديم تجربة تسوق سلسة وعصرية. المشروع يركز على الأداء العالي، واجهة مستخدم تفاعلية، ولوحة تحكم إدارية قوية لإدارة المنتجات والطلبات[cite: 1].

🌐 **رابط المعاينة المباشرة:** [https://hijappy-e-commerce.vercel.app/](https://hijappy-e-commerce.vercel.app/)

---

## 🚀 التقنيات المستخدمة (Tech Stack)

### **Frontend (Client)**
*   **React & Vite:** لضمان سرعة بناء وتطوير الواجهات[cite: 1].
*   **TypeScript:** لضمان كتابة كود برمجى متين وتقليل الأخطاء[cite: 1].
*   **Tailwind CSS:** لتصميم واجهات مستجيبة (Responsive) وجذابة[cite: 1].
*   **Context API:** لإدارة حالة المستخدم (Authentication) والسلة[cite: 1].
*   **i18next:** لدعم تعدد اللغات (العربية والإنجليزية)[cite: 1].

### **Backend (Server)**
*   **Node.js & Express:** لبناء خادم API سريع ومستقر[cite: 1].
*   **Prisma ORM:** للتعامل الاحترافي مع قاعدة البيانات[cite: 1].
*   **PostgreSQL:** قاعدة البيانات المستخدمة والمستضافة على منصة **Neon**[cite: 1].
*   **Cloudinary:** لإدارة ورفع صور المنتجات بكفاءة[cite: 1].
*   **JWT (JSON Web Tokens):** لتأمين عمليات تسجيل الدخول وحماية الروابط[cite: 1].

---

## ✨ المميزات الرئيسية

*   **تعدد اللغات:** واجهة كاملة تدعم اللغتين العربية والإنجليزية[cite: 1].
*   **إدارة المنتجات:** عرض المنتجات حسب التصنيفات مع ميزة عرض التفاصيل بدقة[cite: 1].
*   **لوحة تحكم الأدمن (Admin Dashboard):** لإضافة وتعديل وحذف المنتجات والتصنيفات، ومتابعة الطلبات[cite: 1].
*   **نظام السلة (Shopping Cart):** تجربة سلسة لإضافة وتعديل كميات المنتجات[cite: 1].
*   **تأمين البيانات:** حماية صفحات الأدمن وصلاحيات المستخدمين باستخدام Middleware[cite: 1].

---

## 🛠️ هيكل المشروع (Project Structure)

المشروع مقسم إلى جزئين رئيسيين لضمان سهولة الإدارة والنشر:
*   `client/`: يحتوي على كود React وواجهة المستخدم[cite: 1].
*   `server/`: يحتوي على كود Express، الـ API، والـ Prisma Schema[cite: 1].

---

## 📦 خطوات التشغيل محلياً

1. قم بعمل **Clone** للمستودع:
   ```bash
   git clone [https://github.com/AymanSha3ban/Hijappy-E-commerce.git](https://github.com/AymanSha3ban/Hijappy-E-commerce.git)
   # تثبيت مكتبات السيرفر
cd server && npm install

# تثبيت مكتبات الفرونت
cd ../client && npm install
3. قم بإعداد ملفات الـ `.env` بناءً على ملفات الـ `.env.example` المرفقة[cite: 1].
4. قم بتشغيل قاعدة البيانات باستخدام Prisma:
   ```bash
   npx prisma generate
   npx prisma migrate dev
   # لتشغيل السيرفر
npm run dev (inside server)

# لتشغيل الفرونت
npm run dev (inside client)
```
 👷 مبرمج المشروع
أيمن شعبان : مهندس كمبيوتر ومهندس سوفتوير 
