import { useGetMyPointsQuery } from './pointsApi'
import Spinner from '../../shared/components/Spinner'
import { formatDate } from '../../shared/utils/formatters'
import { POINT_TYPE_LABEL } from '../../shared/utils/constants'

export default function PointsPage() {
  const { data, isLoading } = useGetMyPointsQuery()

  if (isLoading) return <Spinner />

  const sortedHistory = [...(data?.history || [])].sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  )

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">포인트</h1>

      {/* 잔액 카드 */}
      <div className="card bg-primary text-primary-content shadow-lg">
        <div className="card-body items-center text-center py-10">
          <p className="text-sm opacity-80">현재 보유 포인트</p>
          <p className="text-5xl font-bold mt-1">
            {data?.balance.toLocaleString()}<span className="text-2xl ml-1">P</span>
          </p>
          <p className="text-xs opacity-60 mt-3">1포인트 = 1원 · 구매금액의 1% 적립</p>
        </div>
      </div>

      {/* 적립 안내 */}
      <div className="grid grid-cols-2 gap-3 text-center">
        {[
          { label: '구매 적립', value: '결제금액의 1%' },
          { label: '텍스트 리뷰', value: '50P' },
          { label: '포토 리뷰', value: '100P' },
          { label: '유효기간', value: '적립일로부터 1년' },
        ].map(({ label, value }) => (
          <div key={label} className="bg-base-200 rounded-xl p-3">
            <p className="text-xs text-base-content/50">{label}</p>
            <p className="font-bold text-sm mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* 포인트 내역 */}
      <div className="card bg-base-100 shadow-sm border border-base-200">
        <div className="card-body">
          <h2 className="font-bold mb-3">포인트 내역</h2>
          {sortedHistory.length === 0 ? (
            <p className="text-center py-8 text-base-content/50 text-sm">포인트 내역이 없습니다</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="table table-sm">
                <thead>
                  <tr>
                    <th>일자</th>
                    <th>구분</th>
                    <th>내역</th>
                    <th className="text-right">변동</th>
                    <th className="text-right">잔액</th>
                  </tr>
                </thead>
                <tbody>
                  {sortedHistory.map((item) => (
                    <tr key={item.id}>
                      <td className="text-xs text-base-content/50 whitespace-nowrap">
                        {formatDate(item.createdAt)}
                      </td>
                      <td>
                        <span className="badge badge-xs badge-outline">
                          {POINT_TYPE_LABEL[item.type]}
                        </span>
                      </td>
                      <td className="text-xs text-base-content/70">{item.description}</td>
                      <td className={`text-right font-bold text-sm ${item.amount > 0 ? 'text-success' : 'text-error'}`}>
                        {item.amount > 0 ? '+' : ''}{item.amount.toLocaleString()}P
                      </td>
                      <td className="text-right text-sm">{item.balance.toLocaleString()}P</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
