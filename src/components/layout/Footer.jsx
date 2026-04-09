import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer footer-center p-10 bg-base-200 text-base-content mt-auto">
      <nav className="grid grid-flow-col gap-4 text-sm">
        <Link to="/products" className="link link-hover">전체 상품</Link>
        <a className="link link-hover">이용약관</a>
        <a className="link link-hover">개인정보처리방침</a>
        <a className="link link-hover">고객센터</a>
      </nav>
      <aside>
        <p className="font-bold text-lg">🐾 멍샵</p>
        <p className="text-base-content/60 text-sm">우리 강아지를 위한 모든 것</p>
        <p className="text-base-content/40 text-xs mt-2">© 2025 멍샵. All rights reserved.</p>
      </aside>
    </footer>
  )
}
