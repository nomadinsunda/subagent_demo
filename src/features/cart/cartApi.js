import { apiSlice } from '../../api/apiSlice'

export const cartApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({

    getCart: builder.query({
      query: () => ({ url: '/cart' }),
      providesTags: (result) =>
        result
          ? [
              ...result.map(({ id }) => ({ type: 'Cart', id })),
              { type: 'Cart', id: 'LIST' },
            ]
          : [{ type: 'Cart', id: 'LIST' }],
    }),

    addToCart: builder.mutation({
      query: (body) => ({ url: '/cart', method: 'POST', body }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

    updateCartItem: builder.mutation({
      query: ({ id, quantity }) => ({ url: `/cart/${id}`, method: 'PATCH', body: { quantity } }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Cart', id },
        { type: 'Cart', id: 'LIST' },
      ],
    }),

    removeFromCart: builder.mutation({
      query: (id) => ({ url: `/cart/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, id) => [
        { type: 'Cart', id },
        { type: 'Cart', id: 'LIST' },
      ],
    }),

    clearCart: builder.mutation({
      query: () => ({ url: '/cart/clear', method: 'DELETE' }),
      invalidatesTags: [{ type: 'Cart', id: 'LIST' }],
    }),

  }),
})

export const {
  useGetCartQuery,
  useAddToCartMutation,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} = cartApi
