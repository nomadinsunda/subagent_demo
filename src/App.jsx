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
import OrdersPage from './features/orders/OrdersPage'
import OrderDetailPage from './features/orders/OrderDetailPage'
import ProfilePage from './features/user/ProfilePage'
import PointsPage from './features/user/PointsPage'
import MyReviewsPage from './features/reviews/MyReviewsPage'
import InquiriesPage from './features/inquiries/InquiriesPage'
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
              <Route
                path="my/orders"
                element={<ProtectedRoute><OrdersPage /></ProtectedRoute>}
              />
              <Route
                path="my/orders/:id"
                element={<ProtectedRoute><OrderDetailPage /></ProtectedRoute>}
              />
              <Route
                path="my/profile"
                element={<ProtectedRoute><ProfilePage /></ProtectedRoute>}
              />
              <Route
                path="my/points"
                element={<ProtectedRoute><PointsPage /></ProtectedRoute>}
              />
              <Route
                path="my/reviews"
                element={<ProtectedRoute><MyReviewsPage /></ProtectedRoute>}
              />
              <Route
                path="my/inquiries"
                element={<ProtectedRoute><InquiriesPage /></ProtectedRoute>}
              />

              <Route path="*" element={<NotFoundPage />} />
            </Route>
          </Routes>
        </AuthInitializer>
      </BrowserRouter>
    </ErrorBoundary>
  )
}
