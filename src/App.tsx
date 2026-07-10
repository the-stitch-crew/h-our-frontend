import { Navigate, Route, Routes } from "react-router-dom";
import { useEffect, type ReactElement } from "react";
import Layout from "./components/Layout";
import { useAuth } from "./context/AuthContext";
import AdminPage from "./pages/AdminPage";
import BrandPage from "./pages/BrandPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import ClassReservationPage from "./pages/ClassReservationPage";
import ContactPage from "./pages/ContactPage";
import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import MyPage from "./pages/MyPage";
import OrderCompletePage from "./pages/OrderCompletePage";
import OAuthCallbackPage from "./pages/OAuthCallbackPage";
import PaymentFailPage from "./pages/PaymentFailPage";
import PaymentPage from "./pages/PaymentPage";
import PaymentReceiptPage from "./pages/PaymentReceiptPage";
import PaymentSuccessPage from "./pages/PaymentSuccessPage";
import PaymentTestLoginPage from "./pages/PaymentTestLoginPage";
import ProductDetailPage from "./pages/ProductDetailPage";
import ProductsPage from "./pages/ProductsPage";
import ShippingPolicyPage from "./pages/ShippingPolicyPage";
import SignupPage from "./pages/SignupPage";

function ProtectedRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, isLoading, user, refreshMe } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      void refreshMe();
    }
  }, [isAuthenticated, isLoading, refreshMe, user]);

  if (isLoading || (isAuthenticated && !user)) {
    return <div className="page loading-page">불러오는 중입니다.</div>;
  }

  return isAuthenticated && user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }: { children: ReactElement }) {
  const { isAuthenticated, user, isLoading, refreshMe } = useAuth();

  useEffect(() => {
    if (isAuthenticated && !user && !isLoading) {
      void refreshMe();
    }
  }, [isAuthenticated, isLoading, refreshMe, user]);

  if (isLoading || (isAuthenticated && !user)) {
    return <div className="page loading-page">불러오는 중입니다.</div>;
  }

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
          path="/payments/reservations/:reservationId"
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
        <Route path="/oauth/callback" element={<OAuthCallbackPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/class" element={<ClassReservationPage />} />
        <Route path="/brand" element={<BrandPage />} />
        <Route path="/about" element={<Navigate to="/brand" replace />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/policies/shipping-policy" element={<ShippingPolicyPage />} />
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
