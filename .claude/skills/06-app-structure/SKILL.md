---
name: app-structure
description: 멍샵 Feature-based Design 디렉토리 구조, 라우팅 트리(MyPageLayout 중첩 포함), 컴포넌트 계층 역할, Redux store 구조. 라우트·컴포넌트·도메인 추가 시 참조.
user-invocable: false
---

# 06 · 앱 구조 (App Structure)

디렉토리 구조, 라우팅, 컴포넌트 계층의 설계 원칙과 확장 방법을 정의한다.

---

## 디렉토리 구조 (Feature-based Design)

```
src/
├── features/               도메인별 자급자족 단위 (API·페이지·컴포넌트·훅 모두 소유)
│   ├── auth/               authApi, authSlice, useAuth, AuthInitializer, ProtectedRoute, LoginPage
│   ├── products/           productsApi, ProductCard, ProductListPage, ProductDetailPage
│   ├── cart/               cartApi, CartPage
│   ├── orders/             ordersApi, OrdersPage, OrderDetailPage
│   │   └── components/     StatusBadge, OrderCard, PeriodFilter
│   ├── reviews/            reviewsApi, MyReviewsPage
│   ├── inquiries/          inquiriesApi, InquiriesPage
│   ├── user/               usersApi, pointsApi, ProfilePage, PointsPage
│   ├── mypage/             MyPageLayout (LNB 사이드바 + Dashboard 공유 레이아웃)
│   └── home/               HomePage
├── shared/                 도메인 무관 공용 코드
│   ├── components/         ErrorBoundary, Spinner, Toast, ErrorState
│   └── utils/              constants, formatters, cookies, oauth2
├── api/                    인프라 레이어만 (도메인 API 금지)
│   ├── apiSlice.js         createApi + withReauth
│   └── mockBaseQuery.js    Mock 전용 baseQuery
├── app/
│   └── store.js            Redux store
├── components/layout/      Header, Footer, Layout (앱 셸)
├── pages/                  NotFoundPage (도메인 없는 범용 페이지만)
└── mocks/                  도메인별 원본 데이터 (컴포넌트 직접 import 금지)
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
                      ├─ /cart                  CartPage (ProtectedRoute)
                      └─ /my (ProtectedRoute → MyPageLayout)
                           ├─ index             → redirect to /my/orders
                           ├─ /my/orders        OrdersPage
                           ├─ /my/orders/:id    OrderDetailPage
                           ├─ /my/profile       ProfilePage
                           ├─ /my/points        PointsPage
                           ├─ /my/reviews       MyReviewsPage
                           └─ /my/inquiries     InquiriesPage
```

### 새 페이지 추가 방법

1. `src/features/{domain}/NewPage.jsx` 생성
2. `src/App.jsx`에 `<Route>` 추가
3. 인증 필요 시 `<ProtectedRoute>` 또는 `/my` 중첩 라우트에 추가
4. Header 네비게이션에 링크 추가 (필요한 경우)

```jsx
// My Page 하위 페이지 추가 시
<Route path="my" element={<ProtectedRoute><MyPageLayout /></ProtectedRoute>}>
  <Route path="new-section" element={<NewSectionPage />} />
</Route>
```

---

## 컴포넌트 계층과 역할

### Layout (`components/layout/Layout.jsx`)
- `Header` + `<Outlet />` + `Footer` 조합
- 모든 페이지에 일관된 레이아웃 제공

### Header (`components/layout/Header.jsx`)
- 로고, 카테고리 네비게이션, 장바구니, 마이멍샵 아이콘, 유저 드롭다운
- `useAuth()`로 로그인 상태 구독
- 마이멍샵 아이콘 (사람 상반신 + "마이멍샵" 텍스트) → `/my` 링크

### MyPageLayout (`features/mypage/MyPageLayout.jsx`)
- `/my/*` 라우트 전용 공유 레이아웃
- 좌측 LNB 사이드바 (쇼핑정보 / MY활동 / 계정 그룹)
- 우측 상단 Dashboard 요약 (포인트 / 쿠폰 / 멤버십)
- `<Outlet />`으로 하위 페이지 렌더링

### AuthInitializer (`features/auth/AuthInitializer.jsx`)
- 앱 최상단에서 `/auth/me` 호출 (새로고침 시 세션 복원)
- `isInitialized` false 동안 전체 화면 스피너

### ProtectedRoute (`features/auth/ProtectedRoute.jsx`)
- 비로그인 시 `/login`으로 리다이렉트
- `location.pathname`을 `state.from`으로 전달 (로그인 후 복귀)

### ErrorBoundary (`shared/components/ErrorBoundary.jsx`)
- 최상위에서 런타임 에러 포착
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

일반 서버 데이터는 RTK Query 캐시에 저장. Redux slice는 UI state나 전역 클라이언트 state에만 사용.

---

## 유틸 파일 역할 (`src/shared/utils/`)

| 파일 | 역할 |
|---|---|
| `constants.js` | 도메인 상태값, 레이블 매핑, 비즈니스 수치 (배송비 기준, 포인트율 등) |
| `formatters.js` | 순수 함수 — 금액 포맷, 날짜 포맷, 마스킹, 계산 함수 |
| `cookies.js` | `getCookie()` — XSRF-TOKEN 읽기용 |
| `oauth2.js` | OAuth2 state 생성·검증·리다이렉트 |

비즈니스 상수는 항상 `constants.js`에서 import. 컴포넌트 내 하드코딩 금지.
