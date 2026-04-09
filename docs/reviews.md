# 리뷰 (Reviews) 도메인 명세

## 1. 리뷰 데이터 구조

```js
{
  id: Number,           // 리뷰 고유 ID
  productId: Number,    // 대상 상품 ID
  orderId: Number,      // 연결된 주문 ID
  userId: Number,       // 작성자 ID
  userName: String,     // 작성자 이름 (표시용)
  rating: Number,       // 평점 (1~5, 정수)
  content: String,      // 리뷰 내용
  imageUrl: String,     // 리뷰 이미지 URL (선택)
  createdAt: String,    // 작성 일시 (ISO 8601)
  updatedAt: String,    // 수정 일시 (ISO 8601)
  isMyReview: Boolean,  // 현재 사용자의 리뷰 여부 (프론트엔드 판단용)
}
```

---

## 2. 리뷰 작성 규칙

- **작성 조건**: 주문 상태가 `"delivered"`인 경우에만 리뷰 작성 가능
- **1주문 1리뷰**: 동일 주문(`orderId`)으로 상품당 리뷰 1개만 허용
- **수정 가능**: 본인 리뷰에 한해 수정 가능
- **삭제 가능**: 본인 리뷰에 한해 삭제 가능
- **평점 범위**: 1점 ~ 5점 (정수)
- **내용 길이**: 최소 10자 이상

---

## 3. API 엔드포인트

| Method | URL | 설명 |
|---|---|---|
| `GET` | `/products/:productId/reviews` | 상품별 리뷰 목록 조회 |
| `GET` | `/reviews/my` | 내 리뷰 목록 조회 |
| `POST` | `/reviews` | 리뷰 작성 |
| `PATCH` | `/reviews/:id` | 리뷰 수정 |
| `DELETE` | `/reviews/:id` | 리뷰 삭제 |

### 쿼리 파라미터 (`GET /products/:productId/reviews`)
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `sort` | String | `"newest"` (기본) \| `"highest"` \| `"lowest"` |
| `page` | Number | 페이지 번호 (1부터 시작) |
| `limit` | Number | 페이지당 항목 수 (기본값: 10) |

---

## 4. 평점 집계

- 상품 상세 응답에 `reviewCount`(리뷰 수)와 `averageRating`(평균 평점, 소수점 1자리) 포함
- Mock 모드에서는 `src/mocks/reviews.js` 데이터 기반으로 집계

---

## 5. Mock 데이터 (`src/mocks/reviews.js`)

- 초기 **10개** 리뷰 (가변 데이터)
- `mockBaseQuery.js`가 모듈 레벨 `let` 변수로 복사하여 관리
- `src/mocks/reviews.js` 원본 배열 직접 변경 금지

---

## 6. RTK Query 태그 전략

- 리뷰 작성/수정/삭제 후 `invalidatesTags`로 해당 상품 리뷰 목록 및 내 리뷰 목록 자동 갱신
- 상품 상세의 `averageRating` 갱신을 위해 상품 태그도 함께 무효화

---

## 7. UI 입력 유효성 및 에러 처리

### 입력 유효성 규칙

| 필드 | 규칙 |
|---|---|
| 내용(`content`) | 10자 이상 |

- 유효성 오류는 `alert()` 대신 해당 필드 하단 인라인 메시지로 표시
- 필드 수정 시 에러 메시지 즉시 해제

### Mutation 에러 처리

| 작업 | 실패 시 처리 |
|---|---|
| 리뷰 수정 (`updateReview`) | Toast "리뷰 수정에 실패했습니다" (error) |
| 리뷰 삭제 (`deleteReview`) | Toast "리뷰 삭제에 실패했습니다" (error) |

### 삭제 정책

- **삭제 전 `confirm()` 확인 필수** — 실수 삭제 방지
