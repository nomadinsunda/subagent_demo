import { useSelector } from 'react-redux'
import { selectUser, selectIsLoggedIn, selectIsInitialized } from './authSlice'

export const useAuth = () => {
  const user = useSelector(selectUser)
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const isInitialized = useSelector(selectIsInitialized)

  return { user, isLoggedIn, isInitialized }
}
