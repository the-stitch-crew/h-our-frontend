import { Navigate, Route, Routes } from "react-router-dom";
import type { ReactElement } from "react";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import AboutPage from "./pages/AboutPage";
import AdminPage from "./pages/AdminPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ClassReservationPage from "./pages/ClassReservationPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyPage from "./pages/MyPage";
import OrderCompletePage from "./pages/OrderCompletePage";
import PaymentFailPage from "./pages/PaymentFailPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentReceiptPage from "./pages/PaymentReceiptPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentTestLoginPage from "./pages/PaymentTestLoginPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import SignupPage from "./pages/SignupPage";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return <div className="page loading-page">불러오는 중입니다.</div>;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactElement }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page loading-page">불러오는 중입니다.</div>;
  return user?.role === "ADMIN" ? children : <Navigate to="/" replace />;
}

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:productId" element={<ProductDetailPage />} />
        <Route path="/cart" element={<CartPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/order-complete" element={<OrderCompletePage />} />
        <Route path="/payments/test-login" element={<PaymentTestLoginPage />} />
        <Route
          path="/payments/orders/:orderNumber"
          element={
            <ProtectedRoute>
              <PaymentPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/payments/success"
          element={
            <ProtectedRoute>
              <PaymentSuccessPage />
            </ProtectedRoute>
          }
        />
        <Route path="/payments/fail" element={<PaymentFailPage />} />
        <Route
          path="/payments/:paymentId/receipt"
          element={
            <ProtectedRoute>
              <PaymentReceiptPage />
            </ProtectedRoute>
          }
        />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/class" element={<ClassReservationPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route
          path="/mypage"
          element={
            <ProtectedRoute>
              <MyPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminPage />
            </AdminRoute>
          }
        />
      </Route>
    </Routes>
  );
}
