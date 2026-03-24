import express from "express";
import snap from "../config/midtrans.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { order_id, total, customer_name } = req.body;

  if (!order_id || !total) {
    return res.status(400).json({ message: "Data pembayaran tidak lengkap" });
  }

  const parameter = {
    transaction_details: {
      order_id: `ORDER-${order_id}-${Date.now()}`,
      gross_amount: total,
    },
    customer_details: {
      first_name: customer_name,
    },
    enabled_payments: ["qris", "gopay", "shopeepay", "ovo"],
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Gagal membuat transaksi Midtrans" });
  }
});

export default router;
