import midtransClient from "midtrans-client";

const snap = new midtransClient.Snap({
  isProduction: true, // Ubah dari false menjadi true [cite: 1]
  serverKey: process.env.MIDTRANS_SERVER_KEY, 
  clientKey: process.env.MIDTRANS_CLIENT_KEY,
});

export default snap; 