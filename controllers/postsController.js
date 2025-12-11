const pool = require('../config/db');
const slugify = require('../utils/slugify');

module.exports = {

  getPublishedPosts: async (req, res, next) => {
    try {
      const { category, tag, author } = req.query;

      let sql = `
        SELECT p.*, u.name AS author_name, c.name AS category_name, t.name AS tag_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN tags t ON p.tag_id = t.id
        WHERE p.status = 'published'
      `;

      const params = [];

      if (category) { sql += " AND c.name = ?"; params.push(category); }
      if (tag)      { sql += " AND t.name = ?"; params.push(tag); }
      if (author)   { sql += " AND u.name = ?"; params.push(author); }

      sql += " ORDER BY p.created_at DESC";

      const [rows] = await pool.execute(sql, params);
      res.json(rows);

    } catch (err) { next(err); }
  },

  getPostBySlug: async (req, res, next) => {
    try {
      const { slug } = req.params;

      const sql = `
        SELECT p.*, u.name AS author_name, c.name AS category_name, t.name AS tag_name
        FROM posts p
        LEFT JOIN users u ON p.author_id = u.id
        LEFT JOIN categories c ON p.category_id = c.id
        LEFT JOIN tags t ON p.tag_id = t.id
        WHERE p.slug = ? AND p.status = 'published'
      `;

      const [rows] = await pool.execute(sql, [slug]);
      if (!rows[0]) return res.status(404).json({ message: "Post not found" });

      res.json(rows[0]);

    } catch (err) { next(err); }
  },

  createPost: async (req, res, next) => {
    try {
      const { title, content, status, category_id, tag_id } = req.body;
      const author_id = req.user.id;

      if (!title || !content)
        return res.status(400).json({ message: "Missing fields" });

      const slug = slugify(title);

      const sql = `
        INSERT INTO posts (title, slug, content, status, category_id, tag_id, author_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `;

      const [result] = await pool.execute(sql, [
        title,
        slug,
        content,
        status || "draft",
        category_id || null,
        tag_id || null,
        author_id
      ]);

      res.status(201).json({ message: "Post created", postId: result.insertId });

    } catch (err) {
      if (err.code === "ER_DUP_ENTRY")
        return res.status(400).json({ message: "Slug conflict. Try a different title." });
      next(err);
    }
  },

  updatePost: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { title, content, status, category_id, tag_id } = req.body;
      const user = req.user;

      const [rows] = await pool.execute("SELECT * FROM posts WHERE id=?", [id]);
      if (!rows[0]) return res.status(404).json({ message: "Post not found" });

      const post = rows[0];

      if (user.role === 'author' && post.author_id !== user.id)
        return res.status(403).json({ message: "Not allowed" });

      const newSlug = title ? slugify(title) : post.slug;

      const sql = `
        UPDATE posts
        SET title=?, slug=?, content=?, status=?, category_id=?, tag_id=?
        WHERE id=?
      `;

      await pool.execute(sql, [
        title || post.title,
        newSlug,
        content || post.content,
        status || post.status,
        category_id ?? post.category_id,
        tag_id ?? post.tag_id,
        id
      ]);

      res.json({ message: "Post updated" });

    } catch (err) { next(err); }
  },

  deletePost: async (req, res, next) => {
    try {
      const { id } = req.params;
      const user = req.user;

      const [rows] = await pool.execute("SELECT * FROM posts WHERE id=?", [id]);
      if (!rows[0]) return res.status(404).json({ message: "Post not found" });

      const post = rows[0];

      if (user.role === 'author' && post.author_id !== user.id)
        return res.status(403).json({ message: "Not allowed" });

      await pool.execute("DELETE FROM posts WHERE id=?", [id]);

      res.json({ message: "Post deleted" });
    } catch (err) { next(err); }
  }
};
