---
name: auth-security
description: HttpOnly 쿠키 기반 JWT 인증 구현 패턴. withReauth 401 자동 갱신 래퍼, AuthInitializer FOUC 방지, ProtectedRoute, OAuth2 소셜 로그인 state nonce 패턴. 인증 관련 작업 시 참조.
user-invocable: false

triggers:
  # 1. 인증/보안 관련 의도 (핵심)
  - intent: ["로그인", "인증", "인가", "회원", "세션", "보안"]

  # 2. Auth 키워드 (직접 매칭)
  - keywords: ["auth", "login", "logout", "jwt", "token"]

  # 3. OAuth / 소셜 로그인
  - keywords: ["oauth", "oauth2", "social", "카카오", "구글", "네이버"]

  # 4. API 인증 흐름
  - keywords: ["401", "refresh", "access_token", "refresh_token"]

  # 5. 보안 관련 키워드 (강제 적용)
  - keywords: ["cookie", "csrf", "xsrf", "sessionStorage", "localStorage"]

  # 6. 관련 파일 패턴
  - file_pattern:
      - "**/auth/**"
      - "**/ProtectedRoute.jsx"
      - "**/*auth*.js"
      - "**/*auth*.jsx"
---

# 인증 & 보안 (Auth & Security)

`docs/domain/auth.md` 명세를 코드로 구현할 때의 구체적 패턴을 정의한다.

---

## 인증 구조 요약

```
   브라우저                       서버
  │  ── POST /auth/login ──►   │  set-cookie: access_token (HttpOnly)
  │  ◄─ { user } ────────────  │             refresh_token (HttpOnly)
  │                            │             XSRF-TOKEN (JS readable)
  │
  │  Redux Store: { user } 만 저장 (토큰 절대 저장 금지)
```

---

## 1. Redux Auth 상태 (`features/auth/authSlice.js`)

세 가지 액션만 존재:

| 액션 | 역할 |
|---|---|
| `setUser(user)` | 로그인·me 조회 성공 시 user 저장 |
| `setInitialized()` | AuthInitializer 완료 신호 (스피너 해제) |
| `logout()` | user → null (withReauth 실패 시도 포함) |

**절대 하지 말 것:**
- authSlice에서 `api/` 폴더 import — 순환 의존성 발생
- 토큰·세션 정보를 state에 저장

---

## 2. withReauth 패턴 (`api/apiSlice.js`)

모든 `baseQuery`는 반드시 `withReauth`로 감싸야 한다 (**withReauth** — tech-standards).

```js
const withReauth = (baseQuery) => async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions)

  if (result.error?.status === 401) {
    // 1차: 토큰 갱신 시도
    const refreshResult = await baseQuery(
      { url: '/auth/refresh', method: 'POST' },
      api,
      extraOptions
    )

    if (refreshResult.data) {
      // 갱신 성공 → 원래 요청 재시도
      result = await baseQuery(args, api, extraOptions)
    } else {
      // 갱신 실패 → 즉시 로그아웃 (무한루프 방지)
      api.dispatch(logout())
    }
  }

  return result
}
```

**핵심:**
- `/auth/refresh` 자체가 401이면 루프 없이 즉시 `logout()` dispatch
- Mock 모드에서도 이 래퍼는 그대로 유지 (실제 401 발생 안 해도 구조는 동일)

---

## 3. AuthInitializer 패턴 (`components/initializers/AuthInitializer.jsx`)

앱 최상단에서 인증 상태를 복원한다. FOUC 방지를 위해 완료 전까지 스피너 표시.

```jsx
export default function AuthInitializer({ children }) {
  useGetMeQuery()                        // 마운트 시 /auth/me 자동 호출
  const { isInitialized } = useAuth()

  if (!isInitialized) return <Spinner fullscreen />  // 완료 전: 스피너
  return children                                     // 완료 후: 앱 렌더링
}
```

**authApi.js의 getMe 엔드포인트가 isInitialized를 제어:**
```js
getMe: builder.query({
  query: () => ({ url: '/auth/me' }),
  async onQueryStarted(_, { dispatch, queryFulfilled }) {
    try {
      const { data } = await queryFulfilled
      dispatch(setUser(data))               // 성공: user 저장
    } catch {
      dispatch(setUser(null))               // 실패(401): null 유지
    } finally {
      dispatch(setInitialized())            // 성공·실패 무관하게 반드시 호출
    }
  },
}),
```

`finally`에서 `setInitialized()` 호출이 빠지면 앱이 영원히 스피너 상태가 된다.

---

## 4. ProtectedRoute 패턴 (`components/common/ProtectedRoute.jsx`)

```jsx
export default function ProtectedRoute({ children }) {
  const { isLoggedIn } = useAuth()
  const location = useLocation()

  if (!isLoggedIn) {
    // location.pathname을 state로 전달 → 로그인 후 복귀
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return children
}
```

**LoginPage에서 복귀 처리:**
```jsx
const redirectTo = location.state?.from || '/'
useEffect(() => {
  if (isLoggedIn) navigate(redirectTo, { replace: true })
}, [isLoggedIn])
```

---

## 5. OAuth2 소셜 로그인 (SPA Nav · No OAuth Secret)

자세한 구현은 `examples/oauth2-callback.md` 참조.

**핵심 규칙:**
- 프론트엔드는 인가 URL로 리다이렉트만 수행 (`/oauth2/authorization/{provider}`)
- `state` nonce: `generateOAuth2State()` 생성 → sessionStorage 임시 저장
- 콜백에서: `verifyOAuth2State()` 호출 시 즉시 삭제 (1회용)
- Client ID / Secret 코드 포함 절대 금지

```js
// ✅ utils/oauth2.js
export const redirectToOAuth2 = (provider) => {
  const state = generateOAuth2State()   // sessionStorage에 저장
  window.location.href = `${BASE_URL}/oauth2/authorization/${provider}?state=${state}`
}

export const verifyOAuth2State = (received) => {
  const stored = sessionStorage.getItem('oauth2_state')
  sessionStorage.removeItem('oauth2_state')   // 즉시 삭제 (1회용 nonce)
  return stored !== null && stored === received
}
```

---

## 6. CSRF 처리 (백엔드 연결 시)

Mock 모드에서는 불필요. 실제 연결 시 `prepareHeaders`에서 처리:

```js
// api/apiSlice.js — realBaseQuery (현재 주석 처리됨)
prepareHeaders: (headers) => {
  const csrfToken = getCookie('XSRF-TOKEN')   // HttpOnly 아닌 쿠키에서 읽기
  if (csrfToken) headers.set('X-XSRF-TOKEN', csrfToken)
  return headers
}
```

`XSRF-TOKEN`은 `HttpOnly: false`이므로 JS에서 읽기 가능.  
`access_token`, `refresh_token`은 `HttpOnly: true`이므로 JS 접근 불가 (정상).
