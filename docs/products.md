# 상품 (Products) 도메인 명세

## 1. 상품 데이터 구조

```js
{
  id: Number,               // 상품 고유 ID
  name: String,             // 상품명
  category: String,         // 카테고리 (아래 카테고리 목록 참고)
  price: Number,            // 정가 (원)
  discountRate: Number,     // 할인율 (0~100, 정수)
  salePrice: Number,        // 판매가 = calcSalePrice(price, discountRate)
  stock: Number,            // 재고 수량
  imageUrl: String,         // 대표 이미지 URL
  description: String,      // 상품 설명
  isActive: Boolean,        // 판매 활성화 여부
}
```

---

## 2. 카테고리 목록

| 카테고리 값 | 표시명 |
|---|---|
| `"electronics"` | 전자기기 |
| `"clothing"` | 의류 |
| `"food"` | 식품 |
| `"books"` | 도서 |
| `"sports"` | 스포츠 |
| `"beauty"` | 뷰티 |
| `"home"` | 홈/리빙 |
| `"toys"` | 완구 |

---

## 3. 판매가 계산 정책

```js
// calcSalePrice(price, discountRate)
salePrice = Math.floor(price * (1 - discountRate / 100))
```

- 할인율 0%: 정가와 동일
- 소수점은 버림(floor) 처리
- `salePrice`는 Mock 데이터 생성 시 `calcSalePrice`로 자동 계산되며, 별도 저장된 값을 사용하지 않음

---

## 4. API 엔드포인트

| Method | URL | 설명 |
|---|---|---|
| `GET` | `/products` | 상품 목록 조회 (필터/정렬 쿼리 파라미터 지원) |
| `GET` | `/products/:id` | 상품 상세 조회 |

### 쿼리 파라미터 (`GET /products`)
| 파라미터 | 타입 | 설명 |
|---|---|---|
| `category` | String | 카테고리 필터 |
| `sort` | String | 정렬 기준 (`"price_asc"`, `"price_desc"`, `"newest"`) |
| `keyword` | String | 상품명 검색 |
| `page` | Number | 페이지 번호 (1부터 시작) |
| `limit` | Number | 페이지당 항목 수 (기본값: 12) |

---

## 5. Mock 데이터 (`src/mocks/products.js`)

- 총 **16개** 상품 (불변 데이터 — mutation 없음)
- `mockProducts` 배열로 export
- 카테고리별 최소 2개 이상 분포
- `salePrice`는 생성 시점에 `calcSalePrice`로 계산하여 포함

---

## 6. 규칙

- 상품 데이터는 불변(Immutable) — 주문/리뷰와 달리 Mock 모드에서 수정 불가
- 컴포넌트에서 `src/mocks/products.js`를 직접 import 금지 → RTK Query 훅(`useGetProductsQuery`, `useGetProductQuery`)을 통해서만 접근
