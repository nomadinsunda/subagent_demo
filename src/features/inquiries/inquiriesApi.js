import { apiSlice } from '../../api/apiSlice'

export const inquiriesApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyInquiries: builder.query({
      query: () => ({ url: '/inquiries/my' }),
      providesTags: [{ type: 'Inquiry', id: 'MY' }],
    }),

    getProductInquiries: builder.query({
      query: (productId) => ({ url: `/products/${productId}/inquiries` }),
      providesTags: (result, error, productId) => [{ type: 'Inquiry', id: `product-${productId}` }],
    }),

    getInquiry: builder.query({
      query: (id) => ({ url: `/inquiries/${id}` }),
      providesTags: (result, error, id) => [{ type: 'Inquiry', id }],
    }),

    createInquiry: builder.mutation({
      query: (body) => ({ url: '/inquiries', method: 'POST', body }),
      invalidatesTags: (result, error, { productId }) => [
        { type: 'Inquiry', id: 'MY' },
        ...(productId ? [{ type: 'Inquiry', id: `product-${productId}` }] : []),
      ],
    }),

    updateInquiry: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/inquiries/${id}`, method: 'PATCH', body }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Inquiry', id },
        { type: 'Inquiry', id: 'MY' },
      ],
    }),

    deleteInquiry: builder.mutation({
      query: (id) => ({ url: `/inquiries/${id}`, method: 'DELETE' }),
      invalidatesTags: [{ type: 'Inquiry', id: 'MY' }],
    }),
  }),
})

export const {
  useGetMyInquiriesQuery,
  useGetProductInquiriesQuery,
  useGetInquiryQuery,
  useCreateInquiryMutation,
  useUpdateInquiryMutation,
  useDeleteInquiryMutation,
} = inquiriesApi
