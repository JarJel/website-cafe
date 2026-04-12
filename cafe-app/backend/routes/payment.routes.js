import express from "express";
import snap from "../config/midtrans.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { order_id, total, customer_name } = req.body;

  console.log("Server Key:", process.env.MIDTRANS_SERVER_KEY ? "✅ Ada" : "❌ UNDEFINED");
  console.log("Body:", req.body);

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
    enabled_payments: ["gopay", "shopeepay", "other_qris"],
    credit_card: {
      secure: true,
    },
  };

  try {
    const transaction = await snap.createTransaction(parameter);

    res.json({
      token: transaction.token,
      redirect_url: transaction.redirect_url,
    });
  } catch (err) {
    // Tambah ini untuk lihat error detail
    console.error("=== MIDTRANS ERROR ===");
    console.error("Message:", err.message);
    console.error("API Response:", JSON.stringify(err.ApiResponse, null, 2));
    console.error("HTTP Status:", err.httpStatusCode);

    res.status(500).json({
      message: "Gagal membuat transaksi Midtrans",
      detail: err.ApiResponse || err.message, // sementara untuk debug
    });
  }
});

export default router;
