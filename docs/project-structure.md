# 프로젝트 디렉토리 구조

Feature-based Design — 각 도메인이 API·페이지·컴포넌트·훅을 모두 소유.

```
src/
├── features/               도메인별 자급자족 단위
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
│   ├── hooks/              useToast
│   └── utils/              constants, formatters, cookies, oauth2
├── api/                    인프라 레이어 (apiSlice, mockBaseQuery)
├── app/                    Redux store
├── components/layout/      Header, Footer, Layout (앱 셸)
├── pages/                  NotFoundPage (도메인 없는 범용 페이지)
└── mocks/                  도메인별 원본 데이터 (직접 import 금지)
```

## 문서 구조

```
docs/
├── project-structure.md    프로젝트 전체 구조 (이 파일)
├── domain/                 데이터·API 중심 도메인 명세
│   ├── auth.md
│   ├── cart.md
│   ├── inquiries.md
│   ├── orders.md
│   ├── points.md
│   ├── products.md
│   ├── reviews.md
│   └── user.md
└── view/                   레이아웃·복합 페이지 명세
    └── mypage.md
```
