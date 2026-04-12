import { useEffect, useState } from "react";
import api from "../services/api.js";
import "../index.css";
import "../Admin.css";

export default function AdminProduct() {
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("all");

  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    image: null,
    status: "available",
  });

  // 🔹 load categories & products
  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));
    api.get("/products").then((res) => setProducts(res.data));
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    Object.keys(form).forEach((key) => {
      if (form[key] !== null) {
        formData.append(key, form[key]);
      }
    });

    try {
      if (isEdit) {
        // 🔥 UPDATE
        const res = await api.put(`/products/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        // 🔥 realtime update state
        setProducts((prev) =>
          prev.map((p) => (p.product_id === editId ? res.data.product : p)),
        );

        setIsEdit(false);
        setEditId(null);
        alert("Produk berhasil diupdate");
      } else {
        // 🔥 CREATE
        const res = await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        setProducts((prev) => [...prev, res.data.product]);
        alert("Produk berhasil ditambahkan");
      }

      // reset form
      setForm({
        category_id: "",
        name: "",
        description: "",
        price: "",
        image: null,
        status: "available",
      });
    } catch (err) {
      console.error(err);
      alert("Gagal simpan produk");
    }
  };

  const handleDelete = async (productId) => {
    const confirmDelete = window.confirm("Yakin ingin hapus produk ini?");
    if (!confirmDelete) return;

    try {
      await api.delete("/products/${productId}");

      setProducts((prev) => prev.filter((p) => p.product_id !== productId));

      alert("produk berhasil dihapus");
    } catch (err) {
      console.error(err);
      alert("Gagal menghapus produk");
    }
  };

  const handleEdit = (product) => {
    setIsEdit(true);
    setEditId(product.product_id);

    setForm({
      category_id: product.category_id,
      name: product.name,
      description: product.description,
      price: product.price,
      image: null, // image opsional saat edit
      status: product.status,
    });
  };

  const handleStatusChange = async (productId, newStatus) => {
    try {
      await api.put(`/products/${productId}/status`, {
        status: newStatus,
      });

      // 🔥 update state langsung (realtime)
      setProducts((prev) =>
        prev.map((p) =>
          p.product_id === productId ? { ...p, status: newStatus } : p,
        ),
      );
    } catch (err) {
      console.error(err);
      alert("Gagal update status");
    }
  };

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter((p) => p.category_id == selectedCategory);

  return (
    <div className="admin-layout">
      {/* ================= LEFT (FORM) ================= */}
      <div className="admin-form">
        <h2>Tambah Produk</h2>

        <form onSubmit={handleSubmit}>
          <label>Kategori</label>
          <select name="category_id" onChange={handleChange} required>
            <option value="">Pilih Category</option>
            {categories.map((c) => (
              <option key={c.category_id} value={c.category_id}>
                {c.name}
              </option>
            ))}
          </select>

          <label>Nama Produk</label>
          <input name="name" onChange={handleChange} required />

          <label>Deskripsi</label>
          <textarea name="description" onChange={handleChange} />

          <label>Gambar</label>
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
            required
          />

          <label>Harga</label>
          <input type="number" name="price" onChange={handleChange} min="1000" max="100000" required />

          <label>Status</label>
          <select name="status" onChange={handleChange}>
            <option value="available">Available</option>
            <option value="unavailable">Unavailable</option>
          </select>

          <button type="submit">{isEdit ? "Update Product" : "Simpan"}</button>
        </form>
      </div>

      {/* ================= RIGHT (PRODUCT LIST) ================= */}
      <div className="admin-products">
        <h2>Daftar Produk</h2>

        {/* FILTER */}
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

        <div className="product-grid">
          {filteredProducts.map((p) => (
            <div className="product-card" key={p.product_id}>
              <img
                src={`http://localhost:5000/uploads/${p.image}`}
                alt={p.name}
              />
              <h4>{p.name}</h4>
              <p>Rp {p.price.toLocaleString("id-ID")}</p>
              <select
                value={p.status}
                className={`status-select ${p.status}`}
                onChange={(e) =>
                  handleStatusChange(p.product_id, e.target.value)
                }
              >
                <option value="available">Available</option>
                <option value="unavailable">Unavailable</option>
              </select>
              <button className="btn-edit" onClick={() => handleEdit(p)}>
                Edit
              </button>
              <button
                className="btn-delete"
                onClick={() => handleDelete(p.product_id)}
              >
                Delete
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
