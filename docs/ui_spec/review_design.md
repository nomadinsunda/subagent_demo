# 리뷰 페이지 디자인 명세

참고 이미지: `docs/images/cupang_review.png`

---

## 1. 디자인 시스템 (Global System)

| 항목 | 값 |
|---|---|
| Primary (CTA·하이라이트) | `#346AFF` |
| Heading | `#111111` |
| Body Text | `#333333` |
| Meta / Subtext | `#888888` |
| Divider | `1px solid #F2F2F2` |
| Rating Gauge | `#FF9900` |
| Helpful Active Border | `#E5E7EB` → active: `#346AFF` |

**Typography**
- 기본 서체: Pretendard / Noto Sans KR
- 본문: `font-size: 14px`, `line-height: 1.6`, `letter-spacing: -0.01em`
- 메타(작성자·날짜): `font-size: 12px`, `color: #888888`

---

## 2. 페이지 구조 (Section 순서)

`ProductReviewSection` 컴포넌트 내 렌더링 순서. 전체 좌우 여백은 부모 컨테이너의 `px-4`(16px)를 따른다.

```
Section 1  별점 요약 (ReviewSummary)
Section 2  포토 리뷰 갤러리
Section 3  정렬 탭 + 필터  ← Sticky
Section 4  리뷰 목록 (ReviewItem 반복)
Section 5  페이지네이션
```

---

## 3. Section별 상세 명세

### [Section 1] 별점 요약 (ReviewSummary)

**레이아웃: 1:2 수평 분할**

```
┌─────────────┬──────────────────────────────┐
│  평균 평점   │  별점 분포 바 (5→1점 순)     │
│  (1 비율)   │  (2 비율)                    │
└─────────────┴──────────────────────────────┘
```

- **평균 평점 영역** (`min-w-[80px]`, 중앙 정렬)
  - 숫자: `text-3xl font-bold`, `color: #111111`
  - 별: `StarRating` 컴포넌트, 소수점 반올림 후 표시
  - 총 개수: `text-xs`, `color: #888888`
- **분포 바 영역** (`flex-1`)
  - 5점 → 1점 순서로 배치
  - 게이지 색상: `#FF9900`, 배경: `bg-base-300`
  - 높이: `h-1.5`, `border-radius: 9999px`
  - 퍼센트 계산: `Math.round((count / totalCount) * 100)`
- **로딩 상태**: 스켈레톤 UI (`animate-pulse`) — 숫자·별·바 영역 개별 플레이스홀더

### [Section 2] 포토 리뷰 갤러리

- **데이터 소스**: 현재 페이지(`page`) 응답 리뷰 중 `images.length > 0`인 항목 (전체 리뷰 대상 아님)
  - 이유: 별도 API 호출 없이 기존 쿼리 캐시 재사용
  - 페이지 이동 시 갤러리도 해당 페이지 이미지로 갱신됨
- **표시 개수**: 최대 6개. 6번째 이미지에 `+N` 오버레이 (`bg-black/40`)
- **이미지 스타일**: `w-20 h-20 object-cover rounded-lg border border-base-200 aspect-square`
- **스크롤**: `overflow-x-auto` (모바일 가로 스크롤 허용)
- **조건부 렌더링**: 현재 페이지에 포토 리뷰가 없으면 섹션 전체 숨김

### [Section 3] 정렬 탭 + 필터 — **Sticky (필수)**

**Sticky 스펙**
- 위치: `sticky top-16 z-10` — Header 높이 64px(`h-16`) 바로 아래 고정
- 배경: `bg-base-100` — 스크롤 시 리뷰 카드 텍스트 은폐
- 하단 구분선: `border-b border-base-200`
- z-index: `z-10` (Header `z-50`보다 낮게)

**정렬 탭**

| 값 | 레이블 | 서버 정렬 기준 |
|---|---|---|
| `best` | 베스트순 (기본) | `helpfulCount` 내림차순 |
| `newest` | 최신순 | `createdAt` 내림차순 |
| `highest` | 별점 높은순 | `rating` 내림차순 |
| `lowest` | 별점 낮은순 | `rating` 오름차순 |

- 선택된 탭: `border-b-2 border-[#111111] font-medium color: #111111`
- 비선택 탭: `border-transparent color: #888888`
- 탭 전환 시 `page → 1` reset 필수

**포토 리뷰 필터**
- 우측 정렬 체크박스. 체크 시 `hasImage: true` 파라미터 서버 전송
- 변경 시 `page → 1` reset 필수
- 총 개수(`total`) 좌측 표시: `text-xs color: #888888`

### [Section 4] 리뷰 목록 (ReviewItem)

**ReviewItem 구조** (`src/features/reviews/components/ReviewItem.jsx`)

```
┌─ 아바타(8×8) ─ 작성자명 / 날짜 ─────── 별점 ─┐
│ 키워드 태그 (badge-ghost, 선택 표시)           │
│ 본문 (14px, #333333, line-height 1.6)          │
│ 이미지 썸네일 (최대 5장, w-20 h-20)            │
│ [actions 슬롯]                                 │
└────────────────────────────────────────────────┘
```

- **아바타**: `profileImage` 있으면 `<img>`, 없으면 이름 첫 글자 이니셜 원형
- **작성자명**: 마스킹 처리된 값 (서버 응답 그대로 표시 — 예: `홍*동`)
- **actions 슬롯**: 컨텍스트별 외부 주입
  - `ProductReviewSection`: 도움돼요 버튼 (`isMyReview: true`이면 미표시)
  - `MyReviewsPage`: 상품 링크 + 수정/삭제 버튼

**도움돼요 버튼**
- 기본: `border: 1px solid #E5E7EB`, `color: #888888`
- 활성(`isHelpful: true`): `border-color: #346AFF`, `color: #346AFF`, `background: rgba(52,106,255,0.05)`
- 카운트 표시: `helpfulCount > 0`일 때 `(N)` 병기
- **Optimistic Update**: 클릭 즉시 `isHelpful` 반전 + `helpfulCount` ±1. 서버 실패 시 `patch.undo()`로 롤백

**로딩·상태**
- 초기 로딩: 스켈레톤 5행 (`animate-pulse`)
- 페이지 전환 중(`isFetching`): 목록 `opacity-50 pointer-events-none`
- 결과 없음: "해당 조건의 리뷰가 없습니다." 텍스트

### [Section 5] 페이지네이션

- 중앙 정렬, `join` 컴포넌트 사용
- **최대 버튼 수**: 7개 (totalPages ≤ 7이면 전부, 초과 시 슬라이딩 윈도우)
- **슬라이딩 윈도우 알고리즘**:
  - `page ≤ 4`: 1~7 표시
  - `page ≥ totalPages - 3`: `(totalPages-6)~totalPages` 표시
  - 그 외: `(page-3)~(page+3)` 표시
- 이전/다음: `‹` `›` 문자 (아이콘 대체), 끝에서 `disabled`
- 활성 페이지: `btn-active`, `border-color: #346AFF`, `color: #346AFF`
- `totalPages ≤ 1`이면 미표시

---

## 4. 컴포넌트 파일 위치

```
src/features/reviews/components/
├── ReviewItem.jsx      공통 카드 (StarRating named export 포함)
└── ReviewSummary.jsx   별점 요약 + 분포 바

src/features/products/components/
└── ProductReviewSection.jsx   상품 상세용 조립 컴포넌트 (자립형)
```

---

## 5. Empty State

| 상황 | 문구 | 비고 |
|---|---|---|
| 리뷰 0개 (summary.totalCount === 0) | "아직 리뷰가 없습니다 / 구매 후 첫 번째 리뷰를 남겨보세요!" | 이모지 `✍️` |
| 필터 결과 없음 | "해당 조건의 리뷰가 없습니다." | 필터 초기화 버튼 없음 |
