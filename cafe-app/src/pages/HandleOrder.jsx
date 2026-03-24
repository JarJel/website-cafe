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

      // order terbaru di atas
      const sortedOrders = [...res.data].reverse();
      setOrders(sortedOrders);
    } catch (err) {
      console.error("Gagal load orders:", err);
    }
  };

  useEffect(() => {
    loadOrders();
  }, []);

  // ===== OPEN MODAL =====
  const handlePayClick = (order) => {
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

      // tutup modal
      closeModal();

      // hapus dari list pending
      setOrders((prev) => prev.filter((o) => o.order_id !== orderId));
    } catch (err) {
      console.error("Gagal menyelesaikan order:", err);
      alert("Gagal menyelesaikan order");
    }
  };

  // ===== FORMAT PAYMENT =====
  const formatPaymentMethod = (method) => {
    if (!method) return "-";
    return method.toUpperCase();
  };

  return (
    <div className="handle-orders">
      <h3>Incoming Orders</h3>

      {orders.length === 0 && <p>Belum ada order</p>}

      <div className="order-list">
        {orders.map((order) => (
          <div key={order.order_id} className="order-card">
            <div className="order-header">
              <h4>Meja {order.table_number}</h4>
              <span className={`status ${order.order_status}`}>
                {order.order_status}
              </span>
            </div>

            <p>
              <b>Nama:</b> {order.customer_name}
            </p>

            <p>
              <b>Payment:</b>{" "}
              <span className="payment-method card">
                {formatPaymentMethod(order.payment_method)}
              </span>
            </p>

            <div className="order-items">
              <b>Pesanan:</b>
              {order.items?.length ? (
                order.items.map((item, i) => (
                  <p key={i}>
                    • {item.product_name} x{item.quantity}
                  </p>
                ))
              ) : (
                <p>-</p>
              )}
            </div>

            <p className="date">
              {new Date(order.order_date).toLocaleString("id-ID")}
            </p>

            <p>
              <b>Total:</b> Rp{" "}
              {Number(order.total_price).toLocaleString("id-ID")}
            </p>

            <button
              className="btn-pay"
              onClick={() => handlePayClick(order)}
            >
              Proses Pembayaran
            </button>
          </div>
        ))}
      </div>

      {/* ===== MODAL ===== */}
      {showModal && selectedOrder && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Detail Pembayaran</h3>

            <div className="modal-info">
              <p>
                <b>Meja:</b> {selectedOrder.table_number}
              </p>
              <p>
                <b>Nama:</b> {selectedOrder.customer_name}
              </p>
              <p>
                <b>Payment Method:</b>{" "}
                <span className="payment-method highlight">
                  {formatPaymentMethod(selectedOrder.payment_method)}
                </span>
              </p>
            </div>

            <div className="modal-items">
              <b>Pesanan:</b>
              {selectedOrder.items.map((item, i) => (
                <div key={i} className="modal-item">
                  <span>
                    {item.product_name} x{item.quantity}
                  </span>
                  <span>
                    Rp{" "}
                    {(item.price * item.quantity).toLocaleString("id-ID")}
                  </span>
                </div>
              ))}
            </div>

            <hr />

            <div className="modal-total">
              <span>Total</span>
              <span>
                Rp{" "}
                {Number(selectedOrder.total_price).toLocaleString("id-ID")}
              </span>
            </div>

            <div className="modal-actions">
              <button className="btn-cancel" onClick={closeModal}>
                Batal
              </button>
              <button
                className="btn-finish"
                onClick={() => finishOrder(selectedOrder.order_id)}
              >
                Selesai
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
