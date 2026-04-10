# 🎨 리뷰 페이지 디자인 명세

이 문서는 리뷰 페이지 작성을 위해 참고하고 있는 쿠팡의 리뷰 페이지 캡쳐 이미지인 `cupang_review.png`를 정밀 분석하여, 리뷰 섹션의 계층 구조와 시각적 요소를 정의합니다.

## 1. 디자인 시스템 (Global System)
- **Primary Color**: `#346AFF` (Coupang Blue) - CTA 버튼, 하이라이트 텍스트, 페이지네이션 활성 상태
- **Neutral Colors**:
  - Headings: `#111111`
  - Body Text: `#333333`
  - Meta/Subtext: `#888888`
  - Divider: `1px solid #F2F2F2`
- **Typography**: 
  - 기본 서체: Pretendard / Noto Sans KR
  - 본문 가독성: `line-height: 1.6`, `letter-spacing: -0.01em`

## 2. 페이지 구조 및 레이아웃 (Layout Hierarchy)
전체 페이지는 아래 순서로 배치되며, 모바일 환경을 기준으로 좌우 여백은 `16px`을 유지합니다.

### [Section 1] 상품 요약 (Review Summary)
- **별점 평균**: 큰 숫자로 강조 (`text-3xl`, `font-bold`)
- **평가 분포**: 가로 막대 그래프 스타일 (비율에 따라 `#FF9900` 게이지 적용)

### [Section 2] 포토 리뷰 갤러리 (Photo Media Grid)
- **배치**: 5~6개 정사각형 썸네일 가로 나열
- **스타일**: `aspect-square`, `rounded-md`, `object-cover`
- **기능**: 마지막 이미지에 `+ 더보기` 오버레이 적용

### [Section 3] 필터 및 정렬 (Filter & Sort)
- **Tab 메뉴**: [베스트순 | 최신순 | 별점 높은순 | 별점 낮은순]
- **스타일**: 선택된 탭은 `#111111` 폰트 및 언더라인, 비선택은 `#888888`

### [Section 4] 상세 리뷰 리스트 (Review List)
- **Review Item**:
  - **작성자 정보**: 별점 + 작성자명 + 날짜 (`#888888`, `12px`)
  - **옵션 정보**: "구매 옵션: ..." 배경색 `#F8F8F8`, `12px`
  - **본문**: `#333333`, `14px`, 문단 간 간격 `mb-4`
- **도움이 돼요 버튼**:
  - Border: `1px solid #E5E7EB`
  - Active State: `border-[#346AFF]`, `text-[#346AFF]`
  - Icon: 따봉 아이콘(Outlined)

### [Section 5] 페이지네이션 (Pagination)
- **Center Alignment**: 화면 중앙 배치
- **Active State**: 원형 블루 테두리, 숫자 강조
- **Navigation**: 이전/다음 버튼은 텍스트가 아닌 화살표 아이콘 사용

## 3. 구현 주의사항 (Development Rules)
- **Sticky Header**: 스크롤 시 상품 요약 정보의 일부가 상단에 고정되는 'Sticky' 효과 검토.
- **Empty State**: 리뷰가 없을 경우 "첫 번째 리뷰를 남겨주세요" 문구와 버튼 노출.
- **Loading**: 데이터 로딩 시 스켈레톤 UI(Skeleton UI) 적용.

---
**참고 이미지**: `docs/images/cupang_review.png`