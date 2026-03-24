import db from "../config/db.js"

export const getCategories = (req, res) => {
    const sql = "SELECT category_id, name FROM categories"
    db.query(sql, (err, result) => {
        if(err) return res.status(500).json(err)
            res.json(result)
    })
}