import { formatDate } from '../../../shared/utils/formatters'

export function StarRating({ rating, size = 'sm' }) {
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

/**
 * 공통 리뷰 카드
 *
 * @param {object} review  - reviewsApi 응답의 review 객체
 * @param {ReactNode} actions - 카드 하단 액션 영역 (도움돼요 버튼 | 수정·삭제 버튼 등)
 */
export default function ReviewItem({ review, actions }) {
  const initial = review.userName?.[0] ?? '?'

  return (
    <div className="py-5">
      {/* 작성자 정보 + 별점 */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {review.profileImage ? (
            <img
              src={review.profileImage}
              alt={review.userName}
              className="w-8 h-8 rounded-full object-cover shrink-0"
            />
          ) : (
            <div className="w-8 h-8 rounded-full bg-base-300 flex items-center justify-center text-xs font-semibold text-base-content/70 shrink-0">
              {initial}
            </div>
          )}
          <div>
            <p className="text-sm font-medium leading-none" style={{ color: '#111111' }}>{review.userName}</p>
            <p className="text-xs mt-0.5" style={{ color: '#888888' }}>{formatDate(review.createdAt)}</p>
          </div>
        </div>
        <StarRating rating={review.rating} />
      </div>

      {/* 키워드 태그 */}
      {review.tags?.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-2">
          {review.tags.map((tag) => (
            <span key={tag} className="badge badge-ghost badge-sm text-xs">{tag}</span>
          ))}
        </div>
      )}

      {/* 본문 */}
      <p
        className="text-sm mb-3"
        style={{ color: '#333333', lineHeight: 1.6, letterSpacing: '-0.01em' }}
      >
        {review.content}
      </p>

      {/* 이미지 (최대 5장) */}
      {review.images?.length > 0 && (
        <div className="flex gap-2 mb-3">
          {review.images.slice(0, 5).map((src, i) => (
            <img
              key={i}
              src={src}
              alt={`리뷰 이미지 ${i + 1}`}
              className="w-20 h-20 object-cover rounded-lg border border-base-200 aspect-square"
            />
          ))}
        </div>
      )}

      {/* 액션 슬롯 */}
      {actions}
    </div>
  )
}
