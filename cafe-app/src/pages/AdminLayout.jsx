import { Outlet, Link } from "react-router-dom";
import "../Route.css";

export default function AdminLayout() {
  return (
    <div className="admin-container">
      
      {/* SIDEBAR */}
      <aside className="admin-sidebar">
        <h3>ADMIN</h3>
        <ul>
          <li><Link to="orders">Handle Order</Link></li>
          <li><Link to="products">Products</Link></li>
          <li><Link to="history">History</Link></li>
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="admin-main">
        <header className="admin-header">
          <h2 className="page-title">KASIR MANAGEMENT</h2>
        </header>
        
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}