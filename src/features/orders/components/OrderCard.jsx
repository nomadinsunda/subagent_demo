import { Link } from 'react-router-dom'
import StatusBadge from './StatusBadge'
import { formatPrice, formatDate } from '../../../shared/utils/formatters'
import { ORDER_STATUS } from '../../../shared/utils/constants'

export default function OrderCard({ order }) {
  const firstItem = order.items[0]
  const extraCount = order.items.length - 1

  const renderActionButton = () => {
    switch (order.status) {
      case ORDER_STATUS.SHIPPING:
        return (
          <button className="btn btn-xs btn-outline text-[#346AFF] border-[#346AFF] opacity-50 cursor-not-allowed" disabled>
            배송 조회
          </button>
        )
      case ORDER_STATUS.DELIVERED:
        return (
          <Link to="/my/reviews" className="btn btn-xs btn-outline text-[#00891A] border-[#00891A]">
            리뷰 작성
          </Link>
        )
      case ORDER_STATUS.WAITING:
      case ORDER_STATUS.PREPARING:
        return (
          <Link to={`/my/orders/${order.id}`} className="btn btn-xs btn-outline text-error border-error">
            주문 취소
          </Link>
        )
      default:
        return null
    }
  }

  return (
    <div className="card bg-base-100 shadow-sm border border-base-200">
      {/* 카드 헤더 */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-base-200 bg-base-50">
        <div className="flex items-center gap-3">
          <StatusBadge status={order.status} />
          <div>
            <span className="text-xs font-semibold text-base-content">{order.orderNumber}</span>
            <span className="text-xs text-[#888888] ml-2">{formatDate(order.createdAt)}</span>
          </div>
        </div>
        <Link
          to={`/my/orders/${order.id}`}
          className="text-xs text-[#888888] hover:text-[#346AFF] transition-colors"
        >
          상세 보기 →
        </Link>
      </div>

      {/* 카드 본문 */}
      <div className="px-5 py-4">
        <div className="flex items-center gap-4">
          <img
            src={firstItem.imageUrl}
            alt={firstItem.name}
            className="w-16 h-16 object-cover rounded-lg bg-base-200 shrink-0"
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{firstItem.name}</p>
            <p className="text-xs text-[#888888] mt-0.5">
              {formatPrice(firstItem.price)} × {firstItem.quantity}개
              {extraCount > 0 && (
                <span className="ml-1 text-[#346AFF] font-medium">외 {extraCount}개</span>
              )}
            </p>
            {order.status === ORDER_STATUS.SHIPPING && order.estimatedDelivery && (
              <p className="text-xs text-[#00891A] font-medium mt-1">
                {formatDate(order.estimatedDelivery + 'T00:00:00Z')} 도착 보장
              </p>
            )}
          </div>
        </div>

        {/* 카드 푸터 */}
        <div className="flex items-center justify-between mt-4 pt-3 border-t border-base-200">
          <div className="text-sm">
            <span className="font-bold">{formatPrice(order.payment.amount)}</span>
            {order.shippingFee === 0 && (
              <span className="text-[#00891A] text-xs ml-1 font-medium">무료배송</span>
            )}
          </div>
          <div className="flex gap-2">
            {renderActionButton()}
            <Link to={`/my/orders/${order.id}`} className="btn btn-xs btn-ghost text-[#888888]">
              상세
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
