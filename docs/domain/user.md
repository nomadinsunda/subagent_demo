# 사용자 (User) 도메인 명세

## 1. 사용자 데이터 구조

```js
{
  id: Number,           // 사용자 고유 ID
  email: String,        // 이메일 (로그인 ID)
  name: String,         // 이름
  phone: String,        // 연락처 (선택)
  role: String,         // 권한 ("USER" | "ADMIN")
  provider: String,     // 가입 경로 ("local" | "google" | "kakao" | "naver")
  createdAt: String,    // 가입 일시 (ISO 8601)
  addresses: [          // 배송지 목록
    {
      id: Number,
      label: String,          // 배송지 별칭 (예: "집", "회사")
      recipient: String,      // 수령인
      phone: String,
      zipCode: String,
      address: String,
      detailAddress: String,
      isDefault: Boolean,     // 기본 배송지 여부
    }
  ]
}
```

---

## 2. 사용자 권한 (Role)

| Role | 설명 |
|---|---|
| `"USER"` | 일반 사용자. 상품 조회, 주문, 리뷰, 문의 가능 |
| `"ADMIN"` | 관리자. 상품 관리, 주문 상태 변경, 문의 답변 가능 |

---

## 3. API 엔드포인트

### 사용자 정보
| Method | URL | 설명 |
|---|---|---|
| `GET` | `/auth/me` | 내 정보 조회 (auth 도메인과 공유) |
| `PATCH` | `/users/me` | 내 정보 수정 (이름, 연락처) |
| `PATCH` | `/users/me/password` | 비밀번호 변경 (`local` provider만 가능) |

### 배송지 관리
| Method | URL | 설명 |
|---|---|---|
| `GET` | `/users/me/addresses` | 배송지 목록 조회 |
| `POST` | `/users/me/addresses` | 배송지 추가 |
| `PATCH` | `/users/me/addresses/:id` | 배송지 수정 |
| `DELETE` | `/users/me/addresses/:id` | 배송지 삭제 |
| `PATCH` | `/users/me/addresses/:id/default` | 기본 배송지 설정 |

---

## 4. 배송지 정책

- 배송지는 최대 **5개**까지 등록 가능
- 기본 배송지(`isDefault: true`)는 1개만 허용 → 변경 시 기존 기본 배송지 자동 해제
- 소셜 로그인 사용자(`provider != "local"`)는 비밀번호 변경 불가
- **배송지 삭제**: 실수 방지를 위해 `confirm()` 확인 후 삭제 (즉시 삭제 금지)

## 4-1. 입력 유효성 규칙

| 필드 | 규칙 | 정규식 |
|---|---|---|
| 연락처 (`phone`) | 한국 휴대폰 번호 형식 (선택 입력) | `/^01[016789]-\d{3,4}-\d{4}$/` |
| 우편번호 (`zipCode`) | 5자리 숫자 | `/^\d{5}$/` |

- 유효성 오류는 `alert()` 대신 해당 필드 하단 인라인 메시지로 표시
- 연락처가 비어있으면 형식 검증 생략 (선택 필드)

---

## 5. Redux Store 구조 (`features/auth/authSlice.js`)

```js
{
  auth: {
    user: null | { id, email, name, phone, role, provider },
    isInitialized: Boolean,   // /auth/me 요청 완료 여부 (AuthInitializer 제어)
  }
}
```

- `isInitialized: false` → 스피너 표시
- `isInitialized: true, user: null` → 비로그인 상태
- `isInitialized: true, user: { ... }` → 로그인 상태

---

## 6. Mock 데이터 (`src/mocks/user.js`)

```js
MOCK_USER = {
  id: 1,
  email: "user@example.com",
  name: "홍길동",
  phone: "010-1234-5678",
  role: "USER",
  provider: "local",
  createdAt: "2024-01-15T09:00:00Z",
  addresses: [
    {
      id: 1,
      label: "집",
      recipient: "홍길동",
      phone: "010-1234-5678",
      zipCode: "06234",
      address: "서울특별시 강남구 테헤란로 123",
      detailAddress: "101동 202호",
      isDefault: true,
    }
  ]
}
```
