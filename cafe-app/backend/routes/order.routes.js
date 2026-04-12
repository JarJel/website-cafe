import express from "express";
import db from "../config/db.js";

const router = express.Router();

/**
 * ==========================
 * GET ALL ORDERS (KASIR)
 * ==========================
 */
router.get("/", async (req, res) => {
  const sql = `
    SELECT
      o.order_id,
      o.customer_name,
      o.table_number,
      o.payment_method,
      o.order_type,
      o.total_price,
      o.order_status,
      o.order_date,
      p.name AS product_name,
      od.quantity,
      od.price
    FROM orders o
    LEFT JOIN order_details od ON o.order_id = od.order_id
    LEFT JOIN products p ON od.product_id = p.product_id
    ORDER BY o.order_date DESC, o.order_id DESC
  `;

  try {
    const [rows] = await db.query(sql);
    const ordersMap = {};

    rows.forEach((row) => {
      if (!ordersMap[row.order_id]) {
        ordersMap[row.order_id] = {
          order_id: row.order_id,
          customer_name: row.customer_name,
          table_number: row.table_number,
          payment_method: row.payment_method,
          order_type: row.order_type,
          total_price: row.total_price,
          order_status: row.order_status,
          order_date: row.order_date,
          items: [],
        };
      }

      if (row.product_name) {
        ordersMap[row.order_id].items.push({
          product_name: row.product_name,
          quantity: row.quantity,
          price: row.price,
        });
      }
    });

    res.json(Object.values(ordersMap));
  } catch (err) {
    console.error("DB ERROR:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/**
 * ==========================
 * POST ORDER (PELANGGAN)
 * ==========================
 */
router.post("/", async (req, res) => {
  const { customer_name, table_number, payment_method, items, order_type } = req.body;

  // 1. Validasi Dasar
  if (!customer_name || !payment_method || !order_type || !items?.length) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  // 2. Validasi Khusus Dine In
  if (order_type === "dine_in" && !table_number) {
    return res.status(400).json({ message: "Nomor meja wajib untuk dine in" });
  }

  const totalPrice = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  try {
    // 3. Insert order
    const [orderResult] = await db.query(
      `
      INSERT INTO orders 
      (customer_name, table_number, payment_method, order_type, total_price, order_status)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [
        customer_name, 
        order_type === "dine_in" ? table_number : null,
        payment_method,
        order_type,
        totalPrice,
        "pending"
      ],
    );

    const orderId = orderResult.insertId;

    // 4. Insert item detail
    for (const item of items) {
      await db.query(
        `
        INSERT INTO order_details
        (order_id, product_id, quantity, price)
        VALUES (?, ?, ?, ?)
        `,
        [orderId, item.product_id, item.quantity, item.price],
      );
    }

    res.json({
      message: "Order berhasil",
      order_id: orderId,
    });
  } catch (err) {
    console.error("INSERT ORDER ERROR:", err);
    res.status(500).json({
      message: "Gagal menyimpan order",
      error: err.message,
    });
  }
});

/**
 * HISTORY ORDERS
 */
router.get("/history", async (req, res) => {
  const sql = `
    SELECT * FROM orders
    WHERE order_status = 'completed'
    ORDER BY completed_at DESC
  `;

  try {
    const [result] = await db.query(sql);
    res.json(result);
  } catch (err) {
    console.error("HISTORY ERROR:", err);
    res.status(500).json({ message: "Database error" });
  }
});

/**
 * UPDATE ORDER TO COMPLETED
 */
router.put("/:id/complete", async (req, res) => {
  const { id } = req.params;

  const sql = `
    UPDATE orders
    SET order_status = 'completed',
        completed_at = NOW()
    WHERE order_id = ?
  `;

  try {
    await db.query(sql, [id]);
    res.json({ message: "Order completed" });
  } catch (err) {
    console.error("UPDATE ERROR:", err);
    res.status(500).json({ message: "Gagal update status" });
  }
});

export default router;