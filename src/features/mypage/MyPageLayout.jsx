import { Outlet, NavLink } from 'react-router-dom'
import { useAuth } from '../auth/useAuth'
import { useGetMyPointsQuery } from '../user/pointsApi'

const MOCK_COUPON_COUNT = 3
const MOCK_MEMBERSHIP = '골드'

const NAV_GROUPS = [
  {
    label: '쇼핑정보',
    items: [
      { to: '/my/orders', label: '주문내역' },
      { to: '/cart', label: '장바구니' },
    ],
  },
  {
    label: 'MY활동',
    items: [
      { to: '/my/reviews', label: '내 리뷰' },
      { to: '/my/inquiries', label: '문의내역' },
    ],
  },
  {
    label: '계정',
    items: [
      { to: '/my/profile', label: '프로필 관리' },
      { to: '/my/points', label: '포인트' },
    ],
  },
]

export default function MyPageLayout() {
  const { user } = useAuth()
  const { data: pointData } = useGetMyPointsQuery()
  const pointBalance = pointData?.balance ?? 0

  return (
    <div className="flex gap-8 items-start">
      {/* LNB 사이드바 */}
      <aside className="w-48 shrink-0 hidden md:block">
        <div className="mb-5">
          <p className="text-base font-bold text-base-content">{user?.name}님</p>
          <p className="text-xs text-[#888888] mt-0.5">{user?.email}</p>
        </div>
        <nav className="space-y-5">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="text-xs font-bold text-[#888888] uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <ul className="space-y-0.5">
                {group.items.map((item) => (
                  <li key={item.to}>
                    <NavLink
                      to={item.to}
                      className={({ isActive }) =>
                        `block px-3 py-2 rounded-lg text-sm transition-colors ${
                          isActive
                            ? 'bg-[#346AFF]/10 text-[#346AFF] font-semibold'
                            : 'text-base-content hover:bg-base-200'
                        }`
                      }
                    >
                      {item.label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* 메인 영역 */}
      <div className="flex-1 min-w-0 space-y-6">
        {/* Dashboard 요약 */}
        <div className="grid grid-cols-3 gap-3">
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-4 text-center">
              <p className="text-xs text-[#888888]">포인트</p>
              <p className="text-lg font-bold text-[#346AFF]">{pointBalance.toLocaleString()}P</p>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-4 text-center">
              <p className="text-xs text-[#888888]">쿠폰</p>
              <p className="text-lg font-bold text-base-content">{MOCK_COUPON_COUNT}장</p>
            </div>
          </div>
          <div className="card bg-base-100 border border-base-200 shadow-sm">
            <div className="card-body p-4 text-center">
              <p className="text-xs text-[#888888]">멤버십</p>
              <p className="text-lg font-bold text-[#00891A]">{MOCK_MEMBERSHIP}</p>
            </div>
          </div>
        </div>

        {/* 페이지 컨텐츠 */}
        <Outlet />
      </div>
    </div>
  )
}
