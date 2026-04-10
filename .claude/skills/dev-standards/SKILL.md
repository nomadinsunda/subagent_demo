---
name: dev-standards
description: 멍샵 개발 표준. 기술 스택 고정값, Pure JS 규칙, RTK Query 전용 HTTP, Vite 환경변수, 보안 금지사항(토큰 저장·OAuth Secret), SPA 네비게이션 패턴. 모든 작업 시작 전 참조.
user-invocable: false

triggers:
  # 1. 거의 모든 개발 요청 (전역 적용)
  - intent: ["코드 생성", "코드 수정", "리팩토링", "버그 수정"]

  # 2. React / 프론트 작업 감지
  - keywords: ["React", "컴포넌트", "hook", "페이지", "UI"]

  # 3. 네트워크 / API 작업 감지
  - keywords: ["API", "fetch", "axios"]

  # 4. 라우팅 관련 작업
  - keywords: ["라우팅", "navigate", "페이지 이동"]

  # 5. 환경 변수 관련
  - keywords: ["env", "환경변수", "VITE"]
---

# 개발 표준 (Dev Standards)

모든 작업 시작 전 이 문서를 기준으로 기술 스택과 불변 규칙을 확인한다.  
`.claude/rules/tech-standards.md`의 구체적 적용 방법을 기술한다.

---

## 기술 스택 (고정)

| 영역 | 기술 | 버전 |
|---|---|---|
| UI 라이브러리 | React | 19.2.4+ |
| 번들러 | Vite | 8.0.1+ |
| 상태 관리 | Redux Toolkit + RTK Query | 2.11.2+ |
| 스타일링 | Tailwind CSS v4 + daisyUI v5 | - |
| 라우팅 | React Router DOM | v7 |
| 언어 | **JavaScript (JSX)** | ES2020+ |
| HTTP | **RTK Query (fetchBaseQuery / mockBaseQuery)** | - |

---

## 언어 규칙 (Pure JS)

```js
// ✅ 올바른 JavaScript
const fetchUser = async (id) => {
  const { data } = await getUser(id)
  return data
}

// ❌ TypeScript 문법 — 절대 사용 금지
const fetchUser = async (id: number): Promise<User> => { ... }
type UserState = { user: User | null }
interface ApiResponse<T> { data: T }
```

- `.ts`, `.tsx` 파일 생성 금지
- JSDoc 타입 주석(`/** @param {number} id */`)은 허용하나 강제하지 않음

---

## 네트워크 규칙 (No Axios)

```js
// ✅ RTK Query 훅으로만 데이터 페칭
const { data, isLoading } = useGetProductsQuery({ category: 'food' })
const [createOrder] = useCreateOrderMutation()

// ❌ 절대 사용 금지
import axios from 'axios'
axios.get('/products')
fetch('/api/products')           // RTK Query 외부에서 직접 fetch 금지
```

---

## 환경 변수 (Vite Env)

```js
// ✅
const apiUrl = import.meta.env.VITE_API_URL

// ❌
const apiUrl = process.env.REACT_APP_API_URL  // CRA 방식
const apiUrl = process.env.VITE_API_URL       // Node 방식
```

- 모든 클라이언트 환경 변수는 `VITE_` 접두어 필수
- 시크릿(API Key, OAuth Client Secret) `.env` 포함 금지 (**No OAuth Secret**)

---

## 보안 금지 사항 (No Token Storage · No OAuth Secret)

```js
// ❌ 토큰 로컬 저장 — 절대 금지
localStorage.setItem('access_token', token)
sessionStorage.setItem('refresh_token', token)
document.cookie = `access_token=${token}`      // HttpOnly 아닌 쿠키 직접 설정 금지

// ❌ 클라이언트 사이드 OAuth 시크릿 — 절대 금지
const CLIENT_ID = 'abc123'
const CLIENT_SECRET = 'secret'                 // 프론트엔드 코드에 절대 포함 금지
```

---

## SPA 네비게이션 (SPA Nav)

```jsx
// ✅
import { useNavigate, Link } from 'react-router-dom'
const navigate = useNavigate()
navigate('/my/orders')
<Link to="/products">상품 목록</Link>

// ❌
window.location.href = '/my/orders'    // 외부 리다이렉트 제외하고 금지
<a href="/products">상품 목록</a>      // 내부 라우트에 <a> 사용 금지
```

외부 OAuth 리다이렉트처럼 진짜 페이지 이탈이 필요한 경우만 `window.location.href` 허용.

---

## 파일 생성 원칙

- 새 파일 전 항상 기존 패턴 파일을 먼저 읽어 스타일 일관성 확인
- 컴포넌트: `PascalCase.jsx`
- 훅: `useCamelCase.js`
- 유틸·상수: `camelCase.js`
- API 슬라이스: `{domain}Api.js`
- Mock 데이터: `{domain}.js`
- 불필요한 파일·추상화 생성 금지 — 실제 필요한 것만

---

## 작업 시작 체크리스트

작업 시작 전 반드시 수행:
- [ ] `.claude/rules/` 확인 (doc-sync 우선)
- [ ] 관련 `docs/*.md` 비즈니스 명세 읽기 (**Docs First**)
- [ ] 수정할 파일 `Read` 도구로 먼저 읽기
- [ ] 기존 패턴과 일관성 유지 계획 수립
