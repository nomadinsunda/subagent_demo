import { Link, useNavigate } from 'react-router-dom'
import {
  useGetCartQuery,
  useUpdateCartItemMutation,
  useRemoveFromCartMutation,
  useClearCartMutation,
} from './cartApi'
import Spinner from '../../shared/components/Spinner'
import { formatPrice } from '../../shared/utils/formatters'
import { SHIPPING_FREE_THRESHOLD, SHIPPING_FEE } from '../../shared/utils/constants'

export default function CartPage() {
  const navigate = useNavigate()
  const { data: items = [], isLoading } = useGetCartQuery()
  const [updateItem] = useUpdateCartItemMutation()
  const [removeItem] = useRemoveFromCartMutation()
  const [clearCart, { isLoading: isClearing }] = useClearCartMutation()

  if (isLoading) return <Spinner />

  const subtotal = items.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingFee = items.length === 0 ? 0 : subtotal >= SHIPPING_FREE_THRESHOLD ? 0 : SHIPPING_FEE
  const total = subtotal + shippingFee

  const handleQuantity = (item, delta) => {
    const next = item.quantity + delta
    if (next < 1 || next > item.stock) return
    updateItem({ id: item.id, quantity: next })
  }

  const handleClear = async () => {
    if (!confirm('장바구니를 비우시겠습니까?')) return
    await clearCart()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">장바구니</h1>
        {items.length > 0 && (
          <button
            className="btn btn-ghost btn-sm text-error"
            onClick={handleClear}
            disabled={isClearing}
          >
            전체 삭제
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="text-center py-24 text-base-content/50">
          <p className="text-6xl mb-4">🛒</p>
          <p className="text-lg mb-6">장바구니가 비어 있습니다</p>
          <Link to="/products" className="btn btn-primary">쇼핑 계속하기</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-3 gap-6 items-start">
          {/* 상품 목록 */}
          <div className="lg:col-span-2 space-y-3">
            {items.map((item) => (
              <div key={item.id} className="card bg-base-100 shadow-sm border border-base-200">
                <div className="card-body p-4 flex-row gap-4 items-center">
                  <Link to={`/products/${item.productId}`} className="shrink-0">
                    <img
                      src={item.imageUrl}
                      alt={item.name}
                      className="w-20 h-20 object-cover rounded-lg bg-base-200"
                    />
                  </Link>
                  <div className="flex-1 min-w-0 space-y-2">
                    <Link
                      to={`/products/${item.productId}`}
                      className="font-medium text-sm line-clamp-2 hover:text-primary transition-colors"
                    >
                      {item.name}
                    </Link>
                    <p className="font-bold text-primary">{formatPrice(item.price)}</p>
                    <div className="flex items-center justify-between">
                      {/* 수량 조절 */}
                      <div className="join">
                        <button
                          className="join-item btn btn-xs"
                          onClick={() => handleQuantity(item, -1)}
                          disabled={item.quantity <= 1}
                        >−</button>
                        <span className="join-item btn btn-xs btn-ghost pointer-events-none w-10">
                          {item.quantity}
                        </span>
                        <button
                          className="join-item btn btn-xs"
                          onClick={() => handleQuantity(item, +1)}
                          disabled={item.quantity >= item.stock}
                        >+</button>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-sm">
                          {formatPrice(item.price * item.quantity)}
                        </span>
                        <button
                          className="btn btn-ghost btn-xs text-error"
                          onClick={() => removeItem(item.id)}
                        >✕</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 결제 요약 */}
          <div className="card bg-base-100 shadow-sm border border-base-200 sticky top-20">
            <div className="card-body gap-3">
              <h2 className="font-bold text-lg">주문 요약</h2>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-base-content/60">상품금액</span>
                  <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-base-content/60">배송비</span>
                  <span className={shippingFee === 0 ? 'text-success font-medium' : ''}>
                    {shippingFee === 0 ? '무료' : formatPrice(shippingFee)}
                  </span>
                </div>
                {subtotal > 0 && subtotal < SHIPPING_FREE_THRESHOLD && (
                  <p className="text-xs text-base-content/40 text-right">
                    {formatPrice(SHIPPING_FREE_THRESHOLD - subtotal)} 더 담으면 무료배송
                  </p>
                )}
              </div>

              <div className="divider my-0"></div>

              <div className="flex justify-between font-bold text-base">
                <span>합계</span>
                <span className="text-primary text-lg">{formatPrice(total)}</span>
              </div>

              <p className="text-xs text-success text-right">
                구매 시 {Math.floor(total * 0.01).toLocaleString()}P 적립 예정
              </p>

              <button
                className="btn btn-primary w-full mt-2"
                onClick={() => navigate('/my/orders')}
              >
                주문하기 ({items.length}개)
              </button>
              <Link to="/products" className="btn btn-ghost btn-sm w-full">
                쇼핑 계속하기
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
