import db from "../config/db.js"

export const getCategories = async (req, res) => {
  try {
    const sql = "SELECT category_id, name FROM categories"
    const [result] = await db.query(sql)

    res.json(result)
  } catch (err) {
    console.error("DB ERROR:", err)
    res.status(500).json({ message: err.message })
  }
}