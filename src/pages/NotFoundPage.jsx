import { Link } from 'react-router-dom'

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center">
      <div className="text-center space-y-5">
        <p className="text-8xl">🐾</p>
        <h1 className="text-6xl font-bold text-base-content/20">404</h1>
        <h2 className="text-xl font-bold">페이지를 찾을 수 없습니다</h2>
        <p className="text-base-content/60">요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
        <div className="flex gap-3 justify-center">
          <Link to="/" className="btn btn-primary">홈으로</Link>
          <Link to="/products" className="btn btn-outline">쇼핑하기</Link>
        </div>
      </div>
    </div>
  )
}
