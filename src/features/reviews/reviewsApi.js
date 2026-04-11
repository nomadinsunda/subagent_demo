import { apiSlice } from '../../api/apiSlice'

export const reviewsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    // ── 상품별 리뷰 목록 ────────────────────────────────────────────────────
    // 응답: { reviews, total, page, limit }
    // sort: 'best'(기본, 도움순) | 'newest' | 'highest' | 'lowest'
    getProductReviews: builder.query({
      query: ({ productId, sort = 'best', hasImage, page = 1, limit = 10 }) => ({
        url: `/products/${productId}/reviews`,
        params: { sort, ...(hasImage !== undefined && { hasImage }), page, limit },
      }),
      providesTags: (result, error, { productId }) => [
        { type: 'Review', id: 'LIST' },
        { type: 'Review', id: `product-${productId}` },
      ],
    }),

    // ── 상품별 리뷰 통계 ────────────────────────────────────────────────────
    // 응답: { averageRating, totalCount, ratingDistribution: { 1~5: count } }
    getProductReviewsSummary: builder.query({
      query: ({ productId }) => ({ url: `/products/${productId}/reviews/summary` }),
      providesTags: (result, error, { productId }) => [
        { type: 'Review', id: `summary-${productId}` },
        { type: 'Product', id: productId },
      ],
    }),

    // ── 내 리뷰 목록 ────────────────────────────────────────────────────────
    getMyReviews: builder.query({
      query: () => ({ url: '/reviews/my' }),
      providesTags: [{ type: 'Review', id: 'MY' }],
    }),

    // ── 리뷰 작성 ───────────────────────────────────────────────────────────
    // body: { productId, orderId, rating, content, images? }
    createReview: builder.mutation({
      query: (body) => ({ url: '/reviews', method: 'POST', body }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: 'LIST' },
        { type: 'Review', id: `product-${productId}` },
        { type: 'Review', id: `summary-${productId}` },
        { type: 'Review', id: 'MY' },
        { type: 'Product', id: productId },
      ],
    }),

    // ── 리뷰 수정 ───────────────────────────────────────────────────────────
    // arg: { id, productId, rating?, content?, images? }
    updateReview: builder.mutation({
      query: ({ id, productId: _pid, ...body }) => ({ url: `/reviews/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: `product-${productId}` },
        { type: 'Review', id: `summary-${productId}` },
        { type: 'Review', id: 'MY' },
      ],
    }),

    // ── 리뷰 삭제 ───────────────────────────────────────────────────────────
    // arg: { id, productId } — productId는 관련 태그 무효화용
    deleteReview: builder.mutation({
      query: ({ id }) => ({ url: `/reviews/${id}`, method: 'DELETE' }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Review', id: 'LIST' },
        { type: 'Review', id: `product-${productId}` },
        { type: 'Review', id: `summary-${productId}` },
        { type: 'Review', id: 'MY' },
        { type: 'Product', id: productId },
      ],
    }),

    // ── 도움돼요 토글 (Optimistic Update) ──────────────────────────────────
    // arg: { reviewId, productId, queryArgs }
    //   queryArgs: useGetProductReviewsQuery에 전달한 인수 그대로 (캐시 업데이트용)
    toggleHelpful: builder.mutation({
      query: ({ reviewId }) => ({ url: `/reviews/${reviewId}/helpful`, method: 'POST' }),
      async onQueryStarted({ reviewId, queryArgs }, { dispatch, queryFulfilled }) {
        const patch = dispatch(
          reviewsApi.util.updateQueryData('getProductReviews', queryArgs, (draft) => {
            const review = draft.reviews?.find((r) => r.id === reviewId)
            if (review) {
              review.isHelpful = !review.isHelpful
              review.helpfulCount = review.isHelpful
                ? review.helpfulCount + 1
                : Math.max(0, review.helpfulCount - 1)
            }
          })
        )
        try {
          await queryFulfilled
        } catch {
          patch.undo()
        }
      },
    }),
  }),
})

export const {
  useGetProductReviewsQuery,
  useGetProductReviewsSummaryQuery,
  useGetMyReviewsQuery,
  useCreateReviewMutation,
  useUpdateReviewMutation,
  useDeleteReviewMutation,
  useToggleHelpfulMutation,
} = reviewsApi
