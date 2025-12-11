// controllers/authController.js
//require('dotenv').config();
require('dotenv').config({ quiet: true });
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS);
const JWT_SECRET = process.env.JWT_SECRET;

async function register(req, res, next) {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password)
      return res.status(400).json({ message: 'Missing fields' });

    const hashed = await bcrypt.hash(password, SALT_ROUNDS);

    const sql = `INSERT INTO users (name, email, password, role)
                 VALUES (?, ?, ?, ?)`;

    const [result] = await pool.execute(sql, [
      name,
      email,
      hashed,
      role || 'reader'
    ]);

    res.status(201).json({
      message: 'User created',
      
    });
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY')
      return res.status(400).json({ message: 'Email already exists' });

    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;

    const [rows] = await pool.execute(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    const user = rows[0];

    if (!user)
      return res.status(400).json({ message: 'Invalid credentials' });

    const ok = await bcrypt.compare(password, user.password);
    if (!ok)
      return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign(
      { id: user.id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    res.json({ message: 'Logged in', token });
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login };
