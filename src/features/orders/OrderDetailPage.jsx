import { useParams, Link } from 'react-router-dom'
import { useGetOrderQuery, useCancelOrderMutation } from './ordersApi'
import Spinner from '../../shared/components/Spinner'
import ErrorState from '../../shared/components/ErrorState'
import Toast from '../../shared/components/Toast'
import { useToast } from '../../shared/hooks/useToast'
import { formatPrice, formatDateTime, formatDate, maskPhone } from '../../shared/utils/formatters'
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE, CANCELLABLE_STATUSES } from '../../shared/utils/constants'
import StatusBadge from './components/StatusBadge'

const PAYMENT_METHOD_LABEL = {
  card: '신용/체크카드',
  kakao_pay: '카카오페이',
  naver_pay: '네이버페이',
  bank_transfer: '무통장입금',
}

export default function OrderDetailPage() {
  const { id } = useParams()
  const { data: order, isLoading, isError, refetch } = useGetOrderQuery(id)
  const [cancelOrder, { isLoading: isCancelling }] = useCancelOrderMutation()
  const { toasts, toast } = useToast()

  if (isLoading) return <Spinner />
  if (isError) return <ErrorState onRetry={refetch} />
  if (!order) return <div className="text-center py-20 text-base-content/50">주문을 찾을 수 없습니다</div>

  const canCancel = CANCELLABLE_STATUSES.includes(order.status)

  const handleCancel = async () => {
    if (!confirm('주문을 취소하시겠습니까?')) return
    const result = await cancelOrder(order.id)
    if (result.error) toast('주문 취소에 실패했습니다. 다시 시도해 주세요.', 'error')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Toast toasts={toasts} />

      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/my/orders" className="btn btn-ghost btn-sm">← 주문내역</Link>
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold">{order.orderNumber}</h1>
            <StatusBadge status={order.status} />
          </div>
          <p className="text-xs text-[#888888] mt-0.5">{formatDateTime(order.createdAt)}</p>
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body gap-4">
          <h2 className="font-bold">주문 상품</h2>
          {order.items.map((item) => (
            <div key={item.productId} className="flex items-center gap-4">
              <img
                src={item.imageUrl}
                alt={item.name}
                className="w-16 h-16 object-cover rounded-lg bg-base-200 shrink-0"
              />
              <div className="flex-1">
                <Link
                  to={`/products/${item.productId}`}
                  className="font-medium text-sm hover:text-primary transition-colors"
                >
                  {item.name}
                </Link>
                <p className="text-sm text-base-content/60 mt-1">
                  {formatPrice(item.price)} × {item.quantity}개
                </p>
              </div>
              <p className="font-bold text-sm">{formatPrice(item.price * item.quantity)}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body gap-2">
          <h2 className="font-bold mb-2">결제 정보</h2>
          {[
            ['상품금액', formatPrice(order.payment.amount - order.shippingFee + order.pointsUsed)],
            ['배송비', order.shippingFee === 0 ? '무료' : formatPrice(order.shippingFee)],
            ['포인트 사용', order.pointsUsed > 0 ? `-${formatPrice(order.pointsUsed)}` : '-'],
            ['결제수단', PAYMENT_METHOD_LABEL[order.payment.method] || order.payment.method],
          ].map(([label, value]) => (
            <div key={label} className="flex justify-between text-sm">
              <span className="text-base-content/60">{label}</span>
              <span>{value}</span>
            </div>
          ))}
          <div className="divider my-1"></div>
          <div className="flex justify-between font-bold">
            <span>최종 결제금액</span>
            <span className="text-primary text-lg">{formatPrice(order.payment.amount)}</span>
          </div>
          {order.pointsEarned > 0 && (
            <p className="text-xs text-success text-right">{order.pointsEarned.toLocaleString()}P 적립 예정</p>
          )}
        </div>
      </div>

      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h2 className="font-bold mb-2">배송지</h2>
          <div className="text-sm space-y-1 text-base-content/70">
            <p className="font-medium text-base-content">{order.shippingAddress.recipient}</p>
            <p>{maskPhone(order.shippingAddress.phone)}</p>
            <p>[{order.shippingAddress.zipCode}] {order.shippingAddress.address}</p>
            <p>{order.shippingAddress.detailAddress}</p>
          </div>
          {order.estimatedDelivery && order.status === 'shipping' && (
            <p className="text-xs text-[#00891A] font-medium mt-2">
              {formatDate(order.estimatedDelivery + 'T00:00:00Z')} 도착 보장
            </p>
          )}
        </div>
      </div>

      {canCancel && (
        <button
          className="btn btn-error btn-outline w-full"
          onClick={handleCancel}
          disabled={isCancelling}
        >
          {isCancelling ? <span className="loading loading-spinner loading-sm"></span> : '주문 취소'}
        </button>
      )}
    </div>
  )
}
