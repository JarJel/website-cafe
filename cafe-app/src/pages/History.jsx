import { useEffect, useState } from "react";
import api from "../services/api";
import "../history.css";

export default function History() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/orders/history");
        setOrders(res.data);
      } catch (err) {
        console.error("Gagal load history", err);
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  if (loading) return <p>Loading history...</p>;

  return (
    <div className="history-container">
      <h3>History Orders</h3>

      {orders.length === 0 && (
        <p className="history-empty">Belum ada riwayat order</p>
      )}

      <div className="history-list">
        {orders.map((order) => (
          <div key={order.order_id} className="history-card">
            <div className="history-header">
              <h4>Meja {order.table_number}</h4>
              <span className="status completed">completed</span>
            </div>

            <p>
              <b>Nama:</b> {order.customer_name}
            </p>

            <p>
              <b>Payment:</b>{" "}
              <span className="payment-method">
                {order.payment_method?.toUpperCase()}
              </span>
            </p>

            <p className="history-total">
              Total: Rp {Number(order.total_price).toLocaleString("id-ID")}
            </p>

            <p className="history-date">
              {new Date(order.order_date).toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
