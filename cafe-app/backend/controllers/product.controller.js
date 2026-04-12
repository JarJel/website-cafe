import db from "../config/db.js";

/* ================= GET ALL PRODUCTS ================= */
export const getProducts = async (req, res) => {
  const sql = `
    SELECT p.*, c.name AS category_name
    FROM products p
    JOIN categories c ON p.category_id = c.category_id
    ORDER BY p.product_id DESC
  `;

  try {
    // Gunakan await dan ambil [rows]
    const [rows] = await db.query(sql);
    res.json(rows);
  } catch (err) {
    console.error("GET PRODUCTS ERROR:", err);
    res.status(500).json({ message: "Gagal mengambil produk", error: err.message });
  }
};

/* ================= CREATE PRODUCT ================= */
export const createProducts = async (req, res) => {
  const { category_id, name, description, price, status } = req.body;
  const image = req.file?.filename;

  const sql = `
    INSERT INTO products 
    (category_id, name, description, price, image, status)
    VALUES (?, ?, ?, ?, ?, ?)
  `;

  try {
    const [result] = await db.query(sql, [category_id, name, description, price, image, status]);
    
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
  } catch (err) {
    console.error("CREATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Gagal membuat produk", error: err.message });
  }
};

/* ================= UPDATE STATUS ================= */
export const updateProductStatus = async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const sql = `UPDATE products SET status = ? WHERE product_id = ?`;

  try {
    await db.query(sql, [status, id]);
    res.json({ message: "Status updated" });
  } catch (err) {
    console.error("UPDATE STATUS ERROR:", err);
    res.status(500).json({ message: "Gagal update status", error: err.message });
  }
};

/* ================= UPDATE PRODUCT (EDIT) ================= */
export const updateProduct = async (req, res) => {
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

  try {
    await db.query(sql, values);
    res.json({ message: "Product updated successfully" });
  } catch (err) {
    console.error("UPDATE PRODUCT ERROR:", err);
    res.status(500).json({ message: "Gagal update produk", error: err.message });
  }
};