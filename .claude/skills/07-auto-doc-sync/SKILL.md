---
name: auto-doc-sync
description: 문서 자동 동기화 규칙(CLAUDE.md Rule 11~13). docs/*.md 업데이트 트리거 조건, 작업 전 필독 순서, 변경 보고 형식, 신규 도메인 docs 생성 기준. 비즈니스 로직 변경 시 참조.
user-invocable: false
---

# 07 · 문서 자동 동기화 (Auto Doc Sync)

CLAUDE.md Rules 12~14의 구체적 실행 방법을 정의한다.  
코드 변경 시 문서 갱신이 누락되는 일이 없도록 강제하는 가이드.

---

## 핵심 규칙 요약

| Rule | 내용 | 위반 시 |
|---|---|---|
| **12** | 비즈니스 로직 변경 시 관련 docs/*.md 자동 갱신 | 문서 ↔ 코드 괴리 발생 |
| **13** | 작업 전 docs/*.md와 CLAUDE.md 먼저 읽기 | 명세와 다른 구현 위험 |
| **14** | 작업 완료 보고 시 코드+문서 변경 모두 기술 | 변경 이력 불투명 |

---

## Rule 12: 어떤 변경이 docs 갱신을 트리거하는가

### 갱신이 필요한 코드 변경

| 변경 내용 | 갱신 대상 |
|---|---|
| 주문 상태값 추가/변경 (`ORDER_STATUS`) | `docs/domain/orders.md` § 주문 상태값 |
| 배송비 정책 변경 (`SHIPPING_FREE_THRESHOLD`, `SHIPPING_FEE`) | `docs/domain/orders.md` § 배송비 정책 |
| 포인트 적립율 변경 (`POINT_EARN_RATE`) | `docs/domain/points.md` § 포인트 적립 정책 |
| 리뷰 포인트 변경 (`REVIEW_POINT_TEXT`, `REVIEW_POINT_PHOTO`) | `docs/domain/points.md`, `docs/domain/reviews.md` |
| 상품 카테고리 추가/변경 (`CATEGORY_LABEL`) | `docs/domain/products.md` § 카테고리 목록 |
| API 엔드포인트 추가 (mockBaseQuery 라우트) | 해당 도메인 docs |
| 신규 도메인 추가 | `docs/domain/{domain}.md` 신규 생성 |
| 신규 뷰(레이아웃·복합 페이지) 추가 | `docs/view/{view}.md` 신규 생성 |
| 비즈니스 규칙 변경 (배송지 최대 수, 리뷰 최소 글자 수 등) | 해당 도메인 docs |

### 갱신 불필요한 변경

- UI 레이아웃·스타일 변경
- 리팩토링 (동작 변경 없음)
- 에러 메시지 문구 수정
- 성능 최적화

---

## Rule 13: 작업 시작 전 필독 순서

```
1. CLAUDE.md 전체 확인 (특히 Rules)
   ↓
2. 관련 docs/*.md 읽기
   - 주문 관련 → docs/domain/orders.md
   - 포인트 관련 → docs/domain/points.md
   - 인증 관련 → docs/domain/auth.md
   - 마이페이지 관련 → docs/view/mypage.md
   - 신규 도메인 → docs/domain/ 전체 훑기
   ↓
3. 수정할 코드 파일 Read 도구로 읽기
   ↓
4. 문서와 코드 사이 괴리 발견 시 → 먼저 사용자에게 확인
```

---

## Rule 14: 변경 보고 형식

작업 완료 후 반드시 아래 형식으로 보고. `examples/change-report.md` 참조.

```
## 변경 요약

### 수정된 코드
- `src/utils/constants.js` — SHIPPING_FREE_THRESHOLD 50000 → 70000 변경
- `src/api/mockBaseQuery.js` — 배송비 계산 로직 업데이트

### 수정된 문서 (Rule 14)
- `docs/domain/orders.md` § 배송비 정책 — 무료배송 기준 7만원으로 갱신
```

---

## 새 docs/*.md 작성 방법

`template.md`를 기반으로 생성. 필수 섹션:

1. **데이터 구조** — JS 객체 스키마 (JSDoc 스타일)
2. **비즈니스 정책** — 계산식, 제한 수치, 상태 전이 규칙
3. **API 엔드포인트** — Method / URL / 인증 필요 여부 / 설명
4. **Mock 데이터** — 파일 위치, 데이터 수, 불변/가변 여부
5. **RTK Query 태그 전략** — providesTags / invalidatesTags 설명

---

## 문서 누락 점검

```bash
bash .claude/skills/07-auto-doc-sync/scripts/validate-docs.sh
```

`src/mocks/` 파일과 `docs/` 파일의 1:1 대응을 검증한다.

---

## 문서 작성 품질 기준

### 좋은 비즈니스 정책 기술 예시 ✅
```markdown
## 배송비 정책
| 조건 | 배송비 |
|---|---|
| 주문 금액 **50,000원 이상** | **무료** |
| 주문 금액 50,000원 미만 | **3,000원** |

- 기준: 포인트 할인 적용 전 **상품 금액 합계**
- 코드 위치: `src/utils/constants.js` → `SHIPPING_FREE_THRESHOLD`, `SHIPPING_FEE`
```

### 나쁜 기술 예시 ❌
```markdown
## 배송비
배송비는 주문 금액에 따라 달라집니다.
```
코드 위치 없고, 정확한 수치 없음 → 나중에 코드와 괴리 발생.

---

## 코드 위치 참조 원칙

docs/*.md에 비즈니스 수치가 있으면 반드시 코드 위치를 명시:

```markdown
- 배송비 기준: `src/utils/constants.js` → `SHIPPING_FREE_THRESHOLD`
- 적립율: `src/utils/constants.js` → `POINT_EARN_RATE` (현재 0.01 = 1%)
- 계산 함수: `src/utils/formatters.js` → `calcShippingFee()`, `calcPointsEarned()`
```

이렇게 하면 코드 변경 시 docs의 어느 부분을 갱신해야 하는지 명확해진다.
