import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../features/auth/useAuth'
import { useLogoutMutation } from '../../features/auth/authApi'
import { useGetCartQuery } from '../../features/cart/cartApi'
import { CATEGORY_LABEL } from '../../shared/utils/constants'

export default function Header() {
  const { isLoggedIn, user } = useAuth()
  const navigate = useNavigate()
  const [logoutMutation, { isLoading }] = useLogoutMutation()
  const { data: cartItems = [] } = useGetCartQuery(undefined, { skip: !isLoggedIn })
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  const handleLogout = async () => {
    await logoutMutation()
    navigate('/')
  }

  return (
    <header className="navbar bg-base-100 shadow-sm sticky top-0 z-50">
      {/* 로고 */}
      <div className="navbar-start">
        <div className="dropdown">
          <label tabIndex={0} className="btn btn-ghost lg:hidden">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h8m-8 6h16" />
            </svg>
          </label>
          <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-52">
            {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
              <li key={key}>
                <Link to={`/products?category=${key}`}>{label}</Link>
              </li>
            ))}
          </ul>
        </div>
        <Link to="/" className="btn btn-ghost text-xl font-bold text-primary">
          🐾 멍샵
        </Link>
      </div>

      {/* 카테고리 네비게이션 (데스크탑) */}
      <div className="navbar-center hidden lg:flex">
        <ul className="menu menu-horizontal px-1 gap-1">
          {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
            <li key={key}>
              <Link to={`/products?category=${key}`} className="text-sm">
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      {/* 우측 액션 */}
      <div className="navbar-end gap-1">
        {/* 장바구니 */}
        <Link to="/cart" className="btn btn-ghost btn-circle relative">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          {cartCount > 0 && (
            <span className="badge badge-primary badge-xs absolute -top-0.5 -right-0.5">
              {cartCount > 99 ? '99+' : cartCount}
            </span>
          )}
        </Link>

        {isLoggedIn ? (
          <div className="dropdown dropdown-end">
            <label tabIndex={0} className="btn btn-ghost btn-circle avatar placeholder">
              <div className="bg-primary text-primary-content rounded-full w-9">
                <span className="text-sm font-bold">{user?.name?.[0]}</span>
              </div>
            </label>
            <ul tabIndex={0} className="menu menu-sm dropdown-content mt-3 z-[1] p-2 shadow bg-base-100 rounded-box w-44">
              <li className="menu-title px-2 py-1 text-xs text-base-content/50">{user?.name}님</li>
              <li><Link to="/my/orders">내 주문</Link></li>
              <li><Link to="/my/reviews">내 리뷰</Link></li>
              <li><Link to="/my/points">포인트</Link></li>
              <li><Link to="/my/inquiries">문의 내역</Link></li>
              <li><Link to="/my/profile">프로필</Link></li>
              <li>
                <button onClick={handleLogout} disabled={isLoading} className="text-error">
                  로그아웃
                </button>
              </li>
            </ul>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            로그인
          </Link>
        )}
      </div>
    </header>
  )
}
