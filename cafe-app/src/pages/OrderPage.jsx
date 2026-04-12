import { useLocation, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react"; // Tambahkan useEffect
import "../Order.css";
import api from "../services/api";

function OrderPage() {
  const { state } = useLocation();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [table, setTable] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [orderType, setOrderType] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");

  // --- TAMBAHKAN USEEFFECT DI SINI ---
  useEffect(() => {
    // Cek apakah script sudah ada
    const midtransScriptUrl = "https://app.sandbox.midtrans.com/snap/snap.js";
    let script = document.querySelector(`script[src="${midtransScriptUrl}"]`);

    if (!script) {
      script = document.createElement("script");
      script.src = midtransScriptUrl;
      // Ganti dengan Client Key Sandbox Anda
      script.setAttribute("data-client-key", "Mid-client-PwimocAQvQkhz8tu"); 
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      // Cleanup (opsional): bisa menghapus script saat komponen unmount
      // document.body.removeChild(script); 
    };
  }, []);

  if (!state) return <p>Product not found</p>;

  let cartItems = [];
  if (Array.isArray(state.cartItems)) {
    cartItems = state.cartItems;
  } else if (state.product_id) {
    cartItems = [{ ...state, quantity: 1 }];
  }

  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0,
  );

  const handleSubmit = async () => {
    const tableNum = parseInt(table)
    if (!name || !paymentMethod || !orderType || cartItems.length === 0) {
      alert("Lengkapi data order");
      return;
    }

    if (orderType === "dine_in" && !table) {
      if(!table) {
        alert("Nomor Meja Wajib Diisi Untuk Dine in");
        return;
      }
    }

    if (isNaN(tableNum) || tableNum < 1 || tableNum >25) {
      alert("Nomor meja tidak terdaftar");
      return;
    }

    setIsLoading(true);
    setStatusMessage("Memproses pesanan anda...");

    try {
      // 1. Kirim Order ke Backend
      const orderRes = await api.post("/orders", {
        customer_name: name,
        table_number: orderType === "dine_in" ? parseInt(table) : null,
        payment_method: paymentMethod,
        order_type: orderType,
        items: cartItems.map((item) => ({
          product_id: item.product_id,
          quantity: item.quantity,
          price: item.price,
        })),
      });

      const orderId = orderRes.data.order_id || orderRes.data.id;

      // --- LOGIK PEMBAYARAN CASH ---
      if (paymentMethod === "cash") {
        setStatusMessage("Pesanan Berhasil! Silakan bayar di kasir.");
        setTimeout(() => navigate("/"), 3000);
        return;
      }

      // --- LOGIK PEMBAYARAN ONLINE (MIDTRANS) ---
      if (paymentMethod === "midtrans") {
        const payRes = await api.post("/payment", {
          order_id: orderId,
          total: totalPrice,
          customer_name: name,
        });

        // Tunggu sebentar sampai window.snap benar-benar siap
        if (window.snap) {
          window.snap.pay(payRes.data.token, {
            onSuccess: function () {
              setStatusMessage("Pembayaran Berhasil! Mengalihkan...");
              setTimeout(() => navigate("/"), 2000);
            },
            onPending: function () {
              setStatusMessage("Menunggu pembayaran anda...");
            },
            onError: function () {
              setStatusMessage("Pembayaran Gagal. Silakan coba lagi.");
              setIsLoading(false);
            },
            onClose: function () {
              setIsLoading(false);
            },
          });
        } else {
          throw new Error("Sistem pembayaran (Snap) belum siap. Silakan coba lagi.");
        }
      }
    } catch (err) {
      console.error(err);
      const errorMsg = err.response?.data?.message || "Gagal memproses order.";
      setStatusMessage(errorMsg);
      setTimeout(() => setIsLoading(false), 2000);
    }
  };

  return (
    <div className="order-page">
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="loading-overlay">
          <div className="loading-box">
            <div className="spinner"></div>
            <p>{statusMessage}</p>
          </div>
        </div>
      )}

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
        <div className="order-type">
          <p>Tipe Pesanan</p>
          <label className={orderType === "dine_in" ? "selected" : ""}>
            <input
              type="radio"
              value="dine_in"
              checked={orderType === "dine_in"}
              onChange={(e) => setOrderType(e.target.value)}
              disabled={isLoading}
            />
            Dine In
          </label>
          <label className={orderType === "takeaway" ? "selected" : ""}>
            <input
              type="radio"
              value="takeaway"
              checked={orderType === "takeaway"}
              onChange={(e) => setOrderType(e.target.value)}
              disabled={isLoading}
            />
            Takeaway
          </label>
        </div>

        <input
          placeholder="Nama Pemesan"
          value={name}
          onChange={(e) => setName(e.target.value)}
          disabled={isLoading}
        />

        {orderType === "dine_in" && (
          <input
            placeholder="No Meja 1-25"
            type="number"
            min="1"
            max="25"
            value={table}
            onChange={(e) => setTable(e.target.value)}
            disabled={isLoading}
          />
        )}

        <div className="payment-method">
          <p>Metode Pembayaran</p>
          <label>
            <input
              type="radio"
              name="payment"
              value="cash"
              checked={paymentMethod === "cash"}
              onChange={(e) => setPaymentMethod(e.target.value)}
              disabled={isLoading}
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
              disabled={isLoading}
            />
            Bayar Online (QRIS / E-Wallet)
          </label>
        </div>

        <button
          className={`btn-confirm ${isLoading ? "loading" : ""}`}
          onClick={handleSubmit}
          disabled={isLoading}
        >
          {isLoading ? "Memproses..." : "Confirm Order"}
        </button>

        <button
          className="btn-add-more"
          onClick={() =>
            navigate("/", { state: { reopenCart: true, cartItems } })
          }
          disabled={isLoading}
        >
          Tambah Menu Lagi
        </button>
      </div>
    </div>
  );
}

export default OrderPage;