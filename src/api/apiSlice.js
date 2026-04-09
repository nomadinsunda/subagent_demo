import { createApi } from '@reduxjs/toolkit/query/react'
import { mockBaseQuery } from './mockBaseQuery'
import { logout } from '../features/auth/authSlice'

// 백엔드 연결 시 아래 realBaseQuery를 활성화하고 mockBaseQuery를 교체
// import { fetchBaseQuery } from '@reduxjs/toolkit/query/react'
// import { getCookie } from '../utils/cookies'
// const realBaseQuery = fetchBaseQuery({
//   baseUrl: import.meta.env.VITE_API_URL,
//   credentials: 'include',
//   prepareHeaders: (headers) => {
//     const csrfToken = getCookie('XSRF-TOKEN')
//     if (csrfToken) headers.set('X-XSRF-TOKEN', csrfToken)
//     return headers
//   },
// })

const withReauth = (baseQuery) => async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    )

    if (refreshResult.data) {
      result = await baseQuery(args, api, extraOptions)
    } else {
      api.dispatch(logout())
    }
  }

  return result
}

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: withReauth(mockBaseQuery),
  tagTypes: ['Auth', 'Product', 'Order', 'Review', 'Points', 'Inquiry', 'Address', 'Cart'],
  endpoints: () => ({}),
})
