# EEG/PSG AI Co-Scientist

EEG(뇌전도) 및 PSG(수면다원검사) 데이터를 위한 AI 기반 연구 지원 플랫폼입니다. 품질 게이트 기반의 4단계 워크플로우를 통해 연구자들이 신경생리학적 데이터를 체계적으로 분석하고 검증할 수 있도록 지원합니다.

## 주요 기능

### 4단계 워크플로우

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Input     │───▶│  Pipeline   │───▶│  Results    │───▶│   Export    │
│  (데이터)   │    │ (평가 실행) │    │ (결과 검토) │    │ (내보내기)  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
       ✓                 ⚠                 🔒                 🔒
     Pass              Warn              Locked             Locked
```

### 페이지별 기능

#### 1. Input Page (데이터 입력)
- 데이터셋 업로드 및 설정
- PHI(개인건강정보) 스캔
- 데이터 매니페스트 검증
- 새 분석 실행 생성

#### 2. Pipeline Page (평가 파이프라인)
- 실시간 파이프라인 진행 상황 모니터링
- 아티팩트 관리 (모델, 데이터, 평가 결과)
- 단계별 실행 상태 추적
- 매니페스트 상세 정보

#### 3. Results Page (결과 검토)
- 모델 성능 메트릭 시각화 (ROC, PR 곡선)
- 혼동 행렬 분석
- AI 생성 리뷰 카드
- 인간 검토자 피드백 시스템

#### 4. Export Page (내보내기)
- 연구 보고서 생성 (PDF)
- 아티팩트 패키지 내보내기
- 감사 로그 및 추적성 보장

### Quality Gate 시스템 (EvalDock)

각 단계마다 오른쪽 사이드바에 품질 게이트가 표시됩니다:

- **Pass (통과)**: 모든 요구사항 충족
- **Warn (경고)**: 주의 필요, 외부 검증 권장
- **Fail (실패)**: 요구사항 미충족, 진행 불가

체크리스트 항목:
- 데이터 매니페스트 완료 여부
- PHI 스캔 통과 여부
- 포맷 검증 상태
- 외부 검증 필요 여부
- 분할 계획 승인 상태

## 기술 스택

- **Frontend Framework**: React 18 + TypeScript
- **Build Tool**: Vite
- **UI Components**: shadcn/ui + Radix UI
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Routing**: React Router DOM
- **State Management**: TanStack Query
- **Icons**: Lucide React

## 프로젝트 구조

```
src/
├── components/
│   ├── layout/
│   │   ├── AppHeader.tsx      # 상단 헤더 (스터디 정보, 사용자 메뉴)
│   │   ├── AppSidebar.tsx     # 좌측 네비게이션
│   │   ├── AppLayout.tsx      # 전체 레이아웃 래퍼
│   │   └── EvalDock.tsx       # 우측 품질 게이트 사이드바
│   ├── shared/
│   │   └── ReviewCard.tsx     # 리뷰 카드 컴포넌트
│   └── ui/                    # shadcn/ui 컴포넌트
├── pages/
│   ├── InputPage.tsx          # 데이터 입력 페이지
│   ├── PipelinePage.tsx       # 평가 파이프라인 페이지
│   ├── ResultsPage.tsx        # 결과 검토 페이지
│   ├── ExportPage.tsx         # 내보내기 페이지
│   └── NotFound.tsx           # 404 페이지
├── hooks/
│   └── use-toast.ts           # 토스트 알림 훅
├── lib/
│   └── utils.ts               # 유틸리티 함수
└── App.tsx                    # 메인 앱 컴포넌트
```

## 시작하기

### 요구사항
- Node.js 18.x 이상
- npm 또는 yarn

### 설치

```bash
# 의존성 설치
npm install

# 개발 서버 실행
npm run dev

# 빌드
npm run build

# 프로덕션 미리보기
npm run preview
```

### 사용 가능한 스크립트

| 명령어 | 설명 |
|--------|------|
| `npm run dev` | 개발 서버 실행 (Hot Reload) |
| `npm run build` | 프로덕션 빌드 |
| `npm run preview` | 빌드된 앱 미리보기 |
| `npm run lint` | ESLint 실행 |

## 주요 컴포넌트

### AppLayout
전체 애플리케이션 레이아웃을 관리합니다. Header, Sidebar, Main Content, EvalDock을 포함합니다.

```tsx
<AppLayout
  gateStatus="warn"
  gateName="Pre-Eval Gate"
  checklistItems={[...]}
  whySummary="..."
>
  {children}
</AppLayout>
```

### EvalDock
품질 게이트 상태와 체크리스트를 표시하는 우측 사이드바입니다.
- 접기/펼치기 기능
- 증거 링크 연결
- 재실행, 인간 검토 요청, 진행 버튼

### ReviewCard
AI가 생성한 리뷰 항목을 표시하고 사용자가 만족/수정/거부를 선택할 수 있습니다.

## 상태 표시

| 상태 | 색상 | 의미 |
|------|------|------|
| Pass | 녹색 | 검증 통과 |
| Warn | 주황색 | 주의 필요 |
| Fail | 빨간색 | 검증 실패 |
| Locked | 회색 | 접근 불가 (이전 단계 미완료) |

## 라이선스

Research-use only (연구 목적 전용)

---

Built with [Lovable](https://lovable.dev)
