import { StarRating } from './ReviewItem'

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-7 text-right" style={{ color: '#555555' }}>{star}점</span>
      <div className="flex-1 bg-base-300 rounded-full h-1.5 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{ width: `${pct}%`, backgroundColor: '#FF9900' }}
        />
      </div>
      <span className="w-5" style={{ color: '#555555' }}>{count}</span>
    </div>
  )
}

function ReviewSummarySkeleton() {
  return (
    <div className="flex gap-6 p-5 bg-base-200 rounded-2xl animate-pulse">
      <div className="flex flex-col items-center justify-center min-w-[80px] gap-2">
        <div className="h-8 w-12 bg-base-300 rounded" />
        <div className="h-4 w-20 bg-base-300 rounded" />
        <div className="h-3 w-14 bg-base-300 rounded" />
      </div>
      <div className="flex-1 space-y-3 flex flex-col justify-center">
        {[5, 4, 3, 2, 1].map((s) => (
          <div key={s} className="flex items-center gap-2">
            <div className="w-7 h-2 bg-base-300 rounded" />
            <div className="flex-1 h-1.5 bg-base-300 rounded-full" />
            <div className="w-5 h-2 bg-base-300 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}

/**
 * 상품 리뷰 통계 요약 (평균 평점 + 별점 분포 바)
 *
 * @param {object} summary     - getProductReviewsSummary 응답 { averageRating, totalCount, ratingDistribution }
 * @param {boolean} isLoading
 */
export default function ReviewSummary({ summary, isLoading }) {
  if (isLoading) return <ReviewSummarySkeleton />
  if (!summary) return null

  const { averageRating, totalCount, ratingDistribution } = summary

  return (
    <div className="flex gap-6 p-5 bg-base-200 rounded-2xl">
      <div className="flex flex-col items-center justify-center min-w-[80px] gap-1">
        <p className="text-[42px] font-bold leading-none" style={{ color: '#111111' }}>{averageRating}</p>
        <StarRating rating={Math.round(averageRating)} size="base" />
        <p className="text-xs mt-1" style={{ color: '#555555' }}>리뷰 {totalCount}개</p>
      </div>
      <div className="flex-1 space-y-2 flex flex-col justify-center">
        {[5, 4, 3, 2, 1].map((star) => (
          <RatingBar key={star} star={star} count={ratingDistribution[star] ?? 0} total={totalCount} />
        ))}
      </div>
    </div>
  )
}
