import express from "express";
import upload from "../middleware/upload.js";
import {
  createProducts,
  getProducts,
  updateProduct,
  updateProductStatus
} from "../controllers/product.controller.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/", upload.single("image"), createProducts);
router.put("/:id", upload.single("image"), updateProduct);
router.put("/:id/status", updateProductStatus);

export default router;
