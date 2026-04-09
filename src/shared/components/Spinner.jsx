export default function Spinner({ fullscreen = false }) {
  if (fullscreen) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-base-100">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    )
  }

  return (
    <div className="flex justify-center py-12">
      <span className="loading loading-spinner loading-md text-primary"></span>
    </div>
  )
}
