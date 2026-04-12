// midtrans.js — tambahkan dotenv langsung di sini juga
import dotenv from "dotenv";
dotenv.config();
import midtransClient from "midtrans-client";

console.log("isProduction:", false);
console.log("Server Key prefix:", process.env.MIDTRANS_SERVER_KEY?.substring(0, 15));

const snap = new midtransClient.Snap({
  isProduction: false,
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export default snap;