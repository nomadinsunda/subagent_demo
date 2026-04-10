---
name: mock-architecture
description: Mock 개발 환경 구조와 운용 규칙. mockBaseQuery URL 라우팅, 가변/불변 데이터 let 변수 관리, 새 도메인 추가 6단계 절차, 백엔드 전환 방법. 새 도메인 추가 시 참조.
user-invocable: false
---

# 04 · Mock 아키텍처

백엔드 없이 개발하는 현재 단계에서의 Mock 시스템 구조와 운용 규칙을 정의한다.  
CLAUDE.md Rules 10~11의 구체적 적용 방법.

---

## 전체 구조

```
컴포넌트
  └─ RTK Query 훅 (useXxxQuery / useXxxMutation)
       └─ apiSlice (withReauth)
            └─ mockBaseQuery           ← 실제 HTTP 요청 없음
                 └─ handleRequest()    ← URL 패턴 매칭 라우터
                      └─ src/mocks/   ← 정적 원본 데이터
```

**핵심:** 컴포넌트는 Mock인지 Real인지 알 필요 없다. RTK Query 훅 인터페이스가 동일.

---

## mockBaseQuery 작동 방식 (`src/api/mockBaseQuery.js`)

```js
export const mockBaseQuery = async (args) => {
  const { url, method = 'GET', body, params } =
    typeof args === 'string' ? { url: args } : args

  await delay(500)                    // 네트워크 레이턴시 시뮬레이션 (500ms)
  return handleRequest({ url, method, body, params })
}
```

- `handleRequest()`: URL 패턴 매칭 → 적절한 핸들러 호출
- `ok(data)`: `{ data }` 형태로 반환 (RTK Query 성공 포맷)
- `fail(status, msg)`: `{ error: { status, data: { message } } }` 형태 반환

---

## 인증 상태 시뮬레이션

```js
// mockBaseQuery.js 모듈 레벨 변수
let isLoggedIn = false    // 쿠키 기반 인증을 모듈 변수로 시뮬레이션

// 로그인: POST /auth/login → isLoggedIn = true
// 로그아웃: POST /auth/logout → isLoggedIn = false
// 인증 필요 엔드포인트: if (!isLoggedIn) return fail(401, '...')
```

실제 환경에서는 HttpOnly 쿠키가 이 역할을 하지만, Mock에서는 모듈 변수로 대체.

---

## 데이터 가변성 규칙 (Rule 11)

### 불변 데이터 (예: 상품)
```js
// src/mocks/products.js
export const mockProducts = [...] // 원본, 변경 없음

// mockBaseQuery.js
// mockProducts를 직접 참조만 함 (복사·변경 없음)
if (url === '/products') return ok([...mockProducts])
```

### 가변 데이터 (예: 주문, 리뷰, 문의)
```js
// src/mocks/orders.js
export const mockOrders = [...]   // 원본 — 직접 변경 금지

// mockBaseQuery.js 모듈 레벨
let orders = [...mockOrders]      // 원본을 복사한 가변 사본

// mutation 시 사본만 변경
orders = [newOrder, ...orders]    // 원본 mockOrders는 불변 유지
```

---

## URL 라우팅 패턴

```js
// 정적 경로
if (url === '/orders' && method === 'GET') { ... }
if (url === '/orders' && method === 'POST') { ... }

// 동적 경로 (정규식)
const orderMatch = url.match(/^\/orders\/(\d+)$/)
if (orderMatch && method === 'GET') {
  const id = Number(orderMatch[1])
  ...
}

// 중첩 경로
const productReviewsMatch = url.match(/^\/products\/(\d+)\/reviews$/)
if (productReviewsMatch && method === 'GET') { ... }
```

**순서 중요:** 구체적인 패턴(`/cart/clear`)을 동적 패턴(`/cart/:id`) 앞에 배치.

---

## 라우트 블록 구분 주석 (형식 강제)

```js
// ── Auth ──────────────────────────────────────────────────────────────────
// ── Products ──────────────────────────────────────────────────────────────
// ── Orders ────────────────────────────────────────────────────────────────
// ── Reviews ───────────────────────────────────────────────────────────────
// ── Points ────────────────────────────────────────────────────────────────
// ── Inquiries ─────────────────────────────────────────────────────────────
// ── Users ─────────────────────────────────────────────────────────────────
```

새 도메인 추가 시 이 형식으로 구분 주석 추가 (Rule 10).

---

## 새 도메인 추가 절차 (Rule 10)

자세한 예제는 `examples/add-domain.md` 참조.

1. `src/mocks/{domain}.js` — 원본 데이터 정의
2. `mockBaseQuery.js` — import 추가 + 가변이면 let 변수 추가 + 라우트 블록 추가
3. `src/features/{domain}/{domain}Api.js` — `injectEndpoints`로 엔드포인트 정의
4. `src/api/apiSlice.js` — tagTypes에 새 타입 추가
5. `src/app/store.js` — import 추가
6. `docs/{domain}.md` — 비즈니스 명세 작성 (Rule 13 필수)

---

## 백엔드 연결 전환 절차

Mock → Real 전환 시 수정 파일:

| 파일 | 변경 내용 |
|---|---|
| `src/api/apiSlice.js` | `mockBaseQuery` → `realBaseQuery`(fetchBaseQuery) 교체 |
| (선택) 삭제 | `src/api/mockBaseQuery.js`, `src/mocks/` 폴더 |

`withReauth`, `injectEndpoints`, 훅 — 모두 그대로 유지.

```js
// apiSlice.js — 이 한 줄만 교체
baseQuery: withReauth(mockBaseQuery),      // 현재
baseQuery: withReauth(realBaseQuery),      // 백엔드 연결 시
```

---

## 절대 금지 (Rule 10·11)

```js
// ❌ 컴포넌트에서 mocks/ 직접 import
import { mockProducts } from '../mocks/products'

// ❌ mocks/ 원본 배열 직접 변경
mockOrders.push(newOrder)
mockOrders[0].status = 'cancelled'

// ✅ 올바른 방법: mockBaseQuery 모듈 변수에서만 변경
let orders = [...mockOrders]
orders = orders.map(o => o.id === id ? { ...o, status: 'cancelled' } : o)
```
