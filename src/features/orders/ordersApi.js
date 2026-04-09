import { apiSlice } from '../../api/apiSlice'

export const ordersApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getOrders: builder.query({
      query: () => ({ url: '/orders' }),
      providesTags: (result) =>
        result
          ? [...result.map(({ id }) => ({ type: 'Order', id })), { type: 'Order', id: 'LIST' }]
          : [{ type: 'Order', id: 'LIST' }],
    }),

    getOrder: builder.query({
      query: (id) => ({ url: `/orders/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Order', id }],
    }),

    createOrder: builder.mutation({
      query: (body) => ({ url: '/orders', method: 'POST', body }),
      invalidatesTags: [{ type: 'Order', id: 'LIST' }, 'Points'],
    }),

    cancelOrder: builder.mutation({
      query: (id) => ({ url: `/orders/${id}/cancel`, method: 'PATCH' }),
      invalidatesTags: (result, error, id) => [{ type: 'Order', id }, { type: 'Order', id: 'LIST' }],
    }),
  }),
})

export const {
  useGetOrdersQuery,
  useGetOrderQuery,
  useCreateOrderMutation,
  useCancelOrderMutation,
} = ordersApi
