import { Routes, Route } from "react-router-dom";
import MainPage from "./pages/MainPage";
import AdminLayout from "./pages/AdminLayout";
import AdminDashboard from "./pages/AdminDashboard";
import AdminProduct from "./pages/AdminProduct";
import AdminProductList from "./pages/AdminProductList";
import OrderPage from "./pages/OrderPage";
import HandleOrders from "./pages/HandleOrder";
import History from "./pages/History";
import Test from "./pages/Test";

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/order" element={<OrderPage />} />

      <Route path="/admin" element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="dashboard" element={<AdminDashboard />} />
        <Route path="products" element={<AdminProductList />} />
        <Route path="products/add" element={<AdminProduct />} />
        <Route path="orders" element={<HandleOrders />} />
        <Route path="history" element={<History />} />
        <Route path="test" element={<Test />} />
      </Route>
    </Routes>
  );
}

export default App;
