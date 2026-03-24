import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.post("/notification", async (req, res) => {
  const notification = req.body;

  const orderId = notification.order_id;
  const transactionStatus = notification.transaction_status;

  let status = "pending";

  if (transactionStatus === "settlement") {
    status = "paid";
  } else if (
    transactionStatus === "cancel" ||
    transactionStatus === "expire"
  ) {
    status = "failed";
  }

  try {
    await db.query(
      "UPDATE orders SET status=? WHERE id=?",
      [status, orderId.split("-")[1]]
    );

    res.json({ message: "Notification processed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal update status order" });
  }
});

export default router;
