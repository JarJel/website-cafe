import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import api from "../services/api.js";
import "../index.css";
import "../Admin.css";

export default function AdminProduct() {
  const navigate = useNavigate();
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const editIdParam = params.get("editId");

  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState(null);

  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState({
    category_id: "",
    name: "",
    description: "",
    price: "",
    image: null,
    status: "available",
  });

  useEffect(() => {
    api.get("/categories").then((res) => setCategories(res.data));

    if (editIdParam) {
      setIsEdit(true);
      setEditId(editIdParam);

      api
        .get(`/products/${editIdParam}`)
        .then((res) => {
          const p = res.data.product || res.data;
          setForm({
            category_id: p.category_id,
            name: p.name,
            description: p.description,
            price: p.price,
            image: null,
            status: p.status,
          });
        })
        .catch(() => {
          // fallback: fetch all and find
          api.get("/products").then((r) => {
            const p = r.data.find((x) => x.product_id == editIdParam);
            if (p) {
              setForm({
                category_id: p.category_id,
                name: p.name,
                description: p.description,
                price: p.price,
                image: null,
                status: p.status,
              });
            }
          });
        });
    }
  }, [editIdParam]);

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
        await api.put(`/products/${editId}`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Produk berhasil diupdate");
      } else {
        await api.post("/products", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        alert("Produk berhasil ditambahkan");
      }

      setForm({
        category_id: "",
        name: "",
        description: "",
        price: "",
        image: null,
        status: "available",
      });

      navigate("/admin/products");
    } catch (err) {
      console.error(err);
      alert("Gagal simpan produk");
    }
  };

  return (
    <div className="admin-form">
      <h2>{isEdit ? "Edit Produk" : "Tambah Produk"}</h2>

      <form onSubmit={handleSubmit}>
        <label>Kategori</label>
        <select name="category_id" onChange={handleChange} value={form.category_id} required>
          <option value="">Pilih Category</option>
          {categories.map((c) => (
            <option key={c.category_id} value={c.category_id}>
              {c.name}
            </option>
          ))}
        </select>

        <label>Nama Produk</label>
        <input name="name" onChange={handleChange} value={form.name} required />

        <label>Deskripsi</label>
        <textarea name="description" onChange={handleChange} value={form.description} />

        <label>Gambar</label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, image: e.target.files[0] })}
          />

        <label>Harga</label>
        <input type="number" name="price" onChange={handleChange} value={form.price} min="1000" max="100000" required />

        <label>Status</label>
        <select name="status" onChange={handleChange} value={form.status}>
          <option value="available">Available</option>
          <option value="unavailable">Unavailable</option>
        </select>

        <button type="submit">{isEdit ? "Update Product" : "Simpan"}</button>
      </form>
    </div>
  );
}
