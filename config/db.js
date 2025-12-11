require('dotenv').config();
const mysql = require('mysql2/promise');

let pool;

async function initDB() {
  try {
    pool = mysql.createPool({
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: Number(process.env.DB_PORT),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });

    const connection = await pool.getConnection();
    console.log("Database is connected");
    connection.release();

  } catch (err) {
    console.error("Database connection failed:", err.message);
  }
}

initDB();

module.exports = pool;
