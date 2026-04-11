## 🛠️ Layout & CSS Hard-coded Spec

### 1. Global Layout (Layout System)
* **Container Width:** `1024px`
* **Column Gap (Summary Section):** `48px`
* **Vertical Section Margin:** `40px` (섹션 간 큰 구분선 기준)
* **Responsive Breakpoint:** `768px` (이하에서 1단 컬럼 스택)

---

### 2. CSS Design Tokens (Computed Values)

```css
:root {
  /* Colors */
  --color-primary: #0073E9;      /* 쿠팡 블루 */
  --color-star: #FFBB00;         /* 별점 노랑 */
  --color-text-main: #111111;    /* 기본 텍스트 */
  --color-text-sub: #555555;     /* 보조/메타 정보 */
  --color-border-light: #EEEEEE; /* 일반 구분선 */
  --color-bg-gray: #FAFAFA;      /* 필터 바 배경 */

  /* Typography */
  --font-size-score: 42px;       /* 총점 숫자 */
  --font-size-title: 20px;       /* 섹션 타이틀 */
  --font-size-body: 14px;        /* 리뷰 본문 */
  --font-size-meta: 12px;        /* 날짜, 옵션 정보 */

  /* Spacing */
  --spacing-section: 2.5rem;     /* 40px */
  --spacing-card-py: 1.5rem;     /* 24px */
}
```

---

### 3. Core Component Layout Specs

#### A. Review Summary Dashboard (상단 요약)
좌측 총점과 우측 그래프의 비율은 **1:2** 입니다.
```css
/* Layout 구조 */
.summary-container {
  display: flex;
  align-items: center;
  padding: 32px 24px;
  border-top: 1px solid var(--color-border-light);
  border-bottom: 1px solid var(--color-border-light);
  gap: 48px;
}

/* 별점 그래프 막대 */
.rating-bar-bg {
  width: 140px;
  height: 8px;
  background-color: #F0F0F0;
  border-radius: 4px;
}
.rating-bar-fill {
  height: 100%;
  background-color: #333333;
  border-radius: 4px;
}
```

**로딩 상태:** 숫자·별·바 영역 개별 스켈레톤 (`animate-pulse`) 표시. 데이터 로드 완료 전까지 Summary 전체를 스켈레톤으로 대체.

---

#### B. Filter Bar (Sticky)
스크롤 시 상단에 붙는 영역입니다.
```css
.filter-bar {
  position: sticky;
  top: 0; /* 네비게이션이 있다면 그 높이만큼 offset */
  height: 56px;
  background: #FFFFFF;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 16px;
  border-bottom: 1px solid var(--color-border-light);
  z-index: 10;
}
```

**정렬 탭 (4개 고정)**

| 탭 레이블 | `sort` 값 | 서버 정렬 기준 |
|---|---|---|
| 베스트순 (기본) | `best` | `helpfulCount` 내림차순 |
| 최신순 | `newest` | `createdAt` 내림차순 |
| 별점 높은순 | `highest` | `rating` 내림차순 |
| 별점 낮은순 | `lowest` | `rating` 오름차순 |

```css
/* 탭 기본 */
.sort-tab {
  padding: 8px 16px;
  font-size: 14px;
  border-bottom: 2px solid transparent;
  color: #888888;
  cursor: pointer;
  transition: color 0.15s, border-color 0.15s;
}
/* 탭 활성 */
.sort-tab.active {
  border-bottom-color: #111111;
  color: #111111;
  font-weight: 500;
}
```

**포토 리뷰 필터 (우측)**
```css
.filter-photo-only {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  color: #888888;
  cursor: pointer;
}
```
- 체크 시 `hasImage: true` 파라미터 서버 전송
- 탭 전환 또는 필터 변경 시 `page → 1` reset 필수

---

#### C. Review List Item (개별 리뷰)
```css
.review-item {
  padding: 24px 0;
  border-bottom: 1px solid #F4F4F4;
}

.user-profile-img {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  margin-right: 8px;
}

.review-content {
  margin-top: 16px;
  font-size: 15px;
  line-height: 1.65;
  color: #333333;
  word-break: break-all;
}

.photo-attachment-grid {
  display: flex;
  gap: 4px;
  margin-top: 12px;
}
.photo-item {
  width: 80px;
  height: 80px;
  object-fit: cover;
  border-radius: 4px;
}
```

**이미지 제한:** `images` 배열 최대 **5장**까지 표시 (`images.slice(0, 5)`). 초과분 미표시.

**도움돼요 버튼**
```css
/* 기본 상태 */
.helpful-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 9999px;
  font-size: 12px;
  border: 1px solid #E5E7EB;
  color: #888888;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
/* 활성 상태 (isHelpful: true) */
.helpful-btn.active {
  border-color: #346AFF;
  color: #346AFF;
  background-color: rgba(52, 106, 255, 0.05);
}
```

- `isMyReview: true`이면 버튼 **미표시**
- `helpfulCount > 0`일 때만 카운트 숫자 병기 — 예: `👍 도움이 돼요 (12)`
- **Optimistic Update:** 클릭 즉시 `isHelpful` 반전 + `helpfulCount` ±1. 서버 실패 시 `patch.undo()`로 원복

**로딩·전환 상태**
```css
/* 초기 로딩: 스켈레톤 5행 */
.skeleton-row {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
  background-color: #F0F0F0;
  border-radius: 4px;
}
/* 페이지 전환 중 (isFetching) */
.list-fetching {
  opacity: 0.5;
  pointer-events: none;
  transition: opacity 0.2s;
}
```

---

#### D. Photo Review Gallery (포토 리뷰 갤러리)

**데이터 소스:** 현재 페이지(`page`) 응답 리뷰 중 `images.length > 0`인 항목.
별도 API 호출 없이 기존 쿼리 캐시를 재사용하며, 페이지 이동 시 해당 페이지 이미지로 갱신됨.

```css
.photo-gallery {
  display: flex;
  gap: 8px;
  overflow-x: auto;           /* 모바일 가로 스크롤 허용 */
  padding-bottom: 4px;        /* 스크롤바 공간 확보 */
}
.photo-gallery-item {
  position: relative;
  flex-shrink: 0;             /* 가로 스크롤 시 이미지 축소 방지 */
  width: 80px;
  height: 80px;
}
.photo-gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #E5E7EB;
  aspect-ratio: 1 / 1;
}
/* 6번째 이미지 +N 오버레이 */
.photo-gallery-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #FFFFFF;
  font-size: 12px;
  font-weight: 600;
}
```

**표시 조건**
- 최대 **6개** 표시
- 7개 이상이면 6번째에 `+N` 오버레이 (N = 전체 포토 리뷰 수 − 6)
- 현재 페이지에 포토 리뷰가 없으면 갤러리 섹션 **전체 미표시**

---

#### E. Pagination (페이지네이션)

```css
.pagination {
  display: flex;
  justify-content: center;
  gap: 4px;
}
.page-btn {
  min-width: 32px;
  height: 32px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid #EEEEEE;
  font-size: 14px;
  color: #333333;
  cursor: pointer;
  transition: border-color 0.15s, color 0.15s;
}
/* 현재 페이지 */
.page-btn.active {
  border-color: #346AFF;
  color: #346AFF;
}
/* 이전/다음 화살표 */
.page-btn.nav {
  font-size: 18px;
  color: #555555;
}
.page-btn:disabled {
  color: #CCCCCC;
  border-color: #EEEEEE;
  cursor: not-allowed;
}
```

**슬라이딩 윈도우 알고리즘** (최대 7개 버튼)

| 조건 | 표시 범위 |
|---|---|
| `totalPages ≤ 7` | 전체 페이지 모두 표시 |
| `page ≤ 4` | 1 ~ 7 |
| `page ≥ totalPages − 3` | (totalPages−6) ~ totalPages |
| 그 외 | (page−3) ~ (page+3) |

- 이전/다음 버튼: `‹` `›` 문자 사용 (텍스트 아이콘)
- `page === 1`이면 이전 버튼 `disabled`
- `page === totalPages`이면 다음 버튼 `disabled`
- `totalPages ≤ 1`이면 페이지네이션 전체 **미표시**

---

### 4. Empty State

| 조건 | 이모지 | 제목 | 설명 |
|---|---|---|---|
| `summary.totalCount === 0` | ✍️ | 아직 리뷰가 없습니다 | 구매 후 첫 번째 리뷰를 남겨보세요! |
| 필터 결과 없음 | — | — | 해당 조건의 리뷰가 없습니다. |

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 64px 0;
  color: #888888;
  text-align: center;
}
.empty-state .emoji {
  font-size: 40px;
  margin-bottom: 12px;
}
.empty-state .title {
  font-size: 16px;
  font-weight: 500;
  color: #333333;
  margin-bottom: 4px;
}
.empty-state .desc {
  font-size: 14px;
  color: #888888;
}
```

---

### 5. 컴포넌트 파일 위치

```
src/features/reviews/components/
├── ReviewItem.jsx      공통 리뷰 카드 (StarRating named export 포함)
└── ReviewSummary.jsx   별점 요약 + 분포 바 (A 항목)

src/features/products/components/
└── ProductReviewSection.jsx   B~E 섹션 조립 컴포넌트 (자립형, productId prop만 수신)
```
