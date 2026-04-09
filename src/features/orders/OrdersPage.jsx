import { Link } from 'react-router-dom'
import { useGetOrdersQuery } from './ordersApi'
import Spinner from '../../shared/components/Spinner'
import { formatPrice, formatDate } from '../../shared/utils/formatters'
import { ORDER_STATUS_LABEL, ORDER_STATUS_BADGE } from '../../shared/utils/constants'

export default function OrdersPage() {
  const { data: orders = [], isLoading } = useGetOrdersQuery()

  if (isLoading) return <Spinner />

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">내 주문</h1>

      {orders.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <p className="text-5xl mb-4">📦</p>
          <p className="mb-4">아직 주문 내역이 없습니다</p>
          <Link to="/products" className="btn btn-primary btn-sm">쇼핑하러 가기</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <div key={order.id} className="card bg-base-100 shadow-sm border border-base-200">
              <div className="card-body p-5 gap-3">
                {/* 주문 헤더 */}
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div className="flex items-center gap-3">
                    <span className="font-bold text-sm">주문 #{order.id}</span>
                    <span className={`badge badge-sm ${ORDER_STATUS_BADGE[order.status]}`}>
                      {ORDER_STATUS_LABEL[order.status]}
                    </span>
                  </div>
                  <span className="text-xs text-base-content/50">{formatDate(order.createdAt)}</span>
                </div>

                {/* 주문 상품 목록 */}
                <div className="space-y-2">
                  {order.items.map((item) => (
                    <div key={item.productId} className="flex items-center gap-3">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-14 h-14 object-cover rounded-lg bg-base-200 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{item.name}</p>
                        <p className="text-xs text-base-content/50">
                          {formatPrice(item.price)} × {item.quantity}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* 결제 정보 */}
                <div className="flex items-center justify-between border-t pt-3 text-sm">
                  <span className="text-base-content/60">
                    총 {formatPrice(order.payment.amount)}
                    {order.shippingFee === 0 && (
                      <span className="text-success ml-1 text-xs">(무료배송)</span>
                    )}
                  </span>
                  <Link to={`/my/orders/${order.id}`} className="btn btn-outline btn-xs">
                    상세 보기
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
