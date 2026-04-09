import { Link } from 'react-router-dom'
import { formatPrice } from '../../shared/utils/formatters'
import { CATEGORY_LABEL } from '../../shared/utils/constants'

export default function ProductCard({ product }) {
  const { id, name, category, price, discountRate, salePrice, imageUrl, stock } = product

  return (
    <Link to={`/products/${id}`} className="card bg-base-100 shadow-md hover:shadow-xl transition-shadow duration-200 group">
      <figure className="overflow-hidden aspect-[4/3]">
        <img
          src={imageUrl}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </figure>
      <div className="card-body p-4 gap-1">
        <div className="flex items-center gap-2">
          <span className="badge badge-outline badge-sm">{CATEGORY_LABEL[category]}</span>
          {stock === 0 && <span className="badge badge-error badge-sm">품절</span>}
        </div>
        <h3 className="font-medium text-sm line-clamp-2 leading-snug">{name}</h3>
        <div className="flex items-end gap-2 mt-1">
          {discountRate > 0 && (
            <span className="text-error font-bold text-sm">{discountRate}%</span>
          )}
          <span className="font-bold">{formatPrice(salePrice)}</span>
        </div>
        {discountRate > 0 && (
          <span className="text-base-content/40 text-xs line-through">{formatPrice(price)}</span>
        )}
      </div>
    </Link>
  )
}
