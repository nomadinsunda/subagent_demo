# 문의 (Inquiries) 도메인 명세

## 1. 문의 데이터 구조

```js
{
  id: Number,               // 문의 고유 ID
  userId: Number,           // 작성자 ID
  userName: String,         // 작성자 이름 (표시용)
  productId: Number,        // 문의 대상 상품 ID (상품 문의인 경우)
  type: String,             // 문의 유형 (아래 타입 참고)
  title: String,            // 문의 제목
  content: String,          // 문의 내용
  isSecret: Boolean,        // 비밀 문의 여부
  status: String,           // 처리 상태 ("pending" | "answered")
  answer: {                 // 답변 (null이면 미답변)
    content: String,        // 답변 내용
    adminName: String,      // 답변 관리자명
    answeredAt: String,     // 답변 일시 (ISO 8601)
  } | null,
  createdAt: String,        // 작성 일시 (ISO 8601)
  updatedAt: String,        // 수정 일시 (ISO 8601)
}
```

---

## 2. 문의 유형 (Type)

| 타입값 | 표시명 |
|---|---|
| `"product"` | 상품 문의 |
| `"order"` | 주문/배송 문의 |
| `"return"` | 교환/반품 문의 |
| `"payment"` | 결제 문의 |
| `"etc"` | 기타 문의 |

---

## 3. 문의 처리 상태 (Status)

| 상태값 | 표시명 |
|---|---|
| `"pending"` | 답변 대기 |
| `"answered"` | 답변 완료 |

---

## 4. 비밀 문의 정책

- `isSecret: true`인 문의는 **작성자 본인**과 **관리자**만 내용 열람 가능
- 목록에서는 제목을 "비밀 문의입니다"로 마스킹하여 표시
- 답변은 비밀 문의 여부와 관계없이 동일하게 처리

---

## 5. API 엔드포인트

### 일반 사용자
| Method | URL | 설명 |
|---|---|---|
| `GET` | `/inquiries/my` | 내 문의 목록 조회 |
| `GET` | `/products/:productId/inquiries` | 상품별 문의 목록 조회 |
| `GET` | `/inquiries/:id` | 문의 상세 조회 |
| `POST` | `/inquiries` | 문의 작성 |
| `PATCH` | `/inquiries/:id` | 문의 수정 (미답변 상태만 가능) |
| `DELETE` | `/inquiries/:id` | 문의 삭제 (미답변 상태만 가능) |

### 관리자 전용
| Method | URL | 설명 |
|---|---|---|
| `GET` | `/admin/inquiries` | 전체 문의 목록 조회 |
| `POST` | `/inquiries/:id/answer` | 문의 답변 등록 |
| `PATCH` | `/inquiries/:id/answer` | 답변 수정 |

---

## 6. 문의 작성 규칙

- 제목: 최소 5자, 최대 100자
- 내용: 최소 10자, 최대 1,000자
- 수정/삭제: `status: "pending"` 상태에서만 가능 (답변 완료 후 수정/삭제 불가)
- 상품 문의(`type: "product"`)의 경우 `productId` 필수

---

## 8. UI 입력 유효성 및 에러 처리

### 입력 유효성 규칙

| 필드 | 규칙 |
|---|---|
| 제목(`title`) | 5자 이상 |
| 내용(`content`) | 10자 이상 |

- 유효성 오류는 `alert()` 대신 해당 필드 하단 인라인 메시지로 표시
- 필드 수정 시 해당 필드의 에러 메시지 즉시 해제

### Mutation 에러 처리

| 작업 | 실패 시 처리 |
|---|---|
| 문의 등록 (`createInquiry`) | Toast "문의 등록에 실패했습니다. 다시 시도해 주세요." (error) |
| 문의 삭제 (`deleteInquiry`) | Toast "문의 삭제에 실패했습니다" (error) |

### 삭제 정책

- **삭제 전 `confirm()` 확인 필수** — 실수 삭제 방지
- 삭제 성공 후 해당 항목이 펼쳐진 상태였다면 (`openId === id`) `openId`를 `null`로 초기화

---

## 7. Mock 데이터 (`src/mocks/inquiries.js`)

- 초기 문의 데이터 (가변 데이터)
- `mockBaseQuery.js`가 모듈 레벨 `let` 변수로 복사하여 관리
- `src/mocks/inquiries.js` 원본 배열 직접 변경 금지
- 답변 완료 문의와 미답변 문의를 혼합하여 구성
