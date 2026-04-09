import { useState, useEffect } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useGetProductsQuery } from './productsApi'
import ProductCard from './ProductCard'
import Spinner from '../../shared/components/Spinner'
import { CATEGORY_LABEL } from '../../shared/utils/constants'

const SORT_OPTIONS = [
  { value: 'newest', label: '최신순' },
  { value: 'price_asc', label: '가격 낮은순' },
  { value: 'price_desc', label: '가격 높은순' },
]

export default function ProductListPage() {
  const [searchParams, setSearchParams] = useSearchParams()
  const category = searchParams.get('category') || ''
  const sort = searchParams.get('sort') || 'newest'
  const keyword = searchParams.get('keyword') || ''
  const page = Number(searchParams.get('page')) || 1

  const [keywordInput, setKeywordInput] = useState(keyword)

  useEffect(() => {
    setKeywordInput(keyword)
  }, [keyword])

  const { data, isLoading, isFetching } = useGetProductsQuery({
    category: category || undefined,
    sort,
    keyword: keyword || undefined,
    page,
    limit: 12,
  })

  const updateParams = (updates) => {
    const next = new URLSearchParams(searchParams)
    Object.entries(updates).forEach(([k, v]) => {
      if (v) next.set(k, v)
      else next.delete(k)
    })
    next.delete('page')
    setSearchParams(next)
  }

  const handleKeywordSearch = (e) => {
    e.preventDefault()
    updateParams({ keyword: keywordInput })
  }

  const totalPages = data ? Math.ceil(data.total / data.limit) : 1

  return (
    <div className="space-y-6">
      {/* 상단 검색/필터 */}
      <div className="flex flex-col sm:flex-row gap-3">
        <form onSubmit={handleKeywordSearch} className="flex gap-2 flex-1">
          <input
            type="text"
            className="input input-bordered flex-1"
            placeholder="상품명으로 검색..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
          <button type="submit" className="btn btn-primary">검색</button>
        </form>
        <select
          className="select select-bordered"
          value={sort}
          onChange={(e) => updateParams({ sort: e.target.value })}
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
      </div>

      {/* 카테고리 탭 */}
      <div className="flex gap-2 flex-wrap">
        <button
          className={`btn btn-sm ${!category ? 'btn-primary' : 'btn-ghost'}`}
          onClick={() => updateParams({ category: '' })}
        >
          전체
        </button>
        {Object.entries(CATEGORY_LABEL).map(([key, label]) => (
          <button
            key={key}
            className={`btn btn-sm ${category === key ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => updateParams({ category: key })}
          >
            {label}
          </button>
        ))}
      </div>

      {/* 결과 요약 */}
      {data && (
        <div className="text-sm text-base-content/60">
          {category && <span className="font-medium text-base-content">{CATEGORY_LABEL[category]} · </span>}
          총 <span className="font-medium text-base-content">{data.total}개</span> 상품
        </div>
      )}

      {/* 상품 그리드 */}
      {isLoading || isFetching ? (
        <Spinner />
      ) : data?.products?.length === 0 ? (
        <div className="text-center py-20 text-base-content/50">
          <p className="text-5xl mb-4">🔍</p>
          <p>검색 결과가 없습니다</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {data?.products?.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <div className="flex justify-center">
          <div className="join">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                className={`join-item btn btn-sm ${p === page ? 'btn-active' : ''}`}
                onClick={() => {
                  const next = new URLSearchParams(searchParams)
                  next.set('page', p)
                  setSearchParams(next)
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
