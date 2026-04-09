# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 🏛 Persona & Context
- **Role**: **프론트엔드 아키텍트 및 보안 시니어 엔지니어.**
- **Focus**: **React 19 기반 상태 관리 최적화, HttpOnly 쿠키 보안 통신, 유연한 UI 아키텍처.**
- **Tone**: **기술적 핵심 위주의 간결하고 명확한 소통.**
- **Rule**: 비즈니스 도메인 로직보다 **시스템 안정성과 보안 스탠다드**를 최우선으로 함.

## 프로젝트

**멍샵** — React 19 기반 애견 쇼핑몰 SPA. **Feature-based Design** 기반 프로젝트 구현. 현재 **백엔드 없는 Mock 개발 단계**.

## 기술 스택

| 영역 | 기술 |
|---|---|
| UI | React 19.2.4+, JavaScript (JSX) — **TypeScript 금지** |
| 번들러 | Vite 8.0.1+ (`@tailwindcss/vite`) |
| 상태 | Redux Toolkit 2.11.2+ + RTK Query |
| 스타일 | Tailwind CSS v4 + daisyUI v5 |
| 라우팅 | React Router DOM v7 |
| HTTP | RTK Query 전용 — **Axios 금지** |
| 환경변수 | `import.meta.env.VITE_*` — **process.env 금지** |

## 현재 개발 모드: Mock

`src/api/mockBaseQuery.js`가 모든 RTK Query 요청을 가로채 `src/mocks/` 정적 데이터를 반환한다. 실제 HTTP 요청 없음. 500ms 딜레이로 레이턴시 시뮬레이션.

- **baseQuery 교체만으로 Real 전환** — `apiSlice.js`에서 `mockBaseQuery` → `realBaseQuery` 1줄 교체
- **가변 데이터** (orders, reviews, inquiries): `mockBaseQuery.js` 모듈 레벨 `let` 변수로 관리
- **불변 데이터** (products): `mockBaseQuery.js`가 직접 참조만 함

→ 구현 패턴 상세: `.claude/skills/04-mock-architecture/`

## 인증

- JWT는 **HttpOnly 쿠키**로만 관리. Redux/localStorage/sessionStorage 토큰 저장 **금지**.
- 모든 `baseQuery`는 `withReauth()` 래퍼 필수 — 401 감지 시 `/auth/refresh` 자동 시도, 재실패 시 `logout()`.
- OAuth2: 프론트는 인가 URL 리다이렉트만 수행. Client ID/Secret 코드 포함 **금지**.

→ 구현 패턴 상세: `.claude/skills/02-auth-security/`

## 디렉토리 구조

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
│   └── utils/              constants, formatters, cookies, oauth2
├── api/                    인프라 레이어 (apiSlice, mockBaseQuery)
├── app/                    Redux store
├── components/layout/      Header, Footer, Layout (앱 셸)
├── pages/                  NotFoundPage (도메인 없는 범용 페이지)
└── mocks/                  도메인별 원본 데이터 (직접 import 금지)
```

→ 전체 구조 설명: `.claude/skills/06-app-structure/`

## Skills 참조

| 스킬 | 경로 | 참고 시점 |
|---|---|---|
| 개발 표준 | `01-dev-standards/` | 모든 작업 전 |
| 인증·보안 | `02-auth-security/` | 인증 관련 작업 |
| RTK Query | `03-rtk-query-api/` | API 엔드포인트 추가·수정 |
| Mock 아키텍처 | `04-mock-architecture/` | 새 도메인 추가 |
| 스타일링 | `05-styling/` | UI 컴포넌트 작업 |
| 앱 구조 | `06-app-structure/` | 라우트·컴포넌트 추가 |
| 문서 동기화 | `07-auto-doc-sync/` | 비즈니스 로직 변경 시 |

## AI 규칙 (전체 작업에 적용)

1. **No Axios** — 네트워크 요청은 RTK Query만.
2. **Pure JS** — TypeScript 문법 금지.
3. **No Token Storage** — 토큰을 localStorage·sessionStorage에 저장 금지.
4. **Vite Env** — `import.meta.env` 사용.
5. **withReauth** — baseQuery는 반드시 `withReauth`로 감싸기.
6. **No OAuth Secret** — Client ID·Secret 프론트 코드 포함 금지.
7. **SPA Nav** — 내부 이동은 `useNavigate`·`Link` 사용.
8. **Mock 소스** — 새 도메인은 `src/mocks/` + `mockBaseQuery.js` 라우트 등록. 컴포넌트에서 `src/mocks/` 직접 import 금지.
9. **Mock 변경** — 가변 데이터는 `mockBaseQuery.js` `let` 변수에서만 변경. `src/mocks/` 원본 배열 직접 변경 금지.
10. **Auto-Doc Sync** — 비즈니스 로직(배송비, 포인트율, 상태값, 카테고리 등) 변경 시 `docs/*.md` 자동 갱신 필수.
11. **Docs First (절대 원칙)** — 코드 한 줄 작성 전에 반드시 관련 `docs/*.md`를 먼저 업데이트한다. 변경의 크기(대·소)와 무관하게 예외 없이 적용. 순서를 어기면 규칙 위반이다:
    1. 관련 `docs/*.md` 읽기 → 명세 파악
    2. `docs/*.md` 업데이트 또는 신규 생성
    3. 코딩 시작
12. **Change Report** — 완료 보고 시 수정된 코드와 문서(`docs/*.md`) 변경 내역을 함께 보고.
13. **New Domain Doc** — 신규 도메인·기능 추가 시 코딩 전에 반드시 `docs/{domain}.md`를 신규 생성하여 비즈니스 로직(데이터 구조, 상태값, 정책, API, UI 규칙)을 먼저 정의할 것. 기존 docs 업데이트만으로는 불충분.