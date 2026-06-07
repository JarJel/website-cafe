import { useEffect, useMemo, useState } from "react";
import api from "../services/api.js";
import "../index.css";
import "../Admin.css";

function formatCurrency(value) {
  return `Rp ${Number(value || 0).toLocaleString("id-ID")}`;
}

function getLastDays(count) {
  const today = new Date();
  return Array.from({ length: count }).map((_, index) => {
    const date = new Date(today);
    date.setDate(today.getDate() - (count - 1 - index));
    return date;
  });
}

function CircularChart({ percentage = 0, label = "", value = "" }) {
  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className="circular-chart-wrapper">
      <svg width="120" height="120" viewBox="0 0 120 120">
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="#e2e8f0"
          strokeWidth="8"
        />
        <circle
          cx="60"
          cy="60"
          r={radius}
          fill="none"
          stroke="url(#gradient)"
          strokeWidth="8"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform="rotate(-90 60 60)"
        />
        <defs>
          <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#8b6f47" />
            <stop offset="100%" stopColor="#6d5838" />
          </linearGradient>
        </defs>
        <text x="60" y="60" textAnchor="middle" dy="0.3em" className="chart-text">
          {percentage}%
        </text>
      </svg>
      <div className="chart-info">
        <p className="chart-label">{label}</p>
        <p className="chart-value">{value}</p>
      </div>
    </div>
  );
}

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const res = await api.get("/orders/history");
        setOrders(res.data || []);
      } catch (err) {
        console.error("Gagal load dashboard data", err);
        setError("Tidak dapat memuat data pendapatan saat ini.");
      } finally {
        setLoading(false);
      }
    };

    loadHistory();
  }, []);

  const dashboardData = useMemo(() => {
    const totalRevenue = orders.reduce(
      (sum, order) => sum + Number(order.total_price || 0),
      0,
    );
    const totalOrders = orders.length;
    const averageRevenue = totalOrders ? totalRevenue / totalOrders : 0;

    const thisMonthStart = new Date();
    thisMonthStart.setDate(1);
    const thisMonthOrders = orders.filter(
      (o) => new Date(o.order_date) >= thisMonthStart,
    );
    const thisMonthRevenue = thisMonthOrders.reduce(
      (sum, order) => sum + Number(order.total_price || 0),
      0,
    );

    const today = new Date();
    const todayKey = today.toISOString().slice(0, 10);
    const todayOrders = orders.filter(
      (o) => new Date(o.order_date).toISOString().slice(0, 10) === todayKey,
    );
    const todayRevenue = todayOrders.reduce(
      (sum, order) => sum + Number(order.total_price || 0),
      0,
    );

    const dates = getLastDays(7);
    const dailyTraffic = dates.map((date) => {
      const dayKey = date.toISOString().slice(0, 10);
      const dayOrders = orders.filter((order) =>
        new Date(order.order_date).toISOString().slice(0, 10) === dayKey,
      );
      const dayRevenue = dayOrders.reduce(
        (sum, order) => sum + Number(order.total_price || 0),
        0,
      );

      return {
        label: date.toLocaleDateString("id-ID", { weekday: "short" }),
        date: dayKey,
        revenue: dayRevenue,
        orders: dayOrders.length,
      };
    });

    const maxRevenue = Math.max(...dailyTraffic.map((item) => item.revenue), 1);
    const maxOrders = Math.max(...dailyTraffic.map((item) => item.orders), 1);

    // Limit recent orders to 5
    const recentOrders = orders.slice(-5).reverse();

    return {
      totalRevenue,
      totalOrders,
      averageRevenue,
      thisMonthRevenue,
      todayRevenue,
      todayOrderCount: todayOrders.length,
      dailyTraffic,
      maxRevenue,
      maxOrders,
      recentOrders,
    };
  }, [orders]);

  if (loading) {
    return <div className="admin-dashboard">Loading dashboard...</div>;
  }

  return (
    <div className="admin-dashboard">
      {error && <div className="alert alert-error">{error}</div>}

      {/* TOP STAT CARDS */}
      <div className="dashboard-stat-cards">
        <div className="stat-card">
          <div className="stat-header">
            <h4>Total Pendapatan</h4>
            <span className="stat-badge">↑ 5.2%</span>
          </div>
          <p className="stat-value">{formatCurrency(dashboardData.totalRevenue)}</p>
          <p className="stat-sub">Dari semua order</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>Total Order</h4>
            <span className="stat-badge">↑ 3.1%</span>
          </div>
          <p className="stat-value">{dashboardData.totalOrders}</p>
          <p className="stat-sub">Jumlah pesanan</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>Hari Ini</h4>
            <span className="stat-badge">Today</span>
          </div>
          <p className="stat-value">{formatCurrency(dashboardData.todayRevenue)}</p>
          <p className="stat-sub">{dashboardData.todayOrderCount} order</p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <h4>Bulan Ini</h4>
            <span className="stat-badge">This Month</span>
          </div>
          <p className="stat-value">{formatCurrency(dashboardData.thisMonthRevenue)}</p>
          <p className="stat-sub">Pendapatan bulan</p>
        </div>
      </div>

      {/* MAIN CONTENT ROW */}
      <div className="dashboard-content">
        {/* LEFT: SALES OVERVIEW */}
        <div className="dashboard-panel sales-overview">
          <div className="panel-header">
            <h3>Ringkasan Penjualan</h3>
          </div>

          <div className="sales-content">
            <CircularChart
              percentage={Math.round(
                (dashboardData.totalOrders /
                  Math.max(dashboardData.totalOrders, 100)) *
                  100,
              )}
              label="Total Order"
              value={dashboardData.totalOrders}
            />

            <div className="sales-stats">
              <p className="stat-item">
                <span className="stat-dot" style={{ background: "#8b6f47" }} />
                <span>Total Pendapatan</span>
              </p>
              <p className="stat-item">
                <span className="stat-dot" style={{ background: "#2563eb" }} />
                <span>Jumlah Order</span>
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT: TRAFFIC CHART */}
        <div className="dashboard-panel traffic-panel">
          <div className="panel-header">
            <h3>Traffic Pendapatan (7 Hari)</h3>
          </div>

          <div className="traffic-chart">
            {dashboardData.dailyTraffic.map((item) => {
              const revenueHeight = Math.round(
                (item.revenue / dashboardData.maxRevenue) * 100,
              );

              return (
                <div key={item.date} className="chart-column">
                  <div className="chart-bar-container">
                    <div
                      className="chart-bar revenue"
                      style={{ height: `${Math.max(revenueHeight, 5)}%` }}
                      title={`Rp ${item.revenue.toLocaleString("id-ID")}`}
                    />
                  </div>
                  <span className="chart-label">{item.label}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* RECENT ORDERS TABLE */}
      <div className="dashboard-panel recent-orders">
        <div className="panel-header">
          <h3>Order Terbaru</h3>
        </div>

        <div className="orders-table-wrapper">
          <table className="orders-table">
            <thead>
              <tr>
                <th>Nama Customer</th>
                <th>Tipe</th>
                <th>Total</th>
                <th>Tanggal</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {dashboardData.recentOrders.length === 0 ? (
                <tr>
                  <td colSpan="5" style={{ textAlign: "center", padding: "2rem" }}>
                    Belum ada order
                  </td>
                </tr>
              ) : (
                dashboardData.recentOrders.map((order) => (
                  <tr key={order.order_id}>
                    <td>
                      <strong>{order.customer_name}</strong>
                    </td>
                    <td>
                      <span className="order-type">
                        {order.order_type === "dine_in" ? "Dine In" : "Takeaway"}
                      </span>
                    </td>
                    <td>{formatCurrency(order.total_price)}</td>
                    <td>{new Date(order.order_date).toLocaleDateString("id-ID")}</td>
                    <td>
                      <span className="status-badge completed">Completed</span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
