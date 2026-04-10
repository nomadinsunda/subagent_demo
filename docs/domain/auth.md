# 인증 (Authentication) 도메인 명세

## 1. 인증 방식

### JWT + HttpOnly Cookie
| 쿠키명 | HttpOnly | 설명 |
|---|---|---|
| `access_token` | true | API 인가용. JS 접근 불가. 브라우저 자동 전송 |
| `refresh_token` | true | 토큰 갱신용. JS 접근 불가. 브라우저 자동 전송 |
| `XSRF-TOKEN` | false | CSRF 방지용. JS가 읽어 `X-XSRF-TOKEN` 헤더에 삽입 |

- 토큰은 Redux Store, localStorage, sessionStorage에 **절대 저장 금지**
- Redux Store에는 UI 렌더링용 사용자 정보(`user` 객체)만 저장

---

## 2. API 엔드포인트

| Method | URL | 설명 |
|---|---|---|
| `POST` | `/auth/login` | 이메일/비밀번호 로그인 |
| `POST` | `/auth/logout` | 로그아웃 (쿠키 삭제) |
| `POST` | `/auth/refresh` | Access Token 갱신 |
| `GET` | `/auth/me` | 현재 인증된 사용자 정보 조회 |

---

## 3. Silent Token Refresh (자동 갱신)

- API 응답 **401** 감지 시 `withReauth()`가 `/auth/refresh` 자동 호출
- 갱신 성공 시 원래 요청 재시도
- `/auth/refresh` 자체가 401 반환 시 → 즉시 로그아웃 처리 (무한 루프 방지)

---

## 4. OAuth2 소셜 로그인

### 지원 제공자
| Provider | 인가 경로 |
|---|---|
| Google | `GET /oauth2/authorization/google` |
| Kakao | `GET /oauth2/authorization/kakao` |
| Naver | `GET /oauth2/authorization/naver` |

### 흐름
1. 프론트엔드 → 제공자별 인가 경로로 리다이렉트
2. `state` nonce 생성 → `sessionStorage` 임시 저장 (CSRF 방지)
3. OAuth2 콜백(`/oauth2/callback`) 수신 → `state` 검증 → 즉시 삭제 (1회용)
4. `/auth/me` 호출로 세션 확정 및 사용자 정보 로드

### 규칙
- OAuth2 Client ID/Secret은 프론트엔드 코드 및 `.env`에 포함 금지 (백엔드 전담)
- `state` 검증은 `verifyOAuth2State()` 유틸 함수 사용

---

## 5. 앱 초기화 흐름

```
App 마운트
  └─ AuthInitializer: GET /auth/me
       ├─ 성공: Redux Store에 user 정보 저장 → 앱 렌더링
       └─ 실패(401): 비로그인 상태로 앱 렌더링
```

- 인증 상태 확정 전까지 스피너 표시 (FOUC 방지)
- 보호된 페이지 접근 차단 시 `location.pathname`을 `state`로 전달 → 로그인 후 복귀

---

## 6. Mock 응답 (`src/mocks/user.js`)

```js
MOCK_USER = {
  id: 1,
  email: "user@example.com",
  name: "홍길동",
  role: "USER",        // "USER" | "ADMIN"
  provider: "local",   // "local" | "google" | "kakao" | "naver"
}
```

### Mock 엔드포인트 동작
| URL | 동작 |
|---|---|
| `POST /auth/login` | `{ email, password }` 수신 → `MOCK_USER` 반환 |
| `GET /auth/me` | `MOCK_USER` 반환 |
| `POST /auth/refresh` | 성공 응답 반환 (토큰 갱신 시뮬레이션) |
| `POST /auth/logout` | 성공 응답 반환 |
