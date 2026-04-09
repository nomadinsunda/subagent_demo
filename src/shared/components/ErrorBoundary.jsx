import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('[ErrorBoundary]', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-base-200">
          <div className="card w-96 bg-base-100 shadow-xl">
            <div className="card-body items-center text-center">
              <h2 className="card-title text-error text-2xl">오류가 발생했습니다</h2>
              <p className="text-base-content/70">
                예기치 않은 오류가 발생했습니다. 페이지를 새로고침 해 주세요.
              </p>
              {this.state.error && (
                <pre className="text-xs bg-base-200 p-3 rounded-lg w-full overflow-auto text-left mt-2">
                  {this.state.error.message}
                </pre>
              )}
              <div className="card-actions mt-4">
                <button
                  className="btn btn-primary"
                  onClick={() => window.location.reload()}
                >
                  새로고침
                </button>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
