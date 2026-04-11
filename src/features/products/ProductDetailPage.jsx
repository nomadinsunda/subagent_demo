import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useGetProductQuery } from './productsApi'
import { useGetProductInquiriesQuery, useCreateInquiryMutation } from '../inquiries/inquiriesApi'
import ProductReviewSection from './components/ProductReviewSection'
import { useAddToCartMutation } from '../cart/cartApi'
import Spinner from '../../shared/components/Spinner'
import ErrorState from '../../shared/components/ErrorState'
import Toast from '../../shared/components/Toast'
import { useToast } from '../../shared/hooks/useToast'
import { formatPrice, formatDate } from '../../shared/utils/formatters'
import { CATEGORY_LABEL, INQUIRY_TYPE_LABEL, SHIPPING_FREE_THRESHOLD, SHIPPING_FEE } from '../../shared/utils/constants'
import { useAuth } from '../auth/useAuth'

export default function ProductDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { isLoggedIn } = useAuth()
  const [quantity, setQuantity] = useState(1)
  const [activeTab, setActiveTab] = useState('reviews')
  const [inquiryForm, setInquiryForm] = useState({ type: 'product', title: '', content: '', isSecret: false })
  const [inquiryErrors, setInquiryErrors] = useState({})
  const [showInquiryForm, setShowInquiryForm] = useState(false)
  const { toasts, toast } = useToast()

  const { data: product, isLoading, isError, refetch } = useGetProductQuery(id)
  const { data: inquiries = [] } = useGetProductInquiriesQuery(id)
  const [createInquiry, { isLoading: isSubmitting }] = useCreateInquiryMutation()
  const [addToCart, { isLoading: isAddingToCart }] = useAddToCartMutation()
  const [cartAdded, setCartAdded] = useState(false)

  if (isLoading) return <Spinner />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!product) return <div className="text-center py-20 text-base-content/50">상품을 찾을 수 없습니다</div>

  const subtotal = product.salePrice * quantity
  const shippingFee = subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE

  const handleAddToCart = async () => {
    if (!isLoggedIn) return navigate('/login', { state: { from: location.pathname } })
    const result = await addToCart({ productId: Number(id), quantity })
    if (result.error) {
      toast('장바구니 추가에 실패했습니다', 'error')
    } else {
      setCartAdded(true)
      setTimeout(() => setCartAdded(false), 2000)
    }
  }

  const validateInquiry = () => {
    const errors = {}
    if (inquiryForm.title.length < 5) errors.title = '제목을 5자 이상 입력해주세요'
    if (inquiryForm.content.length < 10) errors.content = '내용을 10자 이상 입력해주세요'
    return errors
  }

  const handleInquirySubmit = async (e) => {
    e.preventDefault()
    const errors = validateInquiry()
    if (Object.keys(errors).length > 0) {
      setInquiryErrors(errors)
      return
    }
    setInquiryErrors({})
    if (!isLoggedIn) return navigate('/login', { state: { from: location.pathname } })
    const result = await createInquiry({ ...inquiryForm, productId: Number(id) })
    if (result.error) {
      toast('문의 등록에 실패했습니다. 다시 시도해 주세요.', 'error')
    } else {
      setInquiryForm({ type: 'product', title: '', content: '', isSecret: false })
      setShowInquiryForm(false)
      toast('문의가 등록되었습니다', 'success')
    }
  }

  return (
    <div className="space-y-10">
      <Toast toasts={toasts} />

      {/* 브레드크럼 */}
      <nav className="breadcrumbs text-sm">
        <ul>
          <li><Link to="/">홈</Link></li>
          <li><Link to="/products">상품</Link></li>
          <li><Link to={`/products?category=${product.category}`}>{CATEGORY_LABEL[product.category]}</Link></li>
          <li className="text-base-content/50 truncate max-w-xs">{product.name}</li>
        </ul>
      </nav>

      {/* 상품 메인 정보 */}
      <div className="grid md:grid-cols-2 gap-10">
        <figure className="rounded-2xl overflow-hidden aspect-[4/3] bg-base-200">
          <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover" />
        </figure>

        <div className="space-y-5">
          <div>
            <span className="badge badge-outline mb-2">{CATEGORY_LABEL[product.category]}</span>
            <h1 className="text-2xl font-bold">{product.name}</h1>
            <div className="flex items-center gap-2 mt-1 text-sm text-base-content/60">
              <span>{'★'.repeat(Math.round(product.averageRating))}{'☆'.repeat(5 - Math.round(product.averageRating))}</span>
              <span>{product.averageRating} ({product.reviewCount}개 리뷰)</span>
            </div>
          </div>

          <div className="space-y-1">
            {product.discountRate > 0 && (
              <div className="flex items-center gap-2">
                <span className="badge badge-error">{product.discountRate}% 할인</span>
                <span className="line-through text-base-content/40">{formatPrice(product.price)}</span>
              </div>
            )}
            <p className="text-3xl font-bold text-primary">{formatPrice(product.salePrice)}</p>
          </div>

          <p className="text-base-content/70 text-sm leading-relaxed">{product.description}</p>

          <div className="divider"></div>

          {/* 수량 선택 */}
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium w-16">수량</span>
            <div className="join">
              <button
                className="join-item btn btn-sm"
                onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              >−</button>
              <span className="join-item btn btn-sm btn-ghost pointer-events-none w-12">{quantity}</span>
              <button
                className="join-item btn btn-sm"
                onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
              >+</button>
            </div>
            <span className="text-sm text-base-content/50">재고 {product.stock}개</span>
          </div>

          {/* 금액 계산 */}
          <div className="bg-base-200 rounded-xl p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>상품금액</span>
              <span>{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>배송비</span>
              <span className={shippingFee === 0 ? 'text-success' : ''}>
                {shippingFee === 0 ? '무료' : formatPrice(shippingFee)}
              </span>
            </div>
            {subtotal < SHIPPING_FREE_THRESHOLD && (
              <p className="text-xs text-base-content/50">
                {formatPrice(SHIPPING_FREE_THRESHOLD - subtotal)} 더 구매 시 무료배송
              </p>
            )}
            <div className="flex justify-between font-bold text-base border-t pt-2 mt-2">
              <span>합계</span>
              <span className="text-primary">{formatPrice(subtotal + shippingFee)}</span>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              className={`btn btn-outline flex-1 ${cartAdded ? 'btn-success' : ''}`}
              disabled={product.stock === 0 || isAddingToCart}
              onClick={handleAddToCart}
            >
              {isAddingToCart
                ? <span className="loading loading-spinner loading-sm"></span>
                : cartAdded
                  ? '✓ 담겼습니다!'
                  : '장바구니 담기'}
            </button>
            <Link
              to="/cart"
              className={`btn btn-primary flex-1 ${product.stock === 0 ? 'btn-disabled' : ''}`}
            >
              바로 구매
            </Link>
          </div>
        </div>
      </div>

      {/* 탭: 리뷰 / 문의 */}
      <div>
        <div role="tablist" className="tabs tabs-bordered mb-6">
          <button
            role="tab"
            className={`tab ${activeTab === 'reviews' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('reviews')}
          >
            리뷰 ({product.reviewCount ?? 0})
          </button>
          <button
            role="tab"
            className={`tab ${activeTab === 'inquiries' ? 'tab-active' : ''}`}
            onClick={() => setActiveTab('inquiries')}
          >
            상품 문의 ({inquiries.length})
          </button>
        </div>

        {/* 리뷰 탭 */}
        {activeTab === 'reviews' && <ProductReviewSection productId={id} />}

        {/* 문의 탭 */}
        {activeTab === 'inquiries' && (
          <div className="space-y-4">
            <button
              className="btn btn-outline btn-sm"
              onClick={() => {
                if (!isLoggedIn) navigate('/login', { state: { from: location.pathname } })
                else {
                  setShowInquiryForm(!showInquiryForm)
                  setInquiryErrors({})
                }
              }}
            >
              {showInquiryForm ? '취소' : '문의하기'}
            </button>

            {showInquiryForm && (
              <form onSubmit={handleInquirySubmit} className="card bg-base-200 p-5 space-y-3">
                <select
                  className="select select-bordered select-sm w-full max-w-xs"
                  value={inquiryForm.type}
                  onChange={(e) => setInquiryForm((f) => ({ ...f, type: e.target.value }))}
                >
                  {Object.entries(INQUIRY_TYPE_LABEL).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>

                <div>
                  <input
                    type="text"
                    className={`input input-bordered input-sm w-full ${inquiryErrors.title ? 'input-error' : ''}`}
                    placeholder="제목 (5자 이상)"
                    value={inquiryForm.title}
                    onChange={(e) => {
                      setInquiryForm((f) => ({ ...f, title: e.target.value }))
                      if (inquiryErrors.title) setInquiryErrors((ie) => ({ ...ie, title: '' }))
                    }}
                    required
                  />
                  {inquiryErrors.title && <p className="text-error text-xs mt-1">{inquiryErrors.title}</p>}
                </div>

                <div>
                  <textarea
                    className={`textarea textarea-bordered w-full ${inquiryErrors.content ? 'textarea-error' : ''}`}
                    placeholder="내용을 입력해 주세요 (10자 이상)"
                    rows={4}
                    value={inquiryForm.content}
                    onChange={(e) => {
                      setInquiryForm((f) => ({ ...f, content: e.target.value }))
                      if (inquiryErrors.content) setInquiryErrors((ie) => ({ ...ie, content: '' }))
                    }}
                    required
                  />
                  {inquiryErrors.content && <p className="text-error text-xs mt-1">{inquiryErrors.content}</p>}
                </div>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="checkbox checkbox-sm"
                    checked={inquiryForm.isSecret}
                    onChange={(e) => setInquiryForm((f) => ({ ...f, isSecret: e.target.checked }))}
                  />
                  <span className="text-sm">비밀 문의</span>
                </label>
                <button type="submit" className="btn btn-primary btn-sm" disabled={isSubmitting}>
                  문의 등록
                </button>
              </form>
            )}

            {inquiries.length === 0 ? (
              <div className="text-center py-12 text-base-content/50">
                <p className="text-4xl mb-3">💬</p>
                <p>등록된 문의가 없습니다</p>
              </div>
            ) : (
              inquiries.map((inquiry) => (
                <div key={inquiry.id} className="collapse collapse-arrow bg-base-200">
                  <input type="checkbox" />
                  <div className="collapse-title">
                    <div className="flex items-center gap-3">
                      <span className={`badge badge-sm ${inquiry.status === 'answered' ? 'badge-success' : 'badge-warning'}`}>
                        {inquiry.status === 'answered' ? '답변 완료' : '답변 대기'}
                      </span>
                      <span className="text-sm font-medium">
                        {inquiry.isSecret ? '🔒 비밀 문의입니다' : inquiry.title}
                      </span>
                    </div>
                  </div>
                  <div className="collapse-content text-sm space-y-3">
                    {!inquiry.isSecret && (
                      <>
                        <p className="text-base-content/70">{inquiry.content}</p>
                        {inquiry.answer && (
                          <div className="bg-base-100 rounded-lg p-3 border-l-4 border-primary">
                            <p className="text-xs font-bold text-primary mb-1">
                              {inquiry.answer.adminName} · {formatDate(inquiry.answer.answeredAt)}
                            </p>
                            <p>{inquiry.answer.content}</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  )
}
