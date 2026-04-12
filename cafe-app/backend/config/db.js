import mysql from "mysql2/promise"; // Tambahkan /promise di sini
import dotenv from "dotenv";
dotenv.config();

const db = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "", // Sesuaikan password database Anda
  database: "cafe_db", // Ganti dengan nama database Anda
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Cek koneksi
console.log("Database Pool initialized...");

export default db;