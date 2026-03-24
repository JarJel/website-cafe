import db from "../config/db.js";

export const createOrder = (req, res) => {
  const { customer_name, table_number, items } = req.body;

  if (!customer_name || !table_number || !items?.length) {
    return res.status(400).json({ message: "Data tidak lengkap" });
  }

  const total_price = items.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // 1️⃣ simpan ke table orders
  const orderSql = `
    INSERT INTO orders (customer_name, table_number, total_price, order_status)
    VALUES (?, ?, ?, 'pending')
  `;

  db.query(
    orderSql,
    [customer_name, table_number, total_price],
    (err, orderResult) => {
      if (err) return res.status(500).json(err);

      const orderId = orderResult.insertId;

      // 2️⃣ simpan ke order_details
      const detailSql = `
        INSERT INTO order_details (order_id, product_id, quantity, price)
        VALUES ?
      `;

      const values = items.map((item) => [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
      ]);

      db.query(detailSql, [values], (err) => {
        if (err) return res.status(500).json(err);

        res.status(201).json({
          message: "Order berhasil dibuat",
          order_id: orderId,
        });
      });
    }
  );
};
