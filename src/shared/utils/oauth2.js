const STATE_KEY = 'oauth2_state'

/**
 * OAuth2 state nonce를 생성하고 sessionStorage에 저장 (1회용 CSRF 방지)
 * @returns {string} nonce
 */
export const generateOAuth2State = () => {
  const state = crypto.randomUUID()
  sessionStorage.setItem(STATE_KEY, state)
  return state
}

/**
 * 콜백에서 수신한 state를 검증하고 즉시 삭제 (1회용)
 * @param {string} receivedState
 * @returns {boolean}
 */
export const verifyOAuth2State = (receivedState) => {
  const stored = sessionStorage.getItem(STATE_KEY)
  sessionStorage.removeItem(STATE_KEY)
  return stored !== null && stored === receivedState
}

/**
 * OAuth2 제공자 인가 페이지로 리다이렉트
 * @param {'google'|'kakao'|'naver'} provider
 */
export const redirectToOAuth2 = (provider) => {
  const state = generateOAuth2State()
  const baseUrl = import.meta.env.VITE_API_URL || ''
  window.location.href = `${baseUrl}/oauth2/authorization/${provider}?state=${state}`
}
