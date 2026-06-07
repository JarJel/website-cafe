import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api.js";
import "../index.css";
import "../Admin.css";

export default function AdminProductList() {
  const navigate = useNavigate();

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    api.get("/products").then((res) => setProducts(res.data));
  }, []);

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await api.put(`/products/${productId}/status`, { status: newStatus });
      setProducts((prev) =>
        prev.map((p) => (p.product_id === productId ? { ...p, status: newStatus } : p)),
      );
    } catch (err) {
      console.error(err);
      alert("Gagal update status");
    }
  };

  const handleDeleteProduct = async (productId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus produk ini?")) {
      try {
        await api.delete(`/products/${productId}`);
        setProducts((prev) =>
          prev.filter((p) => p.product_id !== productId)
        );
        alert("Produk berhasil dihapus");
      } catch (err) {
        console.error(err);
        alert("Gagal menghapus produk");
      }
    }
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category_id == selectedCategory);

  return (
    <div className="admin-products">
      <h2>Daftar Produk</h2>

      <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="all">Semua</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>

        <button className="btn-primary" onClick={() => navigate("add")}>Tambah Produk</button>
      </div>

      <div className="product-grid">
        {filteredProducts.map((p) => (
          <div className="product-card" key={p.product_id}>
            <img src={`http://localhost:5000/uploads/${p.image}`} alt={p.name} />
            <h4>{p.name}</h4>
            <p>Rp {p.price.toLocaleString("id-ID")}</p>
            <select
              value={p.status}
              className={`status-select ${p.status}`}
              onChange={(e) => handleStatusChange(p.product_id, e.target.value)}
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
            <div style={{ display: "flex", gap: 8 }}>
              <button className="btn-edit" onClick={() => navigate(`add?editId=${p.product_id}`)}>
                Edit
              </button>
              <button className="btn-delete" onClick={() => handleDeleteProduct(p.product_id)}>
                Hapus
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
