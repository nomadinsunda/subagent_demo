import { apiSlice } from '../../api/apiSlice'

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getProductReviews: builder.query({
      query: ({ productId, ...params }) => ({
        url: `/products/${productId}/reviews`,
        params,
      }),
      providesTags: (result, error, { productId }) => [{ type: 'Review', id: `product-${productId}` }],
    }),

    getMyReviews: builder.query({
      query: () => ({ url: '/reviews/my' }),
      providesTags: [{ type: 'Review', id: 'MY' }],
    }),

    createReview: builder.mutation({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: `product-${productId}` },
        { type: 'Review', id: 'MY' },
        { type: 'Product', id: productId },
      ],
    }),

    updateReview: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/reviews/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: `product-${productId}` },
        { type: 'Review', id: 'MY' },
      ],
    }),

    deleteReview: builder.mutation({
      query: (id) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Review', id: 'MY' }],
    }),
  }),
})

export const {
  useGetProductReviewsQuery,
  useGetMyReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
} = reviewsApi
