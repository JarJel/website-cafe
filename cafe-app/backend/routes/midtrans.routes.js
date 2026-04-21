import express from "express";
import db from "../config/db.js";

const router = express.Router();

router.post("/notification", async (req, res) => {
  try {
    const notification = req.body;
    const orderIdFull = notification.order_id; // Contoh: "ORDER-15-1712456"
    const transactionStatus = notification.transaction_status;

    if (!orderIdFull) {
      console.error("❌ order_id tidak ada dari Midtrans");
      return res.status(400).send("Invalid payload");
    }

    // Ambil ID angka saja
    const realId = orderIdFull.split("-")[1];

    console.log(`--- Webhook Midtrans Datang ---`);
    console.log(`Order ID: ${realId}, Status: ${transactionStatus}`);

    let status = "pending";
    if (transactionStatus === "settlement" || transactionStatus === "capture") {
      status = "paid";
    } else if (["cancel", "deny", "expire"].includes(transactionStatus)) {
      status = "failed";
    }

    // Eksekusi Update
    const [result] = await db.query(
      "UPDATE orders SET order_status = ? WHERE order_id = ?",
      [status, realId],
    );

    if (result.affectedRows > 0) {
      console.log(`✅ Sukses Update DB: Order ${realId} -> ${status}`);
    } else {
      console.log(`⚠️ Gagal Update: Order ID ${realId} tidak ditemukan di DB`);
    }

    res.status(200).send("OK");
  } catch (err) {
    console.error("❌ WEBHOOK ERROR:", err.message);
    res.status(500).send("Internal Server Error");
  }
});

export default router;
