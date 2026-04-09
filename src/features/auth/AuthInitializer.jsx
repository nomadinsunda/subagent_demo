import { useGetMeQuery } from './authApi'
import { useAuth } from './useAuth'
import Spinner from '../../shared/components/Spinner'

/**
 * 앱 최상단에서 /auth/me를 호출하여 새로고침 시 인증 상태를 복원합니다.
 * isInitialized가 false인 동안(요청 완료 전) 스피너를 표시하여 FOUC를 방지합니다.
 */
export default function AuthInitializer({ children }) {
  useGetMeQuery()
  const { isInitialized } = useAuth()

  if (!isInitialized) {
    return <Spinner fullscreen />
  }

  return children
}
