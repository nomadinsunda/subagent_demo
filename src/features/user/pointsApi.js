import { apiSlice } from '../../api/apiSlice'

export const pointsApi = apiSlice.injectEndpoints({
  endpoints: (builder) => ({
    getMyPoints: builder.query({
      query: () => ({ url: '/points/me' }),
      providesTags: ['Points'],
    }),
  }),
})

export const { useGetMyPointsQuery } = pointsApi
