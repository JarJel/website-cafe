import express from "express"
import cors from "cors"
import categoryRoutes from "./backend/routes/category.routes.js"
import productRoutes from "./backend/routes/product.routes.js"
import orderRoutes from "./backend/routes/order.routes.js";
import midtransRoutes from "./backend/routes/midtrans.routes.js";
import paymentRoutes from "./backend/routes/payment.routes.js";
import dotenv from "dotenv";
dotenv.config();


const app = express()

app.use(cors())
app.use(express.json())

app.use("/api/categories", categoryRoutes)
app.use("/api/products", productRoutes)
app.use("/uploads", express.static("backend/uploads"))
app.use("/api/orders", orderRoutes);
app.use("/api/payment", paymentRoutes)
app.use("/api/midtrans", midtransRoutes);



app.listen(5000, () => {
    console.log("Server running on port 5000")
})