/**
 * 쿠키 값 읽기 (HttpOnly가 아닌 쿠키에만 사용 가능)
 * XSRF-TOKEN 등 JS 접근 허용 쿠키에 사용
 * @param {string} name
 * @returns {string|null}
 */
export const getCookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : null
}
