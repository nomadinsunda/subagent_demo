import { configureStore } from '@reduxjs/toolkit'
import { apiSlice } from '../api/apiSlice'
import authReducer from '../features/auth/authSlice'

// 각 도메인 API 슬라이스를 import하여 injectEndpoints가 등록되도록 합니다
import '../features/auth/authApi'
import '../features/products/productsApi'
import '../features/orders/ordersApi'
import '../features/reviews/reviewsApi'
import '../features/user/pointsApi'
import '../features/inquiries/inquiriesApi'
import '../features/user/usersApi'
import '../features/cart/cartApi'

export const store = configureStore({
  reducer: {
    [apiSlice.reducerPath]: apiSlice.reducer,
    auth: authReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})
