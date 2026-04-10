# 마이페이지 (My Page) 도메인 명세

## 1. 개요

My Page는 로그인한 사용자가 자신의 쇼핑 활동과 계정 정보를 관리하는 전용 영역이다.
모든 `/my/*` 라우트에 공유 레이아웃(`MyPageLayout`)이 적용된다.

---

## 0. Header 진입점 (마이멍샵 아이콘)

- **위치**: 전역 Header 우측 — 장바구니 아이콘 오른쪽
- **표시 조건**: 로그인 상태에서만 노출
- **구성**: 사람 상반신 SVG 아이콘 + 하단 "마이멍샵" 텍스트
- **동작**: 클릭 시 `/my` 로 이동 → `index` 라우트에 의해 `/my/orders` 로 리다이렉트
- **드롭다운 메뉴**: 아바타 버튼 클릭 시 세부 메뉴(내 주문, 내 리뷰, 포인트, 문의 내역, 프로필, 로그아웃) 접근 가능

---

## 2. 레이아웃 구조

```
┌─────────────────────────────────────────────────────┐
│ Header (전역)                                         │
├──────────────┬──────────────────────────────────────┤
│ LNB 사이드바  │ Dashboard 요약                         │
│ (w-48)       │ [포인트] [쿠폰] [멤버십]                │
│              ├──────────────────────────────────────┤
│              │ <Outlet /> — 각 도메인 페이지          │
└──────────────┴──────────────────────────────────────┘
```

- **사이드바**: `md` 브레이크포인트 이상에서만 표시 (모바일 숨김)
- **Dashboard**: 포인트/쿠폰/멤버십 요약 카드 — 모든 My Page에 항상 노출
- **Outlet**: 현재 라우트의 페이지 컴포넌트 렌더링

---

## 3. LNB 메뉴 구조

| 그룹 | 메뉴 | 라우트 |
|---|---|---|
| 쇼핑정보 | 주문내역 | `/my/orders` |
| 쇼핑정보 | 장바구니 | `/cart` |
| MY활동 | 내 리뷰 | `/my/reviews` |
| MY활동 | 문의내역 | `/my/inquiries` |
| 계정 | 프로필 관리 | `/my/profile` |
| 계정 | 포인트 | `/my/points` |

- 현재 활성 메뉴는 `#346AFF` 배경 + 텍스트로 강조
- `NavLink`의 `isActive` 상태를 통해 자동 판별

---

## 4. Dashboard 요약 카드

| 항목 | 데이터 소스 | 표시 형식 |
|---|---|---|
| 포인트 | `GET /points/me` → `balance` | `N,NNN P` |
| 쿠폰 | Mock 고정값 (3장) | `N장` |
| 멤버십 | Mock 고정값 ("골드") | 등급명 |

- 포인트는 실시간 API 데이터 사용 (`useGetMyPointsQuery`)
- 쿠폰/멤버십은 현재 Mock 단계에서 고정값 사용 → 추후 API 연동 시 교체

---

## 5. 컬러 시스템

| 용도 | 색상 코드 |
|---|---|
| 주요 강조 / 활성 메뉴 / 배송중 상태 | `#346AFF` |
| 배송 완료 / 무료배송 / 멤버십 | `#00891A` |
| 보조 텍스트 / 비활성 | `#888888` |

---

## 6. 라우팅 구조

```
/my  →  ProtectedRoute → MyPageLayout (LNB + Dashboard)
  ├── orders          →  OrdersPage
  ├── orders/:id      →  OrderDetailPage
  ├── profile         →  ProfilePage
  ├── points          →  PointsPage
  ├── reviews         →  MyReviewsPage
  └── inquiries       →  InquiriesPage
```

- 모든 `/my/*` 라우트는 `ProtectedRoute`로 보호 — 비로그인 시 `/login` 리다이렉트
- `MyPageLayout`이 `Outlet`을 통해 하위 페이지를 렌더링

---

## 7. 컴포넌트

| 컴포넌트 | 경로 | 설명 |
|---|---|---|
| `MyPageLayout` | `src/features/mypage/MyPageLayout.jsx` | LNB + Dashboard 공유 레이아웃 |

---

## 8. Mock 데이터

- 쿠폰: `MOCK_COUPON_COUNT = 3` (컴포넌트 내 상수)
- 멤버십: `MOCK_MEMBERSHIP = '골드'` (컴포넌트 내 상수)
- 포인트: `src/mocks/points.js` → `mockBaseQuery.js`를 통해 API로 제공
