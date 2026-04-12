import logo from "../assets/main-logo.png";
import cartIcon from "../assets/cart1.svg";
import beans from "../assets/beans.png";
import instagram from "../assets/instagram.png";
import tiktok from "../assets/tik-tok.png";
import whatsapp from "../assets/whatsapp.png";
import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom"; // ✅ tambah useLocation
import api from "../services/api.js";
import "../App.css";
import "../index.css";

function MainPage() {
  const [products, setProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("coffee");
  const [cartItems, setCartItems] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [loadingId, setLoadingId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation(); // ✅ ambil location state

  // ✅ Restore cart jika kembali dari OrderPage via "Tambah Menu Lagi"
  useEffect(() => {
    if (location.state?.reopenCart && location.state?.cartItems?.length > 0) {
      setCartItems(location.state.cartItems);
      setShowPopup(true);
      // Bersihkan state agar tidak loop saat refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  // Navigasi Order Now
  const handleOrder = (product) => {
    setLoadingId(product.product_id);
    const item = {
      ...product,
      price: Number(product.price),
      quantity: 1,
    };

    setTimeout(() => {
      navigate("/order", { state: { cartItems: [item] } });
      setLoadingId(null);
    }, 1500);
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = () => {
      api.get("/products").then((res) => setProducts(res.data));
    };
    fetchProducts();
    const interval = setInterval(fetchProducts, 5000);
    return () => clearInterval(interval);
  }, []);

  const filteredProducts = products.filter(
    (item) => item.category_name.toLowerCase() === selectedCategory
  );

  // Scroll hide navbar
  useEffect(() => {
    let lastScroll = 0;
    const handleScroll = () => {
      const navbar = document.querySelector(".main-navbar");
      if (!navbar) return;
      const currentScroll = window.scrollY;
      if (currentScroll > lastScroll) navbar.classList.add("hide");
      else navbar.classList.remove("hide");
      lastScroll = currentScroll;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Add to Cart
  const addToCart = (product) => {
    setCartItems((prev) => {
      const existing = prev.find((i) => i.product_id === product.product_id);
      if (existing) {
        return prev.map((i) =>
          i.product_id === product.product_id
            ? { ...i, quantity: i.quantity + 1 }
            : i
        );
      } else {
        return [
          ...prev,
          { ...product, price: Number(product.price), quantity: 1 },
        ];
      }
    });
    setShowPopup(true);
  };

  // Increment quantity
  const incrementQty = (product_id) => {
    setCartItems((prev) =>
      prev.map((item) =>
        item.product_id === product_id
          ? { ...item, quantity: item.quantity + 1 }
          : item
      )
    );
  };

  // Decrement quantity
  const decrementQty = (product_id) => {
    setCartItems((prev) => {
      const updated = prev
        .map((item) =>
          item.product_id === product_id
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
        .filter((item) => item.quantity > 0);

      if (updated.length === 0) setShowPopup(false);
      return updated;
    });
  };

  // Tutup popup & reset cart
  const closePopup = () => {
    setShowPopup(false);
    setCartItems([]);
  };

  // Go to order page
  const goToOrderPage = () => {
    navigate("/order", { state: { cartItems } });
  };

  // Hitung total harga
  const totalPrice = cartItems.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  return (
    <div className="app">
      {/* NAVBAR */}
      <div className="main-navbar">
        <div className="navbar">
          <div className="logo">
            <img src={logo} alt="logo" />
          </div>
          <div className="navigation">
            <a href="#">home</a>
            <a href="#">product</a>
          </div>
          <div className="shopping-cart" onClick={() => setShowPopup(true)}>
            <img src={cartIcon} alt="cart" />
            {cartItems.length > 0 && (
              <span className="cart-count">{cartItems.length}</span>
            )}
          </div>
        </div>
      </div>

      {/* HERO */}
      <div className="main-hero">
        <div className="judul-hero">
          <div className="judul">
            <h1>WELCOME TO NEKO COFFEE</h1>
            <p>Coffee shop & Restaurant</p>
          </div>
          <div className="shape-animation">
            <img src={beans} alt="" />
          </div>
        </div>
      </div>

      {/* PRODUCTS */}
      <div className="product-section">
        <h3>NEKO MENUS</h3>
        <div className="navigation-menu">
          <button onClick={() => setSelectedCategory("coffee")}>Coffee</button>
          <button onClick={() => setSelectedCategory("non-coffee")}>
            Non-Coffee
          </button>
          <button onClick={() => setSelectedCategory("foods")}>Foods</button>
        </div>

        <div className="product-list">
          {filteredProducts.map((item, index) => {
            const isAvailable = item.status === "available";
            return (
              <div
                className={`product ${!isAvailable ? "disabled" : ""}`}
                key={item.product_id}
                style={{ animationDelay: `${index * 0.15}s` }}
              >
                <div className="image-menu">
                  <img
                    src={`http://localhost:5000/uploads/${item.image}`}
                    alt={item.name}
                  />
                </div>
                <div className="description">
                  <h4>{item.name}</h4>
                  <p>{item.description}</p>
                  <p className="price">
                    Rp {Number(item.price).toLocaleString()}
                  </p>
                  <span className={`status ${item.status}`}>
                    {isAvailable ? "Available" : "Unavailable"}
                  </span>
                </div>
                <div className="btn-order">
                  <button
                    disabled={!isAvailable || loadingId === item.product_id}
                    onClick={() => handleOrder(item)}
                  >
                    {loadingId === item.product_id ? "Loading..." : "Order Now"}
                  </button>
                  <button
                    disabled={!isAvailable}
                    onClick={() => addToCart(item)}
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* POPUP CART */}
      {showPopup && (
        <div className="cart-popup">
          <h4>Keranjang</h4>
          {cartItems.length === 0 ? (
            <p>Keranjang kosong</p>
          ) : (
            <div className="cart-list">
              {cartItems.map((item) => (
                <div key={item.product_id} className="cart-item">
                  <span>{item.name || item.product_name}</span>
                  <div className="cart-qty">
                    <button onClick={() => decrementQty(item.product_id)}>
                      -
                    </button>
                    <span>{item.quantity}</span>
                    <button onClick={() => incrementQty(item.product_id)}>
                      +
                    </button>
                  </div>
                  <span>Rp {(item.price * item.quantity).toLocaleString()}</span>
                </div>
              ))}
              <hr />
              <div className="cart-total">
                <strong>Total:</strong>
                <strong>Rp {totalPrice.toLocaleString()}</strong>
              </div>
            </div>
          )}
          <div className="btn-cart">
            <button onClick={goToOrderPage}>Lanjut ke Order</button>
            <button onClick={() => closePopup()}>Tutup</button>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <div className="footer">
        <div className="tagline">
          <h2>NEKO COFFEE</h2>
          <p>Coffee & Restaurant</p>
          <p>Brew With Love</p>
        </div>
        <div className="operational">
          <h2>OPEN HOURS</h2>
          <p>Mon - Fri : 08.00 - 22.00</p>
          <p>Sat - Sun : 09.00 - 23.00</p>
        </div>
        <div className="contact">
          <p>Jl.Kopi No.99A/56</p>
          <p>0821-2081-4298</p>
          <p>nekocoffee@gmail.com</p>
        </div>
        <div className="social-media">
          <div className="instagram">
            <img src={instagram} alt="" />
            <a href="">Instagram</a>
          </div>
          <div className="tiktok">
            <img src={tiktok} alt="" />
            <a href="">Tiktok</a>
          </div>
          <div className="whatsapp">
            <img src={whatsapp} alt="" />
            <a href="">Whatsapp</a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MainPage;