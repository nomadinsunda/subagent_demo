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

→ 구현 패턴 상세: `.claude/skills/mock-architecture/`

## 인증

- JWT는 **HttpOnly 쿠키**로만 관리. Redux/localStorage/sessionStorage 토큰 저장 **금지**.
- 모든 `baseQuery`는 `withReauth()` 래퍼 필수 — 401 감지 시 `/auth/refresh` 자동 시도, 재실패 시 `logout()`.
- OAuth2: 프론트는 인가 URL 리다이렉트만 수행. Client ID/Secret 코드 포함 **금지**.

→ 구현 패턴 상세: `.claude/skills/auth-security/`

## 디렉토리 구조

→ `docs/project-structure.md` 참조

## 작업 시작 전 필독 파일

| 파일 | 내용 | 항상 읽기 |
|---|---|---|
| `docs/project-structure.md` | 전체 src/ 및 docs/ 구조 | ✅ |
| `docs/domain/{도메인}.md` | 도메인 비즈니스 명세 | 관련 작업 시 |
| `docs/view/{뷰}.md` | 뷰 레이아웃 명세 | 관련 작업 시 |
| `.claude/rules/` | AI Rules 1~13 (tech-standards, mock-architecture, doc-sync) | ✅ |
| `.claude/skills/{스킬}/SKILL.md` | 작업 유형별 패턴 | 관련 작업 시 |

## Skills 참조

| 스킬 | 경로 | 참고 시점 |
|---|---|---|
| 개발 표준 | `dev-standards/` | 모든 작업 전 |
| 인증·보안 | `auth-security/` | 인증 관련 작업 |
| RTK Query | `rtk-query-api/` | API 엔드포인트 추가·수정 |
| Mock 아키텍처 | `mock-architecture/` | 새 도메인 추가 |
| 스타일링 | `styling/` | UI 컴포넌트 작업 |
| 앱 구조 | `app-structure/` | 라우트·컴포넌트 추가 |
| 문서 동기화 | `auto-doc-sync/` | 비즈니스 로직 변경 시 |

## AI 규칙

→ `.claude/rules/` 폴더 참조 (tech-standards.md · mock-architecture.md · doc-sync.md)