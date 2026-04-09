# Cart (장바구니) 도메인

## 데이터 구조

### CartItem

| 필드 | 타입 | 설명 |
|---|---|---|
| id | number | 장바구니 항목 ID (자동 증가) |
| productId | number | 상품 ID |
| name | string | 상품명 (가격 스냅샷) |
| imageUrl | string | 상품 이미지 URL (스냅샷) |
| price | number | 담을 당시 판매가 스냅샷 |
| stock | number | 현재 재고 (수량 상한 계산용) |
| quantity | number | 수량 (1 이상, stock 이하) |

## 비즈니스 정책

| 정책 | 내용 |
|---|---|
| 가격 스냅샷 | 담을 시점의 `salePrice`를 `price`에 저장. 이후 상품 가격 변동과 무관 |
| 중복 담기 | 동일 `productId`가 이미 존재하면 새 항목 추가 대신 수량 합산 |
| 수량 상한 | 수량은 1 이상, `stock` 이하로 제한 |
| 배송비 | 상품금액 합계 50,000원 이상 → 무료, 미만 → 3,000원 |
| 포인트 적립 예상 | 결제 금액의 1% (표시용, 실제 적립은 주문 완료 시) |

## API 엔드포인트

| 메서드 | URL | 설명 | RTK Query |
|---|---|---|---|
| GET | /cart | 장바구니 목록 조회 | `useGetCartQuery` |
| POST | /cart | 상품 담기 (중복 시 합산) | `useAddToCartMutation` |
| PATCH | /cart/:id | 수량 변경 | `useUpdateCartItemMutation` |
| DELETE | /cart/:id | 항목 삭제 | `useRemoveFromCartMutation` |
| DELETE | /cart/clear | 전체 비우기 | `useClearCartMutation` |

## RTK Query 태그 전략

- `providesTags`: `[{ type: 'Cart', id: 'LIST' }]`
- `invalidatesTags`: 모든 mutation이 `[{ type: 'Cart', id: 'LIST' }]` 무효화
- Header의 `useGetCartQuery`는 `skip: !isLoggedIn` 옵션으로 비로그인 시 요청 생략

## Mock 데이터

- **원본**: `src/mocks/cart.js` — `export const mockCartItems = []` (초기 빈 배열)
- **가변 상태**: `mockBaseQuery.js` 모듈 레벨 `let cartItems` 변수로 관리
- `src/mocks/cart.js` 직접 변경 금지 — mockBaseQuery.js에서만 수정

## UI 구성

| 페이지/컴포넌트 | 경로 | 설명 |
|---|---|---|
| CartPage | `/cart` | 장바구니 전체 페이지 (ProtectedRoute) |
| Header | — | 장바구니 아이콘 + 수량 뱃지 |
| ProductDetailPage | — | "장바구니 담기" / "바로 구매" 버튼 |

## 라우트

```
/cart  →  CartPage (ProtectedRoute — 비로그인 시 /login 리다이렉트)
```
