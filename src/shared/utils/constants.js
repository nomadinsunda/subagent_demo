export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
  PREPARING: 'preparing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDING: 'refunding',
  REFUNDED: 'refunded',
}

export const ORDER_STATUS_LABEL = {
  [ORDER_STATUS.PENDING]: '결제 대기',
  [ORDER_STATUS.PAID]: '결제 완료',
  [ORDER_STATUS.PREPARING]: '상품 준비중',
  [ORDER_STATUS.SHIPPED]: '배송중',
  [ORDER_STATUS.DELIVERED]: '배송 완료',
  [ORDER_STATUS.CANCELLED]: '주문 취소',
  [ORDER_STATUS.REFUNDING]: '환불 처리중',
  [ORDER_STATUS.REFUNDED]: '환불 완료',
}

export const ORDER_STATUS_BADGE = {
  [ORDER_STATUS.PENDING]: 'badge-warning',
  [ORDER_STATUS.PAID]: 'badge-info',
  [ORDER_STATUS.PREPARING]: 'badge-info',
  [ORDER_STATUS.SHIPPED]: 'badge-primary',
  [ORDER_STATUS.DELIVERED]: 'badge-success',
  [ORDER_STATUS.CANCELLED]: 'badge-error',
  [ORDER_STATUS.REFUNDING]: 'badge-warning',
  [ORDER_STATUS.REFUNDED]: 'badge-ghost',
}

export const CANCELLABLE_STATUSES = [
  ORDER_STATUS.PENDING,
  ORDER_STATUS.PAID,
  ORDER_STATUS.PREPARING,
]

export const CATEGORY_LABEL = {
  food: '사료/간식',
  accessories: '액세서리',
  clothing: '의류',
  toys: '장난감',
  health: '건강/영양제',
  grooming: '미용/위생',
}

export const INQUIRY_TYPE_LABEL = {
  product: '상품 문의',
  order: '주문/배송',
  return: '교환/반품',
  payment: '결제',
  etc: '기타',
}

export const POINT_TYPE_LABEL = {
  earn_order: '구매 적립',
  earn_review: '리뷰 적립',
  earn_event: '이벤트 적립',
  use_order: '주문 사용',
  expire: '포인트 소멸',
  refund: '취소 환급',
}

export const SHIPPING_FREE_THRESHOLD = 50000
export const SHIPPING_FEE = 3000
export const POINT_EARN_RATE = 0.01
export const REVIEW_POINT_TEXT = 50
export const REVIEW_POINT_PHOTO = 100
export const MAX_ADDRESSES = 5
