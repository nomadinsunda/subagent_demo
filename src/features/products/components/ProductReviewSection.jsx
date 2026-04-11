import { useState } from 'react'
import {
  useGetProductReviewsQuery,
  useGetProductReviewsSummaryQuery,
  useToggleHelpfulMutation,
} from '../../reviews/reviewsApi'
import ReviewItem from '../../reviews/components/ReviewItem'
import ReviewSummary from '../../reviews/components/ReviewSummary'

const SORT_OPTIONS = [
  { value: 'best',    label: '베스트순' },
  { value: 'newest',  label: '최신순' },
  { value: 'highest', label: '별점 높은순' },
  { value: 'lowest',  label: '별점 낮은순' },
]

const PAGE_LIMIT = 10

function ReviewListSkeleton() {
  return (
    <div className="divide-y divide-base-200">
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="py-5 space-y-2 animate-pulse">
          <div className="flex gap-2 items-center">
            <div className="w-8 h-8 rounded-full bg-base-300" />
            <div className="space-y-1">
              <div className="h-3 w-20 bg-base-300 rounded" />
              <div className="h-2 w-14 bg-base-300 rounded" />
            </div>
          </div>
          <div className="h-3 w-full bg-base-300 rounded" />
          <div className="h-3 w-4/5 bg-base-300 rounded" />
        </div>
      ))}
    </div>
  )
}

function Pagination({ page, totalPages, onChange }) {
  if (totalPages <= 1) return null

  // 최대 7개 페이지 버튼 표시, 현재 페이지 중심으로 슬라이딩
  const getPageNumbers = () => {
    const maxButtons = Math.min(totalPages, 7)
    let start
    if (totalPages <= 7) {
      start = 1
    } else if (page <= 4) {
      start = 1
    } else if (page >= totalPages - 3) {
      start = totalPages - 6
    } else {
      start = page - 3
    }
    return Array.from({ length: maxButtons }, (_, i) => start + i)
  }

  return (
    <div className="flex justify-center">
      <div className="join">
        <button
          className="join-item btn btn-sm"
          disabled={page === 1}
          onClick={() => onChange(page - 1)}
          aria-label="이전 페이지"
        >
          ‹
        </button>
        {getPageNumbers().map((p) => (
          <button
            key={p}
            className={`join-item btn btn-sm ${page === p ? 'btn-active' : ''}`}
            style={page === p ? { borderColor: '#346AFF', color: '#346AFF' } : {}}
            onClick={() => onChange(p)}
          >
            {p}
          </button>
        ))}
        <button
          className="join-item btn btn-sm"
          disabled={page === totalPages}
          onClick={() => onChange(page + 1)}
          aria-label="다음 페이지"
        >
          ›
        </button>
      </div>
    </div>
  )
}

/**
 * 상품 상세 페이지 리뷰 섹션
 * 데이터 fetching + 필터/정렬/페이지네이션 + helpful 토글 자체 관리
 *
 * @param {number|string} productId
 */
export default function ProductReviewSection({ productId }) {
  const [sort, setSort] = useState('best')
  const [hasImage, setHasImage] = useState(false)
  const [page, setPage] = useState(1)

  // hasImage가 false일 때 undefined로 전달 → 필터 미적용
  const queryArgs = {
    productId: Number(productId),
    sort,
    page,
    limit: PAGE_LIMIT,
    ...(hasImage && { hasImage: true }),
  }

  const { data: summary, isLoading: summaryLoading } = useGetProductReviewsSummaryQuery(
    { productId: Number(productId) }
  )
  const { data, isLoading: listLoading, isFetching } = useGetProductReviewsQuery(queryArgs)
  const [toggleHelpful] = useToggleHelpfulMutation()

  const reviews = data?.reviews ?? []
  const total = data?.total ?? 0
  const totalPages = Math.ceil(total / PAGE_LIMIT)

  // 포토 리뷰: 현재 페이지에서 이미지 있는 항목 (갤러리 프리뷰용)
  const photoReviews = reviews.filter((r) => r.images?.length > 0)

  const handleSortChange = (value) => {
    setSort(value)
    setPage(1)
  }

  const handleHasImageToggle = () => {
    setHasImage((v) => !v)
    setPage(1)
  }

  const handleHelpful = (reviewId) => {
    toggleHelpful({ reviewId, queryArgs })
  }

  // 리뷰가 없는 경우 (summary 로드 완료 후 판단)
  if (!summaryLoading && summary?.totalCount === 0) {
    return (
      <div className="text-center py-16" style={{ color: '#888888' }}>
        <p className="text-4xl mb-3">✍️</p>
        <p className="font-medium mb-1" style={{ color: '#333333' }}>아직 리뷰가 없습니다</p>
        <p className="text-sm">구매 후 첫 번째 리뷰를 남겨보세요!</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">

      {/* Section 1: 별점 요약 */}
      <ReviewSummary summary={summary} isLoading={summaryLoading} />

      {/* Section 2: 포토 리뷰 갤러리 (현재 페이지 기준) */}
      {!listLoading && photoReviews.length > 0 && (
        <div>
          <p className="text-sm font-medium mb-2" style={{ color: '#888888' }}>
            포토 리뷰
          </p>
          <div className="flex gap-2 overflow-x-auto pb-1">
            {photoReviews.slice(0, 6).map((review, i) => (
              <div key={review.id} className="relative shrink-0">
                <img
                  src={review.images[0]}
                  alt="포토 리뷰"
                  className="w-20 h-20 object-cover rounded-lg border border-base-200 aspect-square"
                />
                {i === 5 && photoReviews.length > 6 && (
                  <div className="absolute inset-0 bg-black/40 rounded-lg flex items-center justify-center">
                    <span className="text-white text-xs font-semibold">
                      +{photoReviews.length - 6}
                    </span>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Section 3: 정렬 탭 + 필터 (Sticky — Header 64px 아래 고정) */}
      <div className="sticky top-16 z-10 bg-base-100 border-b border-base-200 pb-2 space-y-2">
        <div className="flex border-b border-base-200">
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className={`px-4 py-2 text-sm border-b-2 -mb-px transition-colors ${
                sort === opt.value
                  ? 'border-[#111111] font-medium'
                  : 'border-transparent hover:text-base-content/70'
              }`}
              style={{ color: sort === opt.value ? '#111111' : '#888888' }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div className="flex items-center justify-between px-1">
          <p className="text-xs" style={{ color: '#888888' }}>총 {total}개</p>
          <label className="flex items-center gap-1.5 cursor-pointer text-xs" style={{ color: '#888888' }}>
            <input
              type="checkbox"
              className="checkbox checkbox-xs"
              checked={hasImage}
              onChange={handleHasImageToggle}
            />
            포토 리뷰만
          </label>
        </div>
      </div>

      {/* Section 4: 리뷰 목록 */}
      {listLoading ? (
        <ReviewListSkeleton />
      ) : reviews.length === 0 ? (
        <div className="text-center py-12" style={{ color: '#888888' }}>
          <p>해당 조건의 리뷰가 없습니다.</p>
        </div>
      ) : (
        <div className={`divide-y divide-base-200 transition-opacity duration-200 ${isFetching ? 'opacity-50 pointer-events-none' : ''}`}>
          {reviews.map((review) => (
            <ReviewItem
              key={review.id}
              review={review}
              actions={
                !review.isMyReview ? (
                  <button
                    onClick={() => handleHelpful(review.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs border transition-colors"
                    style={
                      review.isHelpful
                        ? { borderColor: '#346AFF', color: '#346AFF', backgroundColor: 'rgba(52,106,255,0.05)' }
                        : { borderColor: '#E5E7EB', color: '#888888' }
                    }
                  >
                    👍 도움이 돼요{review.helpfulCount > 0 ? ` (${review.helpfulCount})` : ''}
                  </button>
                ) : null
              }
            />
          ))}
        </div>
      )}

      {/* Section 5: 페이지네이션 */}
      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

    </div>
  )
}
