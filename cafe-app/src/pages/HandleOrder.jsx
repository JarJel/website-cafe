import { useEffect, useState } from "react";
import api from "../services/api";
import "../handleOrders.css";

export default function HandleOrders() {
  const [orders, setOrders] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState(null);

  // ===== LOAD ORDERS =====
  const loadOrders = async () => {
    try {
      const res = await api.get("/orders");

      // FILTER: Hanya ambil yang statusnya BUKAN 'completed'
      // Dengan begitu, yang sudah lunas & diklik selesai akan hilang otomatis
      const activeOrders = res.data.filter(
        (order) => order.order_status !== "completed",
      );

      const sortedOrders = [...activeOrders].reverse();
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Gagal load orders:", err);
    }
  };

  // ===== POLLING DENGAN USEEFFECT =====
  useEffect(() => {
    loadOrders(); // Load saat pertama kali component muncul

    // Polling setiap 3-5 detik (500ms atau 0.5 detik terlalu cepat,
    // disarankan minimal 3000ms agar tidak memberatkan server)
    const interval = setInterval(() => {
      loadOrders();
    }, 3000);

    // Membersihkan interval saat component ditutup
    return () => clearInterval(interval);
  }, []);

  // ===== OPEN MODAL =====
  const handlePayClick = (order) => {
    // Jika sudah lunas (online), admin bisa langsung klik selesaikan tanpa lewat modal cash
    if (order.order_status === "paid" || order.order_status === "settlement") {
      if (
        window.confirm("Pesanan sudah LUNAS via Online. Selesaikan pesanan?")
      ) {
        finishOrder(order.order_id);
      }
      return;
    }
    setSelectedOrder(order);
    setShowModal(true);
  };

  // ===== CLOSE MODAL =====
  const closeModal = () => {
    setShowModal(false);
    setSelectedOrder(null);
  };

  // ===== FINISH ORDER =====
  const finishOrder = async (orderId) => {
    if (!window.confirm("Selesaikan order ini?")) return;

    try {
      await api.put(`/orders/${orderId}/complete`);
      closeModal();
      // hapus dari list pending di UI
      setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
    } catch (err) {
      console.error("Gagal menyelesaikan order:", err);
      alert("Gagal menyelesaikan order");
    }
  };

  // ===== FORMATTING HELPERS =====
  const formatPaymentMethod = (method) => {
    if (!method) return "-";
    if (method.toLowerCase() === "midtrans") return "ONLINE (MIDTRANS)";
    return method.toUpperCase();
  };

  const getStatusLabel = (status) => {
    if (status === "paid" || status === "settlement") return "LUNAS";
    if (status === "pending") return "MENUNGGU";
    return status.toUpperCase();
  };

  const renderOrderHeader = (order) => {
    if (order.order_type === "takeaway") {
      return <span className="type-badge takeaway">TAKEAWAY</span>;
    }
    return <span>Meja {order.table_number || "?"}</span>;
  };

  return (
    <div className="handle-orders">
      <h3>Incoming Orders (Auto Refresh)</h3>

      {orders.length === 0 && <p>Belum ada order</p>}

      <div className="order-list">
        {orders.map((order) => (
          <div
            key={order.order_id}
            className={`order-card ${order.order_status}`}
          >
            <div className="order-header">
              <h4>{renderOrderHeader(order)}</h4>
              {/* Gunakan getStatusLabel agar lebih manusiawi */}
              <span className={`status-badge ${order.order_status}`}>
                {getStatusLabel(order.order_status)}
              </span>
            </div>

            <p>
              <b>Nama:</b> {order.customer_name}
            </p>

            <p>
              <b>Tipe:</b>{" "}
              {order.order_type === "dine_in" ? "Dine In" : "Takeaway"}
            </p>

            <p>
              <b>Payment:</b>{" "}
              <span className={`payment-method card ${order.payment_method}`}>
                {formatPaymentMethod(order.payment_method)}
              </span>
            </p>

            <div className="order-items">
              <b>Pesanan:</b>
              {order.items?.map((item, i) => (
                <p key={i}>
                  • {item.product_name} x{item.quantity}
                </p>
              ))}
            </div>

            <p className="total-price">
              <b>Total:</b> Rp{" "}
              {Number(order.total_price).toLocaleString("id-ID")}
            </p>

            {/* Tombol berubah warna jika status lunas */}
            <button
              className={`btn-pay ${order.order_status === "settlement" ? "lunas" : ""}`}
              onClick={() => handlePayClick(order)}
            >
              {order.order_status === "paid" ||
              order.order_status === "settlement"
                ? "Selesaikan Pesanan"
                : "Proses Pembayaran"}
            </button>
          </div>
        ))}
      </div>

      {/* ===== MODAL ===== */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Konfirmasi Pembayaran Cash</h3>

            <div className="modal-info">
              <p>
                <b>Nama:</b> {selectedOrder.customer_name}
              </p>
              <p>
                <b>Total Tagihan:</b> Rp{" "}
                {Number(selectedOrder.total_price).toLocaleString("id-ID")}
              </p>
              <p>
                Pastikan pelanggan sudah membayar di kasir sebelum menekan
                tombol Selesai.
              </p>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>
                Batal
              </button>
              <button
                className="btn-finish"
                onClick={() => finishOrder(selectedOrder.order_id)}
              >
                Selesai (Sudah Bayar)
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
