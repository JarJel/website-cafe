import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import categoryRoutes from "./backend/routes/category.routes.js";
import productRoutes from "./backend/routes/product.routes.js";
import orderRoutes from "./backend/routes/order.routes.js";
import midtransRoutes from "./backend/routes/midtrans.routes.js";
import paymentRoutes from "./backend/routes/payment.routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(cors());
app.use(express.json());

// API routes
app.use("/api/categories", categoryRoutes);
app.use("/api/products", productRoutes);
app.use("/uploads", express.static("backend/uploads"));
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/midtrans", midtransRoutes);

// ✅ Serve frontend
app.use(express.static(path.join(__dirname, "dist")));
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

app.listen(process.env.PORT || 5000, () => {
  console.log("Server running");
});