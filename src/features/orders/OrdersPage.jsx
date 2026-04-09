import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useGetOrdersQuery } from './ordersApi'
import OrderCard from './components/OrderCard'
import PeriodFilter from './components/PeriodFilter'
import Spinner from '../../shared/components/Spinner'
import ErrorState from '../../shared/components/ErrorState'

function isWithinMonths(isoString, months) {
  if (months === 0) return true
  const from = new Date()
  from.setMonth(from.getMonth() - months)
  return new Date(isoString) >= from
}

export default function OrdersPage() {
  const { data: orders = [], isLoading, isError, refetch } = useGetOrdersQuery()
  const [period, setPeriod] = useState(3)

  const filtered = useMemo(
    () => orders.filter((o) => isWithinMonths(o.createdAt, period)),
    [orders, period]
  )

  if (isLoading) return <Spinner />
  if (isError) return <ErrorState onRetry={refetch} />

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-lg font-bold">주문내역</h2>
        <PeriodFilter value={period} onChange={setPeriod} />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-20 text-[#888888]">
          <p className="text-5xl mb-4">📦</p>
          <p className="mb-4">해당 기간의 주문 내역이 없습니다</p>
          <Link to="/products" className="btn btn-primary btn-sm">쇼핑하러 가기</Link>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((order) => (
            <OrderCard key={order.id} order={order} />
          ))}
        </div>
      )}
    </div>
  )
}
