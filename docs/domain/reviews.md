# 리뷰 (Reviews) 도메인 명세

## 1. 리뷰 데이터 구조

```js
{
  id: Number,           // 리뷰 고유 ID
  productId: Number,    // 대상 상품 ID
  orderId: Number,      // 연결된 주문 ID
  userId: Number,       // 작성자 ID
  userName: String,     // 작성자 이름 (마스킹 처리: 홍*동)
  profileImage: String, // 작성자 프로필 이미지 (선택)
  rating: Number,       // 평점 (1~5, 정수)
  content: String,      // 리뷰 내용
  images: String[],     // 리뷰 이미지 URL 배열 (최대 5장)
  tags: String[],       // 리뷰 키워드 태그 (예: "기호성 좋아요", "배송 빨라요")
  helpfulCount: Number, // '도움돼요' 추천 수
  isHelpful: Boolean,   // 현재 사용자의 '도움돼요' 클릭 여부
  isMyReview: Boolean,  // 현재 사용자의 리뷰 여부
  createdAt: String,    // 작성 일시 (ISO 8601)
  updatedAt: String,    // 수정 일시 (ISO 8601)
}
```

---

## 2. 리뷰 작성 및 상호작용 규칙

- **작성 조건**: 주문 상태가 `"delivered"`(배송 완료)인 경우에만 작성 가능
- **1주문 1리뷰**: 동일 주문(`orderId`) 내 동일 상품에 대해 1회만 작성 허용
- **수정/삭제**: 본인 리뷰(`isMyReview: true`)인 경우만 가능
- **평점 범위**: 1점 ~ 5점 (정수 필수)
- **내용 길이**: 최소 10자 이상, 최대 1,000자 이하
- **도움돼요 로직**: 
    - 본인 리뷰에는 '도움돼요' 클릭 불가
    - 클릭 시 `helpfulCount` 1 증가 (Optimistic Update 적용)

---

## 3. API 엔드포인트

| Method | URL | 설명 |
|---|---|---|
| `GET` | `/products/:productId/reviews` | 상품별 리뷰 목록 조회 |
| `GET` | `/products/:productId/reviews/summary` | 상품별 리뷰 통계(평균, 별점 분포) 조회 |
| `GET` | `/reviews/my` | 내 리뷰 목록 조회 |
| `POST` | `/reviews` | 리뷰 작성 (Multipart/form-data 권장) |
| `PATCH` | `/reviews/:id` | 리뷰 수정 |
| `DELETE` | `/reviews/:id` | 리뷰 삭제 |
| `POST` | `/reviews/:id/helpful` | 해당 리뷰 '도움돼요' 토글 |

### 쿼리 파라미터 (`GET /products/:productId/reviews`)
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `sort` | String | `"best"` (도움순, 기본) \| `"newest"` \| `"highest"` \| `"lowest"` |
| `hasImage` | Boolean | 포토 리뷰만 보기 여부 |
| `page` | Number | 페이지 번호 (1부터 시작) |
| `limit` | Number | 페이지당 항목 수 (기본값: 10) |

---

## 4. 평점 집계 및 통계

- **상세 응답 데이터**: `averageRating`(평균), `totalCount`(전체 개수), `ratingDistribution`(1~5점별 개수 객체) 포함
- **집계 방식**: Mock 환경에서는 `src/mocks/reviews.js` 배열을 `reduce`하여 실시간 계산
- **소수점 처리**: 평균 평점은 소수점 첫째 자리까지 표기 (예: 4.8)

---

## 5. Mock 데이터 관리 (`src/mocks/reviews.js`)

- **초기 데이터**: 총 **300개**의 더미 데이터 (반려동물 사료 관련 텍스트 포함)
- **데이터 복제**: `mockBaseQuery.js` 실행 시 원본 배열을 `let mockReviews = [...initialReviews]` 형태로 복사하여 메모리 상에서 CRUD 수행
- **이미지**: `https://picsum.photos` 또는 멍샵 전용 상품 이미지를 무작위 매칭

---

## 6. RTK Query 태그 전략

- **`ProvidesTags`**: 
    - `Reviews`: `[{ type: 'Reviews', id: 'LIST' }, { type: 'Reviews', id: productId }]`
    - `Product`: 상품 상세 정보 갱신용
- **`InvalidatesTags`**:
    - 리뷰 `CUD` 발생 시 `Reviews` 태그 무효화
    - 평균 평점 갱신을 위해 해당 `Product` 태그 무효화하여 상세 페이지 데이터 동기화

---

## 7. UI 유효성 및 인터랙션 가이드

### 입력 유효성 규칙

| 필드 | 규칙 | 에러 메시지 |
|---|---|---|
| 별점(`rating`) | 필수 선택 | "평점을 선택해 주세요." |
| 내용(`content`) | 10자 이상 | "최소 10자 이상 입력해 주세요." |

- **에러 표시**: `daisyUI`의 `label-text-alt text-error` 클래스를 사용하여 입력 필드 하단에 표시
- **실시간 검증**: `onChange` 시 에러 조건 미충족 시 메시지 즉시 제거

### Mutation 에러 처리 (Toast)

| 작업 | 실패 시 처리 (Toast Message) |
|---|---|
| 리뷰 작성 (`createReview`) | "리뷰 등록 중 오류가 발생했습니다." (error) |
| 리뷰 수정 (`updateReview`) | "리뷰 수정에 실패했습니다." (error) |
| 리뷰 삭제 (`deleteReview`) | "리뷰를 삭제할 수 없습니다." (error) |

### 삭제 정책

- **Confirm Dialog**: 삭제 버튼 클릭 시 `window.confirm("리뷰를 정말 삭제하시겠습니까? 삭제 후 복구가 불가능합니다.")` 실행 필수
- **Success Feedback**: 삭제 완료 후 "리뷰가 삭제되었습니다." 알림 표시 및 목록 리프레시 (Tag Invalidation)

