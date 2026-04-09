export default function ErrorState({ message = '데이터를 불러오는 데 실패했습니다', onRetry }) {
  return (
    <div className="text-center py-20">
      <p className="text-5xl mb-4">⚠️</p>
      <p className="text-base-content/60">{message}</p>
      {onRetry && (
        <button className="btn btn-sm btn-outline mt-4" onClick={onRetry}>
          다시 시도
        </button>
      )}
    </div>
  )
}
