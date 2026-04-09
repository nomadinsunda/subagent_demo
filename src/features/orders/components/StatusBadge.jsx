import { ORDER_STATUS_LABEL } from '../../../shared/utils/constants'

const STATUS_STYLE = {
  waiting:   'bg-yellow-100 text-yellow-700',
  preparing: 'bg-blue-100 text-[#346AFF]',
  shipping:  'bg-[#346AFF] text-white',
  delivered: 'bg-[#00891A] text-white',
  cancelled: 'bg-gray-100 text-[#888888]',
}

export default function StatusBadge({ status, className = '' }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${STATUS_STYLE[status] ?? 'bg-gray-100 text-gray-600'} ${className}`}
    >
      {ORDER_STATUS_LABEL[status] ?? status}
    </span>
  )
}
