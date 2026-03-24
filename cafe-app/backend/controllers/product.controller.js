import db from "../config/db.js";

/* ================= GET ================= */
export const getProducts = (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    ORDER BY p.product_id DESC
  `;

  db.query(sql, (err, result) => {
    if (err) return res.status(500).json(err);
    res.json(result);
  });
};

/* ================= CREATE ================= */
export const createProducts = (req, res) => {
  const { category_id, name, description, price, status } = req.body;
  const image = req.file?.filename;

  const sql = `
    INSERT INTO products 
    (category_id, name, description, price, image, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sql,
    [category_id, name, description, price, image, status],
    (err, result) => {
      if (err) return res.status(500).json(err);

      res.json({
        message: "Product created",
        product: {
          product_id: result.insertId,
          category_id,
          name,
          description,
          price,
          image,
          status,
        },
      });
    }
  );
};

/* ================= UPDATE STATUS ================= */
export const updateProductStatus = (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE products SET status = ? WHERE product_id = ?`;

  db.query(sql, [status, id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Status updated" });
  });
};

/* ================= UPDATE PRODUCT (EDIT) ================= */
export const updateProduct = (req, res) => {
  const { id } = req.params;
  const { category_id, name, description, price, status } = req.body;

  let sql = `
    UPDATE products 
    SET category_id = ?, name = ?, description = ?, price = ?, status = ?
  `;

  const values = [category_id, name, description, price, status];

  if (req.file) {
    sql += `, image = ?`;
    values.push(req.file.filename);
  }

  sql += ` WHERE product_id = ?`;
  values.push(id);

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json(err);
    res.json({ message: "Product updated successfully" });
  });
};
