# 06 · 앱 구조 (App Structure)

디렉토리 구조, 라우팅, 컴포넌트 계층의 설계 원칙과 확장 방법을 정의한다.

---

## 디렉토리 구조

```
src/
├── api/               RTK Query — apiSlice + 도메인별 injectEndpoints
├── app/               Redux store 설정
├── components/
│   ├── common/        재사용 UI (Spinner, ProtectedRoute, ProductCard)
│   ├── initializers/  앱 초기화 (AuthInitializer)
│   └── layout/        전체 레이아웃 (Layout, Header, Footer)
├── features/
│   └── auth/          authSlice (Redux state)
├── hooks/             커스텀 훅 (useAuth 등)
├── mocks/             Mock 데이터 원본 (불변)
├── pages/             라우트별 페이지 컴포넌트
└── utils/             constants, formatters, cookies, oauth2
```

---

## 라우팅 구조 (`src/App.jsx`)

```
BrowserRouter
  └─ ErrorBoundary
       └─ AuthInitializer         ← /auth/me 호출 완료까지 스피너
            └─ Routes
                 └─ Layout (Outlet)
                      ├─ /                      HomePage
                      ├─ /products              ProductListPage
                      ├─ /products/:id          ProductDetailPage
                      ├─ /login                 LoginPage
                      └─ /my/* (ProtectedRoute)
                           ├─ /my/orders        OrdersPage
                           ├─ /my/orders/:id    OrderDetailPage
                           ├─ /my/profile       ProfilePage
                           ├─ /my/points        PointsPage
                           ├─ /my/reviews       MyReviewsPage
                           └─ /my/inquiries     InquiriesPage
```

### 새 페이지 추가 방법

1. `src/pages/NewPage.jsx` 생성
2. `src/App.jsx`에 `<Route>` 추가
3. 인증 필요 시 `<ProtectedRoute>` 감싸기
4. Header 네비게이션에 링크 추가 (필요한 경우)

```jsx
// App.jsx — 공개 라우트
<Route path="new-page" element={<NewPage />} />

// App.jsx — 보호된 라우트
<Route
  path="my/new-section"
  element={<ProtectedRoute><NewSectionPage /></ProtectedRoute>}
/>
```

---

## 컴포넌트 계층과 역할

### Layout (`components/layout/Layout.jsx`)
- `Header` + `<Outlet />` + `Footer` 조합
- 모든 페이지에 일관된 레이아웃 제공
- 페이지별 레이아웃 변경 필요 시 별도 Layout 추가

### Header (`components/layout/Header.jsx`)
- 로고, 카테고리 네비게이션, 유저 메뉴
- `useAuth()`로 로그인 상태 구독
- `useLogoutMutation()`으로 로그아웃

### AuthInitializer (`components/initializers/AuthInitializer.jsx`)
- 앱 최상단에서 `/auth/me` 호출 (새로고침 시 세션 복원)
- `isInitialized` false 동안 전체 화면 스피너
- 성공·실패 무관하게 `setInitialized()` 호출 (finalLy 보장)

### ProtectedRoute (`components/common/ProtectedRoute.jsx`)
- 비로그인 시 `/login`으로 리다이렉트
- `location.pathname`을 `state.from`으로 전달 (로그인 후 복귀)

### ErrorBoundary (`components/ErrorBoundary.jsx`)
- 최상위에서 런타임 에러 포착
- Class 컴포넌트 (`getDerivedStateFromError`)
- 에러 화면 + 새로고침 버튼

---

## Redux Store 구조

```js
{
  api: { ... },       // RTK Query 캐시 (apiSlice.reducerPath)
  auth: {
    user: null | { id, email, name, phone, role, provider },
    isInitialized: false | true,
  }
}
```

**새 Redux slice 추가 방법:**
1. `src/features/{domain}/{domain}Slice.js` 생성
2. `src/app/store.js`의 `reducer` 객체에 추가

일반적인 서버 데이터는 RTK Query 캐시에 저장. Redux slice는 UI state나 전역 클라이언트 state에만 사용.

---

## 커스텀 훅 패턴 (`src/hooks/`)

```js
// useAuth.js — Redux selector를 훅으로 추상화
export const useAuth = () => {
  const user = useSelector(selectUser)
  const isLoggedIn = useSelector(selectIsLoggedIn)
  const isInitialized = useSelector(selectIsInitialized)
  return { user, isLoggedIn, isInitialized }
}
```

컴포넌트에서 `useSelector`를 직접 사용하지 않고, 도메인 훅으로 추상화하면  
selector 변경 시 훅만 수정하면 된다.

새 훅 추가 기준: 2개 이상의 컴포넌트에서 같은 패턴이 반복될 때.

---

## 유틸 파일 역할

| 파일 | 역할 |
|---|---|
| `constants.js` | 도메인 상태값, 레이블 매핑, 비즈니스 수치 (배송비 기준 등) |
| `formatters.js` | 순수 함수 — 금액 포맷, 날짜 포맷, 계산 함수 |
| `cookies.js` | `getCookie()` — XSRF-TOKEN 읽기용 |
| `oauth2.js` | OAuth2 state 생성·검증·리다이렉트 |

비즈니스 상수(배송비, 포인트율 등)는 항상 `constants.js`에서 import.  
컴포넌트 내 하드코딩 금지.

```js
// ✅
import { SHIPPING_FREE_THRESHOLD, SHIPPING_FEE } from '../utils/constants'

// ❌
const shippingFee = subtotal >= 50000 ? 0 : 3000   // 하드코딩
```
