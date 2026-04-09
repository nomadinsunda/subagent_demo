# 포인트 (Points) 도메인 명세

## 1. 포인트 데이터 구조

### 잔액 (Balance)
```js
{
  balance: Number,      // 현재 보유 포인트
  userId: Number,
}
```

### 포인트 내역 (History)
```js
{
  id: Number,
  userId: Number,
  type: String,         // 내역 유형 (아래 타입 참고)
  amount: Number,       // 변동 포인트 (양수: 적립, 음수: 사용/소멸)
  balance: Number,      // 변동 후 잔액
  description: String,  // 내역 설명
  orderId: Number,      // 연결된 주문 ID (주문 적립/사용 시)
  createdAt: String,    // 발생 일시 (ISO 8601)
  expiredAt: String,    // 만료 일시 (ISO 8601, null이면 미만료)
}
```

---

## 2. 포인트 유형 (Type)

| 타입값 | 표시명 | 설명 |
|---|---|---|
| `"earn_order"` | 구매 적립 | 주문 결제 완료 시 적립 |
| `"earn_review"` | 리뷰 적립 | 리뷰 작성 시 지급 |
| `"earn_event"` | 이벤트 적립 | 프로모션/이벤트 지급 |
| `"use_order"` | 주문 사용 | 주문 시 포인트 차감 |
| `"expire"` | 포인트 소멸 | 유효기간 만료로 소멸 |
| `"refund"` | 주문 취소 환급 | 주문 취소 시 사용 포인트 환급 |

---

## 3. 포인트 적립 정책

### 구매 적립
| 조건 | 적립율 |
|---|---|
| 기본 적립 | 결제 금액의 **1%** |
| 이벤트/등급 보너스 | 별도 공지 (현재 미적용) |

- 적립 기준: `payment.amount`(최종 결제 금액, 포인트 사용액 제외)
- 적립 시점: 주문 상태 `"delivered"` 확정 시
- 소수점 버림(floor) 처리

```js
// 계산 예시
pointsEarned = Math.floor(payment.amount * 0.01)
```

### 리뷰 적립
| 조건 | 적립 포인트 |
|---|---|
| 텍스트 리뷰 | **50포인트** |
| 포토 리뷰 (이미지 포함) | **100포인트** |

---

## 4. 포인트 사용 정책

- 최소 사용 단위: **100포인트**
- 1포인트 = 1원 (현금과 1:1 대응)
- 포인트로 결제 금액 전액 사용 가능 (최대 사용 제한 없음)
- 주문 취소 시 사용한 포인트 전액 환급 (`"refund"` 타입으로 복원)

---

## 5. 포인트 유효기간

- 적립일로부터 **1년**
- 만료 7일 전 사용자 알림 (추후 구현)
- 먼저 적립된 포인트부터 사용 (FIFO)

---

## 6. API 엔드포인트

| Method | URL | 설명 |
|---|---|---|
| `GET` | `/points/me` | 포인트 잔액 및 내역 조회 |

### 응답 구조
```js
{
  balance: Number,
  history: [ ...포인트 내역 배열 ]
}
```

---

## 7. Mock 데이터 (`src/mocks/points.js`)

```js
MOCK_POINT_BALANCE = {
  balance: 3500,
  userId: 1,
}

mockPointHistory = [
  // type, amount, balance, description, orderId, createdAt, expiredAt
]
```

- 포인트 잔액·내역은 불변 Mock (주문 시뮬레이션과 별도로 관리)
- 추후 주문 생성 시 `pointsUsed`를 반영하는 가변 처리 도입 가능
