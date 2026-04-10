import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetMyReviewsQuery, useDeleteReviewMutation, useUpdateReviewMutation } from './reviewsApi'
import Spinner from '../../shared/components/Spinner'
import ErrorState from '../../shared/components/ErrorState'
import Toast from '../../shared/components/Toast'
import { useToast } from '../../shared/hooks/useToast'
import { formatDate } from '../../shared/utils/formatters'

function StarRating({ rating }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <span key={n} className={`text-sm ${n <= rating ? 'text-yellow-400' : 'text-base-content/20'}`}>★</span>
      ))}
    </div>
  )
}

function StarRatingInput({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          onClick={() => onChange(n)}
          className={`text-xl transition-colors ${n <= value ? 'text-yellow-400' : 'text-base-content/20'} hover:text-yellow-400`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

export default function MyReviewsPage() {
  const { data: reviews = [], isLoading, isError, refetch } = useGetMyReviewsQuery()
  const [deleteReview] = useDeleteReviewMutation()
  const [updateReview, { isLoading: isUpdating }] = useUpdateReviewMutation()
  const [editingId, setEditingId] = useState(null)
  const [editForm, setEditForm] = useState({ rating: 5, content: '' })
  const [editError, setEditError] = useState('')
  const { toasts, toast } = useToast()

  const handleEditStart = (review) => {
    setEditingId(review.id)
    setEditForm({ rating: review.rating, content: review.content })
    setEditError('')
  }

  const handleEditSubmit = async (e, productId) => {
    e.preventDefault()
    if (editForm.content.length < 10) {
      setEditError('내용을 10자 이상 입력해주세요')
      return
    }
    setEditError('')
    const result = await updateReview({ id: editingId, productId, ...editForm })
    if (result.error) {
      toast('리뷰 수정에 실패했습니다', 'error')
    } else {
      setEditingId(null)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('리뷰를 삭제하시겠습니까?')) return
    const result = await deleteReview(id)
    if (result.error) toast('리뷰 삭제에 실패했습니다', 'error')
  }

  if (isLoading) return <Spinner />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toast toasts={toasts} />

      {/* 페이지 헤더 */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">내 리뷰</h1>
        {reviews.length > 0 && (
          <span className="text-sm text-base-content/50">총 {reviews.length}개</span>
        )}
      </div>

      {reviews.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <p className="text-5xl mb-4">✍️</p>
          <p className="font-medium text-base-content/70 mb-1">작성한 리뷰가 없습니다</p>
          <p className="text-sm mb-6">배송 완료된 상품에 첫 리뷰를 남겨보세요</p>
          <Link to="/my/orders" className="btn btn-primary btn-sm">배송 완료 주문 보기</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => (
            <div key={review.id} className="bg-base-100 border border-base-200 rounded-xl overflow-hidden">
              {editingId === review.id ? (
                // 수정 폼
                <form onSubmit={(e) => handleEditSubmit(e, review.productId)} className="p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-medium">평점</span>
                    <StarRatingInput
                      value={editForm.rating}
                      onChange={(n) => setEditForm((f) => ({ ...f, rating: n }))}
                    />
                  </div>
                  <textarea
                    className={`textarea textarea-bordered w-full text-sm resize-none ${editError ? 'textarea-error' : ''}`}
                    rows={4}
                    placeholder="리뷰 내용을 입력해주세요 (최소 10자)"
                    value={editForm.content}
                    onChange={(e) => {
                      setEditForm((f) => ({ ...f, content: e.target.value }))
                      if (editError) setEditError('')
                    }}
                  />
                  {editError && <p className="text-error text-xs">{editError}</p>}
                  <div className="flex gap-2">
                    <button type="submit" className="btn btn-primary btn-sm" disabled={isUpdating}>
                      {isUpdating ? <span className="loading loading-spinner loading-xs" /> : '저장'}
                    </button>
                    <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>
                      취소
                    </button>
                  </div>
                </form>
              ) : (
                // 리뷰 카드
                <>
                  {/* 메타 행: 별점 + 날짜 + 액션 버튼 */}
                  <div className="px-4 pt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <StarRating rating={review.rating} />
                      <span className="text-xs text-base-content/50">{formatDate(review.createdAt)}</span>
                    </div>
                    <div className="flex gap-1">
                      <button
                        className="btn btn-ghost btn-xs text-base-content/50 hover:text-primary"
                        onClick={() => handleEditStart(review)}
                      >
                        수정
                      </button>
                      <button
                        className="btn btn-ghost btn-xs text-base-content/50 hover:text-error"
                        onClick={() => handleDelete(review.id)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>

                  {/* 상품 정보 박스 */}
                  <div className="mx-4 mt-2 px-3 py-2 bg-base-200 rounded-lg">
                    <Link
                      to={`/products/${review.productId}`}
                      className="text-xs text-base-content/70 hover:text-primary transition-colors"
                    >
                      상품 #{review.productId} 보러가기 →
                    </Link>
                  </div>

                  {/* 리뷰 본문 */}
                  <p className="px-4 py-3 text-sm leading-relaxed text-base-content/80">
                    {review.content}
                  </p>

                  {/* 리뷰 이미지 */}
                  {review.imageUrl && (
                    <div className="px-4 pb-4">
                      <img
                        src={review.imageUrl}
                        alt="리뷰 이미지"
                        className="w-24 h-24 object-cover rounded-lg border border-base-200"
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
