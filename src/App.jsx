import { BrowserRouter, Routes, Route } from 'react-router-dom'
import ErrorBoundary from './shared/components/ErrorBoundary'
import AuthInitializer from './features/auth/AuthInitializer'
import Layout from './components/layout/Layout'
import ProtectedRoute from './features/auth/ProtectedRoute'

import HomePage from './features/home/HomePage'
import ProductListPage from './features/products/ProductListPage'
import ProductDetailPage from './features/products/ProductDetailPage'
import LoginPage from './features/auth/LoginPage'
import CartPage from './features/cart/CartPage'
import { Navigate } from 'react-router-dom'
import OrdersPage from './features/orders/OrdersPage'
import OrderDetailPage from './features/orders/OrderDetailPage'
import ProfilePage from './features/user/ProfilePage'
import PointsPage from './features/user/PointsPage'
import MyReviewsPage from './features/reviews/MyReviewsPage'
import InquiriesPage from './features/inquiries/InquiriesPage'
import MyPageLayout from './features/mypage/MyPageLayout'
import NotFoundPage from './pages/NotFoundPage'

export default function App() {
  return (
    <ErrorBoundary>
      <BrowserRouter>
        <AuthInitializer>
          <Routes>
            <Route element={<Layout />}>
              {/* 공개 라우트 */}
              <Route index element={<HomePage />} />
              <Route path="products" element={<ProductListPage />} />
              <Route path="products/:id" element={<ProductDetailPage />} />
              <Route path="login" element={<LoginPage />} />

              {/* 보호된 라우트 */}
              <Route
                path="cart"
                element={<ProtectedRoute><CartPage /></ProtectedRoute>}
              />

              {/* My Page — 중첩 라우트 (LNB + Dashboard 공유 레이아웃) */}
              <Route
                path="my"
                element={<ProtectedRoute><MyPageLayout /></ProtectedRoute>}
              >
                <Route index element={<Navigate to="orders" replace />} />
                <Route path="orders" element={<OrdersPage />} />
                <Route path="orders/:id" element={<OrderDetailPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="points" element={<PointsPage />} />
                <Route path="reviews" element={<MyReviewsPage />} />
                <Route path="inquiries" element={<InquiriesPage />} />
              </Route>

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
