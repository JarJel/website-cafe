import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import "../Order.css";
import api from "../services/api";

function OrderPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [table, setTable] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  // Bisa single product atau array cartItems
  let cartItems = [];

  if (!state) return <p>Product not found</p>;

  if (Array.isArray(state.cartItems)) {
    cartItems = state.cartItems;
  } else if (state.product_id) {
    cartItems = [{ ...state, quantity: 1 }]; // single product dari Order Now
  }

  // Hitung total harga
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleSubmit = async () => {
    if (!name || !table || !paymentMethod || cartItems.length === 0) {
      alert("Lengkapi data order & pembayaran");
      return;
    }

    try {
      // 1. Simpan order dulu
      const orderRes = await api.post("/orders", {
        customer_name: name,
        table_number: table,
        payment_method: paymentMethod,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      const orderId = orderRes.data.order_id;

      // 2. Jika CASH
      if (paymentMethod === "cash") {
        alert("Order berhasil! Silakan bayar di kasir.");
        navigate("/");
        return;
      }

      // 3. Jika MIDTRANS
      if (paymentMethod === "midtrans") {
        const payRes = await api.post("/payment", {
          order_id: orderId,
          total: totalPrice,
          customer_name: name,
        });

        console.log("Snap:", window.snap);
        console.log("Token:", payRes.data.token);

        window.snap.pay(payRes.data.token, {
          onSuccess: function () {
            alert("Pembayaran berhasil!");
            navigate("/");
          },
          onPending: function () {
            alert("Menunggu pembayaran");
          },
          onError: function () {
            alert("Pembayaran gagal");
          },
        });
      }
    } catch (err) {
      console.error(err);
      alert("Gagal memproses order");
    }
  };

  return (
    <div className="order-page">
      <h2>Konfirmasi Pesanan</h2>

      <div className="order-summary">
        {cartItems.map((item, idx) => (
          <div key={idx} className="summary-item">
            <span>
              {item.name || item.product_name} x {item.quantity}
            </span>
            <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
          </div>
        ))}
        <hr />
        <div className="total-row">
          <strong>Total:</strong>
          <strong>Rp {totalPrice.toLocaleString()}</strong>
        </div>
      </div>

      <div className="order-form">
        <input
          placeholder="Nama Pemesan"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          placeholder="No Meja"
          type="number"
          value={table}
          onChange={(e) => setTable(e.target.value)}
        />

        <div className="payment-method">
          <p>Metode Pembayaran</p>

          <label>
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Bayar di Kasir
          </label>

          <label>
            <input
              type="radio"
              name="payment"
              value="midtrans"
              checked={paymentMethod === "midtrans"}
              onChange={(e) => setPaymentMethod(e.target.value)}
            />
            Bayar Online (QRIS / E-Wallet)
          </label>
        </div>

        <button onClick={handleSubmit}>Confirm Order</button>
        <button onClick={() => navigate("/")}>Tambah Menu Lagi</button>
      </div>
    </div>
  );
}

export default OrderPage;
