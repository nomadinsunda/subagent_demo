---
name: rtk-query-api
description: RTK Query API 패턴. 단일 createApi + injectEndpoints 분리, providesTags/invalidatesTags 태그 전략, 훅 명명 규칙, store.js 등록 필수. API 엔드포인트 추가·수정 시 참조.
user-invocable: false
---

# 03 · RTK Query API 패턴

새로운 API 엔드포인트를 추가하거나 수정할 때 반드시 따르는 패턴을 정의한다.  
자세한 코드 예제는 `examples/endpoint-patterns.md` 참조.

---

## 핵심 원칙

1. **단일 createApi** — `src/api/apiSlice.js`에서만 `createApi()` 호출
2. **injectEndpoints 분리** — 도메인별로 `src/features/{domain}/{domain}Api.js`를 별도 파일로 작성
3. **withReauth 필수** — `baseQuery`는 반드시 `withReauth`로 감싸야 함 (Rule 6)
4. **No Axios** — 모든 HTTP 통신은 RTK Query만 사용 (Rule 1)

---

## 파일 구조

```
src/api/
├── apiSlice.js        ← createApi + withReauth (인프라 전용, 수정 금지)
└── mockBaseQuery.js   ← Mock 전용 baseQuery

src/features/{domain}/
└── {domain}Api.js     ← injectEndpoints (도메인 API, 예시)
    ├── features/auth/authApi.js
    ├── features/products/productsApi.js
    ├── features/cart/cartApi.js
    ├── features/orders/ordersApi.js
    ├── features/reviews/reviewsApi.js
    ├── features/inquiries/inquiriesApi.js
    └── features/user/usersApi.js, pointsApi.js
```

새 도메인 추가 시 `src/features/{domain}/{domain}Api.js` 생성 후 `store.js`에 import 추가.

---

## 태그 시스템 (캐시 무효화)

### tagTypes 등록 (`apiSlice.js`)
```js
tagTypes: ['Auth', 'Product', 'Order', 'Review', 'Points', 'Inquiry', 'Address'],
```
**새 도메인 추가 시 이 배열에 반드시 추가.**

### providesTags 패턴

| 상황 | 패턴 |
|---|---|
| 목록 쿼리 | `[...items.map(({id}) => ({type, id})), {type, id:'LIST'}]` |
| 단건 쿼리 | `[{type, id}]` |
| 인증 관련 | `['Auth']` |
| 고정 리소스 | `['Points']` |

### invalidatesTags 패턴

| 상황 | 패턴 |
|---|---|
| 단건 수정·삭제 | `[{type, id}, {type, id:'LIST'}]` |
| 생성 (ID 모름) | `[{type, id:'LIST'}]` |
| 연관 도메인 갱신 | 여러 타입 배열로 나열 |

---

## 엔드포인트 타입 선택

| HTTP | RTK Query | 용도 |
|---|---|---|
| GET | `builder.query` | 데이터 조회, 캐싱 됨 |
| POST·PUT·PATCH·DELETE | `builder.mutation` | 상태 변경, 캐싱 안 됨 |

---

## onQueryStarted 사용 시점

Redux state를 직접 업데이트해야 할 때만 사용 (주로 auth 관련):

```js
async onQueryStarted(_, { dispatch, queryFulfilled }) {
  try {
    const { data } = await queryFulfilled
    dispatch(setUser(data))
  } catch {
    // 실패 처리
  }
}
```

일반 도메인(상품, 주문 등)은 `invalidatesTags`로 캐시 무효화만 하면 충분.  
`onQueryStarted`를 남용하면 Redux state와 RTK Query 캐시가 이중 관리되어 복잡도 증가.

---

## 훅 명명 규칙

```js
// query → useGet{Resource}Query / useGet{Resource}sQuery
useGetProductQuery(id)
useGetProductsQuery(params)

// mutation → use{Action}{Resource}Mutation
useCreateOrderMutation()
useCancelOrderMutation()
useUpdateReviewMutation()
useDeleteReviewMutation()
```

---

## store.js 등록

새 API 파일은 반드시 `store.js`에 import해야 `injectEndpoints`가 실제 등록된다:

```js
// src/app/store.js
import '../api/authApi'
import '../api/productsApi'
import '../api/ordersApi'
// ... 새 파일 추가 시 이 블록에 추가
```

import만 하면 됨 — named export 불필요.

---

## 자주 하는 실수

| 실수 | 올바른 방법 |
|---|---|
| `createApi()`를 새 파일에서 다시 호출 | `apiSlice.injectEndpoints()` 사용 |
| `store.js` import 누락 | 도메인 Api 파일 추가 후 반드시 import |
| tagTypes에 새 타입 추가 안 함 | `apiSlice.js`의 `tagTypes` 배열에 추가 |
| mutation에 `invalidatesTags` 누락 | 모든 mutation에 설정 |
| query에서 `providesTags` 누락 | 모든 query에 설정 |
