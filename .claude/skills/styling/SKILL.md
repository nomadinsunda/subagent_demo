---
name: styling
description: Tailwind CSS v4 + daisyUI v5 UI 구현 패턴...
user-invocable: false
priority: medium

triggers:
  # 1. UI / 컴포넌트 생성 (핵심)
  - intent: ["UI", "컴포넌트 생성", "화면 구현", "디자인", "스타일"]

  # 2. 스타일 관련 키워드
  - keywords: ["css", "style", "className", "tailwind"]

  # 3. daisyUI 컴포넌트
  - keywords: ["btn", "card", "modal", "alert", "badge", "input"]

  # 4. 레이아웃 관련
  - keywords: ["layout", "grid", "flex", "container"]

  # 5. 반응형 관련
  - keywords: ["responsive", "반응형", "mobile", "sm:", "lg:"]

  # 6. 파일 패턴
  - file_pattern:
      - "**/components/**"
---

# 스타일링 (Tailwind v4 + daisyUI v5)

이 프로젝트의 UI 구현 패턴과 daisyUI 컴포넌트 사용 방법을 정의한다.  
구체적인 컴포넌트 코드는 `examples/components.md` 참조.

---

## 설정

```css
/* src/index.css */
@import "tailwindcss";
@plugin "daisyui" {
  themes: light --default, dark;
}
```

```js
/* vite.config.js */
import tailwindcss from '@tailwindcss/vite'
plugins: [react(), tailwindcss()]
```

Tailwind v4는 `tailwind.config.js` 없음 — CSS에서 직접 설정.

---

## daisyUI 컴포넌트 우선 사용

커스텀 CSS 작성 전에 daisyUI 클래스를 먼저 검토한다.

### 자주 쓰는 컴포넌트 클래스

| 용도 | 클래스 |
|---|---|
| 버튼 | `btn`, `btn-primary`, `btn-outline`, `btn-ghost`, `btn-error`, `btn-sm`, `btn-lg` |
| 카드 | `card`, `card-body`, `card-title`, `card-actions` |
| 네비게이션 | `navbar`, `navbar-start`, `navbar-center`, `navbar-end` |
| 뱃지 | `badge`, `badge-primary`, `badge-success`, `badge-error`, `badge-warning`, `badge-sm` |
| 입력 | `input`, `input-bordered`, `textarea`, `select`, `checkbox`, `form-control`, `label` |
| 알림 | `alert`, `alert-error`, `alert-info`, `alert-success` |
| 로딩 | `loading`, `loading-spinner`, `loading-sm`, `loading-md`, `loading-lg` |
| 탭 | `tabs`, `tabs-bordered`, `tab`, `tab-active` |
| 아코디언 | `collapse`, `collapse-arrow`, `collapse-title`, `collapse-content` |
| 드롭다운 | `dropdown`, `dropdown-end`, `dropdown-content` |
| 테이블 | `table`, `table-sm` |
| 모달 | `modal`, `modal-box` |
| 토스트 | `toast`, `toast-top`, `toast-end` |
| 조인 | `join`, `join-item` |
| 구분선 | `divider` |
| 아바타 | `avatar`, `avatar placeholder` |
| Hero | `hero`, `hero-content` |
| Steps | `steps`, `step`, `step-primary` |

---

## 레이아웃 패턴

### 페이지 컨테이너
```jsx
// Layout.jsx가 자동 적용 — 페이지에서 별도 감쌀 필요 없음
<main className="flex-1 container mx-auto px-4 py-8 max-w-6xl">
  <Outlet />
</main>
```

### 그리드 (상품 카드)
```jsx
<div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
  {products.map(p => <ProductCard key={p.id} product={p} />)}
</div>
```

### 좁은 폼 레이아웃 (로그인, 프로필 등)
```jsx
<div className="max-w-sm mx-auto">   {/* 또는 max-w-2xl */}
```

---

## 색상 시스템

daisyUI 시맨틱 색상을 우선 사용. 하드코딩된 색상값 지양.

| 의미 | 클래스 |
|---|---|
| 주요 강조 | `text-primary`, `bg-primary`, `btn-primary` |
| 성공 | `text-success`, `badge-success` |
| 경고 | `text-warning`, `badge-warning` |
| 오류 | `text-error`, `badge-error`, `alert-error` |
| 정보 | `badge-info`, `alert-info` |
| 비활성 텍스트 | `text-base-content/50`, `text-base-content/70` |
| 배경 변형 | `bg-base-200`, `bg-base-300` |

---

## 반응형 원칙

모바일 퍼스트. 기본 클래스 → `sm:` → `lg:` 순으로 확장.

```jsx
// 모바일: 2열, 태블릿: 3열, 데스크탑: 4열
className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4"

// 모바일: 숨김, 데스크탑: 표시
className="hidden lg:flex"

// 모바일: 세로 스택, 태블릿: 가로 배치
className="flex flex-col sm:flex-row gap-3"
```

---

## 상태별 UI 패턴

```jsx
// 로딩
if (isLoading) return <Spinner />

// 에러
if (error) return (
  <div className="alert alert-error">
    <span>{error.data?.message || '오류가 발생했습니다'}</span>
  </div>
)

// 빈 상태
if (!data?.length) return (
  <div className="text-center py-20 text-base-content/50">
    <p className="text-5xl mb-4">🔍</p>
    <p>결과가 없습니다</p>
  </div>
)
```

---

## 피해야 할 패턴

```jsx
// ❌ 인라인 style 속성 사용
<div style={{ color: '#ff0000', marginTop: '16px' }}>

// ❌ 하드코딩된 Tailwind 색상
<p className="text-blue-500">     // text-primary 사용

// ❌ 임의 값(arbitrary value) 남용
<div className="mt-[17px] w-[324px]">   // 표준 spacing 사용

// ✅ 시맨틱 색상 + 표준 간격
<p className="text-primary mt-4 w-80">
```
