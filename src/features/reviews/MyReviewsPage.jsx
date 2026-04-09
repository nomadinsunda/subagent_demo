import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useGetMyReviewsQuery, useDeleteReviewMutation, useUpdateReviewMutation } from './reviewsApi'
import Spinner from '../../shared/components/Spinner'
import ErrorState from '../../shared/components/ErrorState'
import Toast from '../../shared/components/Toast'
import { useToast } from '../../shared/hooks/useToast'
import { formatDate, formatRating } from '../../shared/utils/formatters'

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
      <h1 className="text-2xl font-bold">내 리뷰</h1>

      {reviews.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <p className="text-5xl mb-4">✍️</p>
          <p className="mb-4">작성한 리뷰가 없습니다</p>
          <Link to="/my/orders" className="btn btn-primary btn-sm">배송 완료 주문에서 리뷰 작성</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <div key={review.id} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body gap-3">
                {editingId === review.id ? (
                  <form onSubmit={(e) => handleEditSubmit(e, review.productId)} className="space-y-3">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">평점</span>
                      <div className="rating rating-sm">
                        {[1, 2, 3, 4, 5].map((n) => (
                          <input
                            key={n}
                            type="radio"
                            name="rating"
                            className="mask mask-star-2 bg-yellow-400"
                            checked={editForm.rating === n}
                            onChange={() => setEditForm((f) => ({ ...f, rating: n }))}
                          />
                        ))}
                      </div>
                    </div>
                    <textarea
                      className={`textarea textarea-bordered w-full ${editError ? 'textarea-error' : ''}`}
                      rows={4}
                      value={editForm.content}
                      onChange={(e) => {
                        setEditForm((f) => ({ ...f, content: e.target.value }))
                        if (editError) setEditError('')
                      }}
                      required
                    />
                    {editError && <p className="text-error text-xs">{editError}</p>}
                    <div className="flex gap-2">
                      <button type="submit" className="btn btn-primary btn-sm" disabled={isUpdating}>저장</button>
                      <button type="button" className="btn btn-ghost btn-sm" onClick={() => setEditingId(null)}>취소</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex items-center justify-between">
                      <div>
                        <Link
                          to={`/products/${review.productId}`}
                          className="font-medium text-sm hover:text-primary transition-colors"
                        >
                          상품 #{review.productId} 보기
                        </Link>
                        <p className="text-xs text-base-content/50 mt-0.5">{formatDate(review.createdAt)}</p>
                      </div>
                      <span className="text-yellow-500 text-sm">{formatRating(review.rating)}</span>
                    </div>
                    <p className="text-sm leading-relaxed">{review.content}</p>
                    {review.imageUrl && (
                      <img src={review.imageUrl} alt="리뷰 이미지" className="w-20 h-20 object-cover rounded-lg" />
                    )}
                    <div className="flex gap-2 justify-end">
                      <button className="btn btn-ghost btn-xs" onClick={() => handleEditStart(review)}>수정</button>
                      <button className="btn btn-ghost btn-xs text-error" onClick={() => handleDelete(review.id)}>삭제</button>
                    </div>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
