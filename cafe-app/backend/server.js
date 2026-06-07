import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import categoryRoutes from "./routes/category.routes.js";
import productRoutes from "./routes/product.routes.js";
import orderRoutes from "./routes/order.routes.js";
import midtransRoutes from "./routes/midtrans.routes.js";
import paymentRoutes from "./routes/payment.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Konfigurasi CORS (Saat ini mengizinkan semua domain. Sangat aman untuk awal deployment)
app.use(cors());
app.use(express.json());

// API routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);

// PERBAIKAN: Menggunakan __dirname agar Railway bisa menemukan folder uploads dengan akurat
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/midtrans", midtransRoutes);

// Bagian Serve frontend sudah dihapus karena diurus oleh Netlify

const PORT = process.env.PORT || 5000;

// Menambahkan '0.0.0.0' agar Railway bisa melakukan bind port dengan benar dari luar container
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port ${PORT}`);
});