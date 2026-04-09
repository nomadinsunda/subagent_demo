import { Link } from 'react-router-dom'
import { useGetProductsQuery } from '../products/productsApi'
import ProductCard from '../products/ProductCard'
import Spinner from '../../shared/components/Spinner'
import { CATEGORY_LABEL } from '../../shared/utils/constants'

const CATEGORY_ICONS = {
  food: '🍖',
  accessories: '🦮',
  clothing: '👕',
  toys: '🎾',
  health: '💊',
  grooming: '✂️',
}

export default function HomePage() {
  const { data, isLoading } = useGetProductsQuery({ limit: 8, sort: 'newest' })

  return (
    <div className="space-y-12">
      {/* 히어로 섹션 */}
      <section className="hero bg-gradient-to-br from-primary/10 to-secondary/10 rounded-3xl py-16 px-8">
        <div className="hero-content text-center flex-col gap-6">
          <div className="text-6xl">🐾</div>
          <h1 className="text-4xl font-bold text-primary leading-tight">
            우리 강아지를 위한<br />모든 것이 여기에
          </h1>
          <p className="text-base-content/70 text-lg max-w-md">
            프리미엄 사료부터 스타일리시한 액세서리까지, 멍샵에서 반려견의 행복을 완성하세요.
          </p>
          <div className="flex gap-3 flex-wrap justify-center">
            <Link to="/products" className="btn btn-primary btn-lg">
              쇼핑 시작하기
            </Link>
            <Link to="/products?category=food" className="btn btn-outline btn-lg">
              베스트 사료 보기
            </Link>
          </div>
        </div>
      </section>

      {/* 카테고리 빠른 접근 */}
      <section>
        <h2 className="text-2xl font-bold mb-6">카테고리</h2>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
            <Link
              key={key}
              to={`/products?category=${key}`}
              className="card bg-base-200 hover:bg-primary/10 hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              <div className="card-body items-center text-center p-4 gap-2">
                <span className="text-3xl">{CATEGORY_ICONS[key]}</span>
                <span className="text-xs font-medium">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 배너 */}
      <section className="bg-primary text-primary-content rounded-2xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div>
          <p className="text-sm font-medium opacity-80 mb-1">한정 이벤트</p>
          <h3 className="text-2xl font-bold">5만원 이상 구매 시 배송비 무료!</h3>
          <p className="mt-2 opacity-80">지금 바로 사료와 간식을 함께 구매하고 배송비를 아끼세요.</p>
        </div>
        <Link to="/products?category=food" className="btn btn-secondary btn-lg whitespace-nowrap">
          사료 쇼핑하기
        </Link>
      </section>

      {/* 신규 상품 */}
      <section>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">최신 상품</h2>
          <Link to="/products" className="btn btn-ghost btn-sm">
            전체 보기 →
          </Link>
        </div>
        {isLoading ? (
          <Spinner />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {data?.products?.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        )}
      </section>

      {/* 멍샵 특징 */}
      <section className="grid sm:grid-cols-3 gap-6 text-center">
        {[
          { icon: '🚚', title: '5만원 이상 무료배송', desc: '부담 없이 쇼핑하세요' },
          { icon: '✅', title: '수의사 추천 제품', desc: '검증된 안전한 상품만' },
          { icon: '🎁', title: '구매 포인트 적립', desc: '결제 금액의 1% 적립' },
        ].map((item) => (
          <div key={item.title} className="card bg-base-200 p-6">
            <div className="text-4xl mb-3">{item.icon}</div>
            <h3 className="font-bold">{item.title}</h3>
            <p className="text-base-content/60 text-sm mt-1">{item.desc}</p>
          </div>
        ))}
      </section>
    </div>
  )
}
