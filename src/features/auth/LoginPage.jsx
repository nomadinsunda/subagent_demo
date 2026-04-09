import { useState, useEffect } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useLoginMutation } from './authApi'
import { useAuth } from './useAuth'
import { redirectToOAuth2 } from '../../shared/utils/oauth2'

export default function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn } = useAuth()
  const [login, { isLoading, error }] = useLoginMutation()
  const [form, setForm] = useState({ email: '', password: '' })

  const redirectTo = location.state?.from || '/'

  useEffect(() => {
    if (isLoggedIn) navigate(redirectTo, { replace: true })
  }, [isLoggedIn, navigate, redirectTo])

  const handleSubmit = async (e) => {
    e.preventDefault()
    await login(form)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body gap-5">
          <div className="text-center">
            <Link to="/" className="text-3xl font-bold text-primary">🐾 멍샵</Link>
            <p className="text-base-content/60 text-sm mt-1">로그인하고 쇼핑을 시작하세요</p>
          </div>

          {/* 이메일/비밀번호 로그인 */}
          <form onSubmit={handleSubmit} className="space-y-3">
            <label className="form-control">
              <div className="label"><span className="label-text">이메일</span></div>
              <input
                type="email"
                className="input input-bordered"
                placeholder="user@example.com"
                value={form.email}
                onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                required
              />
            </label>
            <label className="form-control">
              <div className="label"><span className="label-text">비밀번호</span></div>
              <input
                type="password"
                className="input input-bordered"
                placeholder="••••••••"
                value={form.password}
                onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))}
                required
              />
            </label>

            {error && (
              <div className="alert alert-error py-2 text-sm">
                <span>{error.data?.message || '로그인에 실패했습니다'}</span>
              </div>
            )}

            <div className="alert alert-info py-2 text-xs">
              <span>Mock 계정: user@example.com / password</span>
            </div>

            <button type="submit" className="btn btn-primary w-full" disabled={isLoading}>
              {isLoading ? <span className="loading loading-spinner loading-sm"></span> : '로그인'}
            </button>
          </form>

          <div className="divider text-sm">소셜 로그인</div>

          {/* 소셜 로그인 버튼 */}
          <div className="space-y-2">
            {[
              { provider: 'google', label: 'Google로 계속하기', color: 'btn-outline', icon: '🔵' },
              { provider: 'kakao', label: 'Kakao로 계속하기', color: 'btn-warning', icon: '💛' },
              { provider: 'naver', label: 'Naver로 계속하기', color: 'btn-success', icon: '🟢' },
            ].map(({ provider, label, color, icon }) => (
              <button
                key={provider}
                className={`btn ${color} w-full`}
                onClick={() => redirectToOAuth2(provider)}
              >
                <span>{icon}</span>
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
