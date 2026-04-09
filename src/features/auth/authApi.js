import { apiSlice } from '../../api/apiSlice'
import { setUser, setInitialized, logout } from './authSlice'

export const authApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMe: builder.query({
      query: () => ({ url: '/auth/me' }),
      providesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled
          dispatch(setUser(data))
        } catch {
          dispatch(setUser(null))
        } finally {
          dispatch(setInitialized())
        }
      },
    }),

    login: builder.mutation({
      query: (credentials) => ({ url: '/auth/login', method: 'POST', body: credentials }),
      invalidatesTags: ['Auth'],
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled
        dispatch(setUser(data))
      },
    }),

    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        await queryFulfilled
        dispatch(logout())
        dispatch(apiSlice.util.resetApiState())
      },
    }),
  }),
})

export const { useGetMeQuery, useLoginMutation, useLogoutMutation } = authApi
