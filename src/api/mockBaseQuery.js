import { mockProducts } from '../mocks/products'
import { mockOrders } from '../mocks/orders'
import { mockReviews } from '../mocks/reviews'
import { MOCK_USER, MOCK_PASSWORD } from '../mocks/user'
import { MOCK_POINT_BALANCE, mockPointHistory } from '../mocks/points'
import { mockInquiries } from '../mocks/inquiries'
import { mockCartItems } from '../mocks/cart'

// 모듈 레벨 가변 상태 (src/mocks/ 원본 직접 변경 금지)
let orders = [...mockOrders]
let reviews = [...mockReviews]
let inquiries = [...mockInquiries]
let addresses = JSON.parse(JSON.stringify(MOCK_USER.addresses))
let cartItems = [...mockCartItems]
let isLoggedIn = false

const delay = (ms = 500) => new Promise((resolve) => setTimeout(resolve, ms))
const ok = (data) => ({ data })
const fail = (status, message) => ({ error: { status, data: { message } } })

const handleRequest = ({ url, method = 'GET', body, params }) => {
  // ── Auth ──────────────────────────────────────────────────────────────────
  if (url === '/auth/me' && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    return ok({ ...MOCK_USER, addresses })
  }

  if (url === '/auth/login' && method === 'POST') {
    const { email, password } = body || {}
    if (email === MOCK_USER.email && password === MOCK_PASSWORD) {
      isLoggedIn = true
      return ok({ ...MOCK_USER, addresses })
    }
    return fail(401, '이메일 또는 비밀번호가 올바르지 않습니다')
  }

  if (url === '/auth/logout' && method === 'POST') {
    isLoggedIn = false
    return ok({ message: '로그아웃 되었습니다' })
  }

  if (url === '/auth/refresh' && method === 'POST') {
    if (!isLoggedIn) return fail(401, '세션이 만료되었습니다')
    return ok({ message: '토큰이 갱신되었습니다' })
  }

  // ── Products ──────────────────────────────────────────────────────────────
  if (url === '/products' && method === 'GET') {
    let result = [...mockProducts]
    if (params?.category) result = result.filter((p) => p.category === params.category)
    if (params?.keyword) result = result.filter((p) => p.name.includes(params.keyword))
    if (params?.sort === 'price_asc') result.sort((a, b) => a.salePrice - b.salePrice)
    if (params?.sort === 'price_desc') result.sort((a, b) => b.salePrice - a.salePrice)
    if (params?.sort === 'newest') result.sort((a, b) => b.id - a.id)
    const page = Number(params?.page) || 1
    const limit = Number(params?.limit) || 12
    const total = result.length
    result = result.slice((page - 1) * limit, page * limit)
    return ok({ products: result, total, page, limit })
  }

  const productMatch = url.match(/^\/products\/(\d+)$/)
  if (productMatch && method === 'GET') {
    const id = Number(productMatch[1])
    const product = mockProducts.find((p) => p.id === id)
    if (!product) return fail(404, '상품을 찾을 수 없습니다')
    const productReviews = reviews.filter((r) => r.productId === id)
    const averageRating = productReviews.length
      ? Number((productReviews.reduce((s, r) => s + r.rating, 0) / productReviews.length).toFixed(1))
      : 0
    return ok({ ...product, reviewCount: productReviews.length, averageRating })
  }

  const productReviewsMatch = url.match(/^\/products\/(\d+)\/reviews$/)
  if (productReviewsMatch && method === 'GET') {
    const productId = Number(productReviewsMatch[1])
    let result = reviews.filter((r) => r.productId === productId)
    if (params?.sort === 'highest') result.sort((a, b) => b.rating - a.rating)
    if (params?.sort === 'lowest') result.sort((a, b) => a.rating - b.rating)
    return ok(result)
  }

  const productInquiriesMatch = url.match(/^\/products\/(\d+)\/inquiries$/)
  if (productInquiriesMatch && method === 'GET') {
    const productId = Number(productInquiriesMatch[1])
    return ok(inquiries.filter((i) => i.productId === productId))
  }

  // ── Orders ────────────────────────────────────────────────────────────────
  if (url === '/orders' && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    return ok([...orders])
  }

  if (url === '/orders' && method === 'POST') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const subtotal = (body.items || []).reduce((s, item) => s + item.price * item.quantity, 0)
    const shippingFee = subtotal >= 50000 ? 0 : 3000
    const pointsUsed = body.pointsUsed || 0
    const amount = subtotal + shippingFee - pointsUsed
    const newOrder = {
      id: orders.length + 1,
      userId: MOCK_USER.id,
      status: 'paid',
      items: body.items,
      shippingAddress: body.shippingAddress,
      payment: { method: body.paymentMethod || 'card', amount },
      pointsUsed,
      pointsEarned: Math.floor(amount * 0.01),
      shippingFee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    orders = [newOrder, ...orders]
    return ok(newOrder)
  }

  const orderMatch = url.match(/^\/orders\/(\d+)$/)
  if (orderMatch && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const order = orders.find((o) => o.id === Number(orderMatch[1]))
    return order ? ok(order) : fail(404, '주문을 찾을 수 없습니다')
  }

  const cancelMatch = url.match(/^\/orders\/(\d+)\/cancel$/)
  if (cancelMatch && method === 'PATCH') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const idx = orders.findIndex((o) => o.id === Number(cancelMatch[1]))
    if (idx === -1) return fail(404, '주문을 찾을 수 없습니다')
    if (!['pending', 'paid', 'preparing'].includes(orders[idx].status))
      return fail(400, '취소할 수 없는 주문 상태입니다')
    orders = orders.map((o, i) =>
      i === idx ? { ...o, status: 'cancelled', updatedAt: new Date().toISOString() } : o
    )
    return ok(orders[idx])
  }

  // ── Reviews ───────────────────────────────────────────────────────────────
  if (url === '/reviews/my' && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    return ok(reviews.filter((r) => r.userId === MOCK_USER.id))
  }

  if (url === '/reviews' && method === 'POST') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const newReview = {
      id: reviews.length + 1,
      productId: body.productId,
      orderId: body.orderId,
      userId: MOCK_USER.id,
      userName: MOCK_USER.name,
      rating: body.rating,
      content: body.content,
      imageUrl: body.imageUrl || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isMyReview: true,
    }
    reviews = [newReview, ...reviews]
    return ok(newReview)
  }

  const reviewMatch = url.match(/^\/reviews\/(\d+)$/)
  if (reviewMatch && method === 'PATCH') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const idx = reviews.findIndex((r) => r.id === Number(reviewMatch[1]))
    if (idx === -1) return fail(404, '리뷰를 찾을 수 없습니다')
    reviews = reviews.map((r, i) =>
      i === idx ? { ...r, ...body, updatedAt: new Date().toISOString() } : r
    )
    return ok(reviews[idx])
  }

  if (reviewMatch && method === 'DELETE') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const id = Number(reviewMatch[1])
    if (!reviews.find((r) => r.id === id)) return fail(404, '리뷰를 찾을 수 없습니다')
    reviews = reviews.filter((r) => r.id !== id)
    return ok({ message: '리뷰가 삭제되었습니다' })
  }

  // ── Points ────────────────────────────────────────────────────────────────
  if (url === '/points/me' && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    return ok({ ...MOCK_POINT_BALANCE, history: mockPointHistory })
  }

  // ── Inquiries ─────────────────────────────────────────────────────────────
  if (url === '/inquiries/my' && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    return ok(inquiries.filter((i) => i.userId === MOCK_USER.id))
  }

  if (url === '/inquiries' && method === 'POST') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const newInquiry = {
      id: inquiries.length + 1,
      userId: MOCK_USER.id,
      userName: MOCK_USER.name,
      productId: body.productId || null,
      type: body.type,
      title: body.title,
      content: body.content,
      isSecret: body.isSecret || false,
      status: 'pending',
      answer: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    inquiries = [newInquiry, ...inquiries]
    return ok(newInquiry)
  }

  const inquiryMatch = url.match(/^\/inquiries\/(\d+)$/)
  if (inquiryMatch && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const inquiry = inquiries.find((i) => i.id === Number(inquiryMatch[1]))
    return inquiry ? ok(inquiry) : fail(404, '문의를 찾을 수 없습니다')
  }

  if (inquiryMatch && method === 'PATCH') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const idx = inquiries.findIndex((i) => i.id === Number(inquiryMatch[1]))
    if (idx === -1) return fail(404, '문의를 찾을 수 없습니다')
    if (inquiries[idx].status === 'answered') return fail(400, '답변 완료된 문의는 수정할 수 없습니다')
    inquiries = inquiries.map((i, n) =>
      n === idx ? { ...i, ...body, updatedAt: new Date().toISOString() } : i
    )
    return ok(inquiries[idx])
  }

  if (inquiryMatch && method === 'DELETE') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const inquiry = inquiries.find((i) => i.id === Number(inquiryMatch[1]))
    if (!inquiry) return fail(404, '문의를 찾을 수 없습니다')
    if (inquiry.status === 'answered') return fail(400, '답변 완료된 문의는 삭제할 수 없습니다')
    inquiries = inquiries.filter((i) => i.id !== inquiry.id)
    return ok({ message: '문의가 삭제되었습니다' })
  }

  // ── Cart ──────────────────────────────────────────────────────────────────

  if (url === '/cart' && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    return ok(cartItems.filter((x) => x.userId === MOCK_USER.id))
  }

  if (url === '/cart' && method === 'POST') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const product = mockProducts.find((p) => p.id === body.productId)
    if (!product) return fail(404, '상품을 찾을 수 없습니다')
    if (product.stock === 0) return fail(400, '재고가 없는 상품입니다')
    const existing = cartItems.find(
      (x) => x.userId === MOCK_USER.id && x.productId === body.productId
    )
    if (existing) {
      const newQty = Math.min(existing.quantity + (body.quantity || 1), product.stock)
      cartItems = cartItems.map((x) =>
        x.id === existing.id
          ? { ...x, quantity: newQty, updatedAt: new Date().toISOString() }
          : x
      )
      return ok(cartItems.find((x) => x.id === existing.id))
    }
    const newItem = {
      id: Date.now(),
      userId: MOCK_USER.id,
      productId: product.id,
      name: product.name,
      price: product.salePrice,
      stock: product.stock,
      imageUrl: product.imageUrl,
      quantity: Math.min(body.quantity || 1, product.stock),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    cartItems = [newItem, ...cartItems]
    return ok(newItem)
  }

  // /cart/clear 는 /cart/:id 보다 먼저 매칭
  if (url === '/cart/clear' && method === 'DELETE') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    cartItems = cartItems.filter((x) => x.userId !== MOCK_USER.id)
    return ok({ message: '장바구니를 비웠습니다' })
  }

  const cartItemMatch = url.match(/^\/cart\/(\d+)$/)
  if (cartItemMatch && method === 'PATCH') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const id = Number(cartItemMatch[1])
    const idx = cartItems.findIndex((x) => x.id === id)
    if (idx === -1) return fail(404, '장바구니 항목을 찾을 수 없습니다')
    const item = cartItems[idx]
    const qty = Math.max(1, Math.min(body.quantity, item.stock))
    cartItems = cartItems.map((x, i) =>
      i === idx ? { ...x, quantity: qty, updatedAt: new Date().toISOString() } : x
    )
    return ok(cartItems[idx])
  }

  if (cartItemMatch && method === 'DELETE') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const id = Number(cartItemMatch[1])
    if (!cartItems.find((x) => x.id === id)) return fail(404, '장바구니 항목을 찾을 수 없습니다')
    cartItems = cartItems.filter((x) => x.id !== id)
    return ok({ message: '삭제되었습니다' })
  }

  // ── Users ─────────────────────────────────────────────────────────────────
  if (url === '/users/me' && method === 'PATCH') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    return ok({ ...MOCK_USER, ...body })
  }

  if (url === '/users/me/addresses' && method === 'GET') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    return ok([...addresses])
  }

  if (url === '/users/me/addresses' && method === 'POST') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    if (addresses.length >= 5) return fail(400, '배송지는 최대 5개까지 등록 가능합니다')
    const newAddr = {
      id: addresses.length + 1,
      ...body,
      isDefault: addresses.length === 0,
    }
    addresses = [...addresses, newAddr]
    return ok(newAddr)
  }

  const addrMatch = url.match(/^\/users\/me\/addresses\/(\d+)$/)
  if (addrMatch && method === 'PATCH') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const id = Number(addrMatch[1])
    addresses = addresses.map((a) => (a.id === id ? { ...a, ...body } : a))
    return ok(addresses.find((a) => a.id === id))
  }

  if (addrMatch && method === 'DELETE') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const id = Number(addrMatch[1])
    addresses = addresses.filter((a) => a.id !== id)
    return ok({ message: '배송지가 삭제되었습니다' })
  }

  const addrDefaultMatch = url.match(/^\/users\/me\/addresses\/(\d+)\/default$/)
  if (addrDefaultMatch && method === 'PATCH') {
    if (!isLoggedIn) return fail(401, '인증이 필요합니다')
    const id = Number(addrDefaultMatch[1])
    addresses = addresses.map((a) => ({ ...a, isDefault: a.id === id }))
    return ok(addresses.find((a) => a.id === id))
  }

  return fail(404, `알 수 없는 엔드포인트: ${method} ${url}`)
}

export const mockBaseQuery = async (args) => {
  const { url, method = 'GET', body, params } =
    typeof args === 'string' ? { url: args } : args
  await delay(500)
  return handleRequest({ url, method, body, params })
}
