# 주문 (Orders) 도메인 명세

## 1. 주문 데이터 구조

```js
{
  id: Number,                   // 주문 고유 ID
  userId: Number,               // 주문자 ID
  status: String,               // 주문 상태 (아래 상태값 참고)
  items: [                      // 주문 상품 목록
    {
      productId: Number,
      name: String,
      price: Number,            // 주문 시점 판매가 (salePrice 스냅샷)
      quantity: Number,
      imageUrl: String,
    }
  ],
  shippingAddress: {
    recipient: String,          // 수령인
    phone: String,              // 연락처
    zipCode: String,            // 우편번호
    address: String,            // 기본 주소
    detailAddress: String,      // 상세 주소
  },
  payment: {
    method: String,             // 결제 수단 ("card" | "kakao_pay" | "naver_pay" | "bank_transfer")
    amount: Number,             // 최종 결제 금액 (상품금액 + 배송비 - 포인트 사용액)
  },
  pointsUsed: Number,           // 사용 포인트
  pointsEarned: Number,         // 적립 포인트
  shippingFee: Number,          // 배송비
  createdAt: String,            // 주문 일시 (ISO 8601)
  updatedAt: String,            // 최종 수정 일시 (ISO 8601)
}
```

---

## 2. 주문 상태값 (Order Status)

| 상태값 | 표시명 | 설명 |
|---|---|---|
| `"pending"` | 결제 대기 | 주문 생성, 결제 미완료 |
| `"paid"` | 결제 완료 | 결제 확인됨 |
| `"preparing"` | 상품 준비중 | 판매자 상품 준비 중 |
| `"shipped"` | 배송중 | 택배사에 상품 인계됨 |
| `"delivered"` | 배송 완료 | 수령 확인됨 |
| `"cancelled"` | 주문 취소 | 취소 처리 완료 |
| `"refunding"` | 환불 처리중 | 환불 진행 중 |
| `"refunded"` | 환불 완료 | 환불 완료 |

### 상태 전이 규칙
- 취소 가능 상태: `"pending"`, `"paid"`, `"preparing"`
- `"shipped"` 이후는 취소 불가 → 환불 절차로 전환
- `"delivered"` 상태에서만 리뷰 작성 가능

---

## 3. 배송비 정책

| 조건 | 배송비 |
|---|---|
| 주문 금액 **50,000원 이상** | **무료** |
| 주문 금액 50,000원 미만 | **3,000원** |

- 배송비는 포인트 할인 적용 전 **상품 금액 합계** 기준으로 계산
- `payment.amount = 상품금액합계 + shippingFee - pointsUsed`

---

## 4. API 엔드포인트

| Method | URL | 설명 |
|---|---|---|
| `GET` | `/orders` | 내 주문 목록 조회 |
| `GET` | `/orders/:id` | 주문 상세 조회 |
| `POST` | `/orders` | 신규 주문 생성 |
| `PATCH` | `/orders/:id/cancel` | 주문 취소 |

---

## 5. Mock 데이터 (`src/mocks/orders.js`)

- 초기 **2개** 주문 (가변 데이터)
- `mockBaseQuery.js`가 모듈 레벨 `let` 변수로 복사하여 관리
- `src/mocks/orders.js` 원본 배열 직접 변경 금지

---

## 6. 규칙

- 주문 생성(`POST /orders`) 시 `pointsEarned`는 포인트 도메인 명세의 적립율 정책에 따라 자동 계산
- 주문 시점의 `price`(salePrice)를 스냅샷으로 저장 → 이후 상품 가격 변동에 영향받지 않음
- 컴포넌트에서 주문 상태값 문자열을 하드코딩 금지 → 상수(`ORDER_STATUS`)로 관리
