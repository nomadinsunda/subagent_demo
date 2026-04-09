import { apiSlice } from '../../api/apiSlice'

export const usersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getAddresses: builder.query({
      query: () => ({ url: '/users/me/addresses' }),
      providesTags: ['Address'],
    }),

    addAddress: builder.mutation({
      query: (body) => ({ url: '/users/me/addresses', method: 'POST', body }),
      invalidatesTags: ['Address', 'Auth'],
    }),

    updateAddress: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/users/me/addresses/${id}`, method: 'PATCH', body }),
      invalidatesTags: ['Address'],
    }),

    deleteAddress: builder.mutation({
      query: (id) => ({ url: `/users/me/addresses/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Address'],
    }),

    setDefaultAddress: builder.mutation({
      query: (id) => ({ url: `/users/me/addresses/${id}/default`, method: 'PATCH' }),
      invalidatesTags: ['Address'],
    }),

    updateProfile: builder.mutation({
      query: (body) => ({ url: '/users/me', method: 'PATCH', body }),
      invalidatesTags: ['Auth'],
    }),
  }),
})

export const {
  useGetAddressesQuery,
  useAddAddressMutation,
  useUpdateAddressMutation,
  useDeleteAddressMutation,
  useSetDefaultAddressMutation,
  useUpdateProfileMutation,
} = usersApi
