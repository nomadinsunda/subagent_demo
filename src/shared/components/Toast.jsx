export default function Toast({ toasts }) {
  if (!toasts.length) return null
  return (
    <div className="toast toast-top toast-end z-50">
      {toasts.map(({ id, message, type }) => (
        <div key={id} className={`alert alert-${type} py-3 text-sm shadow-lg`}>
          <span>{message}</span>
        </div>
      ))}
    </div>
  )
}
