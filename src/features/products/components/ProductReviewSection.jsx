import { useState, useMemo } from 'react'
import { formatDate } from '../../../shared/utils/formatters'

const SORT_OPTIONS = [
  { value: 'best',    label: '베스트순' },
  { value: 'newest',  label: '최신순' },
  { value: 'highest', label: '별점 높은순' },
  { value: 'lowest',  label: '별점 낮은순' },
]

function StarRating({ rating, size = 'sm' }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span
          key={n}
          className={`${size === 'sm' ? 'text-sm' : 'text-lg'} ${n <= rating ? 'text-yellow-400' : 'text-base-content/20'}`}
        >
          ★
        </span>
      ))}
    </div>
  )
}

function RatingBar({ star, count, total }) {
  const pct = total > 0 ? Math.round((count / total) * 100) : 0
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-7 text-right text-base-content/60">{star}점</span>
      <div className="flex-1 bg-base-300 rounded-full h-1.5 overflow-hidden">
        <div className="h-full bg-yellow-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="w-5 text-base-content/50">{count}</span>
    </div>
  )
}

export default function ProductReviewSection({ reviews }) {
  const [sort, setSort] = useState('best')
  const [helpfulIds, setHelpfulIds] = useState(new Set())

  // 별점 요약 계산
  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0
  const distribution = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
  }))

  // 포토 리뷰
  const photoReviews = reviews.filter((r) => r.imageUrl)

  // 정렬
  const sorted = useMemo(() => {
    const arr = [...reviews]
    if (sort === 'best')    return arr.sort((a, b) => b.rating - a.rating || new Date(b.createdAt) - new Date(a.createdAt))
    if (sort === 'newest')  return arr.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    if (sort === 'highest') return arr.sort((a, b) => b.rating - a.rating)
    if (sort === 'lowest')  return arr.sort((a, b) => a.rating - b.rating)
    return arr
  }, [reviews, sort])

  const toggleHelpful = (id) => {
    setHelpfulIds((prev) => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  if (reviews.length === 0) {
    return (
      <div className="text-center py-12 text-base-content/50">
        <p className="text-4xl mb-3">✍️</p>
        <p>아직 리뷰가 없습니다. 첫 리뷰를 작성해 보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Section 1: 별점 요약 */}
      <div className="flex gap-6 p-5 bg-base-200 rounded-2xl">
        <div className="flex flex-col items-center justify-center min-w-[80px] gap-1">
          <p className="text-4xl font-bold">{avgRating}</p>
          <StarRating rating={Math.round(Number(avgRating))} size="base" />
          <p className="text-xs text-base-content/50 mt-1">리뷰 {reviews.length}개</p>
        </div>
        <div className="flex-1 space-y-2 justify-center flex flex-col">
          {distribution.map(({ star, count }) => (
            <RatingBar key={star} star={star} count={count} total={reviews.length} />
          ))}
        </div>
      </div>

      {/* Section 2: 포토 리뷰 갤러리 */}
      {photoReviews.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2 text-base-content/70">포토 리뷰 ({photoReviews.length})</p>
          <div className="flex gap-2">
            {photoReviews.slice(0, 6).map((review, i) => (
              <div key={review.id} className="relative shrink-0">
                <img
                  src={review.imageUrl}
                  alt="포토 리뷰"
                  className="w-20 h-20 object-cover rounded-lg border border-base-200"
                />
                {i === 5 && photoReviews.length > 6 && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">+{photoReviews.length - 6}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: 정렬 탭 */}
      <div className="flex border-b border-base-200">
        {SORT_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setSort(opt.value)}
            className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
              sort === opt.value
                ? 'border-base-content text-base-content font-medium'
                : 'border-transparent text-base-content/50 hover:text-base-content/70'
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Section 4: 리뷰 목록 */}
      <div className="divide-y divide-base-200">
        {sorted.map((review) => (
          <div key={review.id} className="py-5">

            {/* 작성자 정보: 아바타 + 이름 + 날짜 + 별점 */}
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-xs font-semibold text-base-content/70 shrink-0">
                  {review.userName[0]}
                </div>
                <div>
                  <p className="text-sm font-medium leading-none">{review.userName}</p>
                  <p className="text-xs text-base-content/50 mt-0.5">{formatDate(review.createdAt)}</p>
                </div>
              </div>
              <StarRating rating={review.rating} />
            </div>

            {/* 리뷰 본문 */}
            <p className="text-sm leading-relaxed text-base-content/80 mb-3">{review.content}</p>

            {/* 리뷰 이미지 */}
            {review.imageUrl && (
              <img
                src={review.imageUrl}
                alt="리뷰 이미지"
                className="w-24 h-24 object-cover rounded-lg border border-base-200 mb-3"
              />
            )}

            {/* 도움이 돼요 버튼 */}
            <button
              onClick={() => toggleHelpful(review.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors ${
                helpfulIds.has(review.id)
                  ? 'border-primary text-primary bg-primary/5'
                  : 'border-base-300 text-base-content/50 hover:border-base-content/30'
              }`}
            >
              👍 도움이 돼요
            </button>
          </div>
        ))}
      </div>

    </div>
  )
}
