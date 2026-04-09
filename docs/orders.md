# 주문 (Orders) 도메인 명세

## 1. 주문 데이터 구조

```js
{
  id: Number,                   // 주문 고유 ID
  orderNumber: String,          // 주문번호 (예: "20250310-00001")
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
  estimatedDelivery: String,    // 도착 보장일 (ISO 8601 날짜)
  createdAt: String,            // 주문 일시 (ISO 8601)
  updatedAt: String,            // 최종 수정 일시 (ISO 8601)
}
```

---

## 2. 주문 상태값 (Order Status)

| 상태값 | 표시명 | 설명 |
|---|---|---|
| `"waiting"` | 결제 대기 | 주문 생성, 결제 미완료 |
| `"preparing"` | 배송 준비중 | 결제 확인 및 상품 준비 중 |
| `"shipping"` | 배송중 | 택배사에 상품 인계됨 |
| `"delivered"` | 배송 완료 | 수령 확인됨 |
| `"cancelled"` | 주문 취소 | 취소 처리 완료 |

### 상태 전이 규칙

- 취소 가능 상태: `"waiting"`, `"preparing"`
- `"shipping"` 이후는 취소 불가
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

- 총 **5개** 주문 (가변 데이터) — 각 상태별 최소 1개 이상 포함
- `mockBaseQuery.js`가 모듈 레벨 `let` 변수로 복사하여 관리
- `src/mocks/orders.js` 원본 배열 직접 변경 금지

---

## 6. 규칙

- 주문 생성(`POST /orders`) 시 `pointsEarned`는 포인트 도메인 명세의 적립율 정책에 따라 자동 계산
- 주문 시점의 `price`(salePrice)를 스냅샷으로 저장 → 이후 상품 가격 변동에 영향받지 않음
- 컴포넌트에서 주문 상태값 문자열을 하드코딩 금지 → 상수(`ORDER_STATUS`)로 관리

---

## 7. 에러 처리

### Query 에러

| 페이지 | 상황 | 처리 |
|---|---|---|
| 주문 목록 (`OrdersPage`) | 조회 실패 | `ErrorState` 컴포넌트 + "다시 시도" 버튼 (`refetch`) |
| 주문 상세 (`OrderDetailPage`) | 조회 실패 | `ErrorState` 컴포넌트 + "다시 시도" 버튼 (`refetch`) |

### Mutation 에러

| 작업 | 실패 시 처리 |
|---|---|
| 주문 취소 (`cancelOrder`) | Toast "주문 취소에 실패했습니다. 다시 시도해 주세요." (error) |

- 주문 취소는 `confirm()` 확인 후 실행 — 실수 방지

---

## 8. UI 구성 (My Page)

### 레이아웃

- **My Page 전용 레이아웃** (`MyPageLayout`): 좌측 LNB 사이드바 + 우측 메인
- **LNB 메뉴 그룹**:
  - 쇼핑정보: 주문내역, 장바구니
  - MY활동: 리뷰, 문의내역
  - 고객센터: 자주 묻는 질문
- **Dashboard**: 우측 상단에 포인트 / 쿠폰 / 멤버십 현황 요약 카드

### 컬러 시스템

| 용도 | 색상 |
|---|---|
| 상태 강조 (배송중 등) | `#346AFF` (Blue) |
| 프리미엄 배송 / 배송 완료 | `#00891A` (Green) |
| 보조 텍스트 | `#888888` (Gray) |

### 컴포넌트

| 컴포넌트 | 위치 | 설명 |
|---|---|---|
| `MyPageLayout` | `src/features/mypage/` | LNB + Dashboard 래퍼 레이아웃 |
| `StatusBadge` | `src/features/orders/components/` | 주문 상태 뱃지 |
| `OrderCard` | `src/features/orders/components/` | 주문 목록 카드 (헤더 / 상품 목록 / 액션 버튼) |
| `PeriodFilter` | `src/features/orders/components/` | 기간 필터 (1개월 / 3개월 / 6개월 / 전체) |

### 주문 카드 구조

- **상단 바**: 주문번호, 주문일, 상세보기 링크
- **본문**: 상품 이미지, 상품명, 가격, 수량
- **하단**: 합계 금액, 상태에 따른 액션 버튼
  - `shipping`: 배송 조회 (비활성 — Mock 모드)
  - `delivered`: 리뷰 작성 → `/my/reviews`
  - `waiting` / `preparing`: 주문 취소 → `OrderDetailPage`

### 개인정보 마스킹 정책

- 연락처(`phone`) 표시 시 중간 자리 마스킹: `010-1234-5678` → `010-****-5678`
- `maskPhone(phone)` 유틸 함수 사용 (`src/shared/utils/formatters.js`)
