// controllers/tagsController.js
const pool = require('../config/db');

module.exports = {
  getAll: async (req, res, next) => {
    try {
      const [rows] = await pool.execute("SELECT * FROM tags ORDER BY id DESC");
      res.json(rows);
    } catch (err) { next(err); }
  },

  create: async (req, res, next) => {
    try {
      const { name } = req.body;
      if (!name) return res.status(400).json({ message: "Name required" });

      const sql = "INSERT INTO tags (name) VALUES (?)";
      await pool.execute(sql, [name]);

      res.status(201).json({ message: "Tag created" });
    } catch (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "Tag already exists" });
      next(err);
    }
  },

  update: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { name } = req.body;

      const sql = "UPDATE tags SET name=? WHERE id=?";
      const [result] = await pool.execute(sql, [name, id]);

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Tag not found" });

      res.json({ message: "Tag updated" });
    } catch (err) { next(err); }
  },

  delete: async (req, res, next) => {
    try {
      const { id } = req.params;

      const sql = "DELETE FROM tags WHERE id=?";
      const [result] = await pool.execute(sql, [id]);

      if (result.affectedRows === 0)
        return res.status(404).json({ message: "Tag not found" });

      res.json({ message: "Tag deleted" });
    } catch (err) { next(err); }
  }
};
