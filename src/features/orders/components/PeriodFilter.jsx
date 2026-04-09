const PERIODS = [
  { label: '1개월', value: 1 },
  { label: '3개월', value: 3 },
  { label: '6개월', value: 6 },
  { label: '전체', value: 0 },
]

export default function PeriodFilter({ value, onChange }) {
  return (
    <div className="flex gap-1">
      {PERIODS.map((p) => (
        <button
          key={p.value}
          className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
            value === p.value
              ? 'bg-[#346AFF] text-white'
              : 'bg-base-200 text-[#888888] hover:bg-base-300'
          }`}
          onClick={() => onChange(p.value)}
        >
          {p.label}
        </button>
      ))}
    </div>
  )
}
