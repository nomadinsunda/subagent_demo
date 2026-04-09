/**
 * 금액을 한국 원화 표시 형식으로 변환
 * @param {number} amount
 * @returns {string} e.g. "28,000원"
 */
export const formatPrice = (amount) =>
  `${amount.toLocaleString('ko-KR')}원`

/**
 * ISO 날짜 문자열을 한국 날짜 형식으로 변환
 * @param {string} isoString
 * @returns {string} e.g. "2025.03.10"
 */
export const formatDate = (isoString) => {
  const d = new Date(isoString)
  return `${d.getFullYear()}.${String(d.getMonth() + 1).padStart(2, '0')}.${String(d.getDate()).padStart(2, '0')}`
}

/**
 * ISO 날짜 문자열을 한국 날짜+시간 형식으로 변환
 * @param {string} isoString
 * @returns {string} e.g. "2025.03.10 14:22"
 */
export const formatDateTime = (isoString) => {
  const d = new Date(isoString)
  const date = formatDate(isoString)
  const time = `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
  return `${date} ${time}`
}

/**
 * 배송비 계산
 * @param {number} subtotal 상품 금액 합계
 * @returns {number}
 */
export const calcShippingFee = (subtotal) => (subtotal >= 50000 ? 0 : 3000)

/**
 * 포인트 적립액 계산 (결제금액의 1%, 소수점 버림)
 * @param {number} paymentAmount
 * @returns {number}
 */
export const calcPointsEarned = (paymentAmount) => Math.floor(paymentAmount * 0.01)

/**
 * 별점 숫자를 별 이모지 문자열로 변환
 * @param {number} rating 1~5
 * @returns {string}
 */
export const formatRating = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating)

/**
 * 연락처 중간 자리 마스킹
 * @param {string} phone e.g. "010-1234-5678"
 * @returns {string} e.g. "010-****-5678"
 */
export const maskPhone = (phone) => {
  if (!phone) return '-'
  const parts = phone.split('-')
  if (parts.length !== 3) return phone
  return `${parts[0]}-****-${parts[2]}`
}
