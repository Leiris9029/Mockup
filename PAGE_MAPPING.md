# 페이지 - PRD 매핑 문서

이 문서는 각 페이지가 계획(PRD)의 어떤 부분을 구현하는지 정리한 것입니다.

---

## 구현 현황 요약

| 상태 | 설명 |
|------|------|
| ✅ | 완전히 구현됨 (UI + 기능) |
| 🔶 | UI만 구현됨 (Mock 데이터, 실제 백엔드 연동 필요) |
| ❌ | 미구현 |

---

## 페이지별 구현 상태

| Step | 페이지 | 경로 | UI | 기능 | 상태 |
|------|--------|------|:--:|:----:|:----:|
| - | HomePage | `/` | ✅ | 🔶 | 🔶 |
| 1 | ProtocolPage | `/setup/protocol` | ✅ | 🔶 | 🔶 |
| 2 | CohortPage | `/setup/cohort` | ✅ | 🔶 | 🔶 |
| 3 | DatasetPage | `/setup/dataset` | ✅ | 🔶 | 🔶 |
| 4 | QCPage | `/data/qc` | ✅ | 🔶 | 🔶 |
| 5 | SplitPage | `/data/split` | ✅ | 🔶 | 🔶 |
| 6 | PreprocessPage | `/data/preprocess` | ✅ | 🔶 | 🔶 |
| 7 | TrainingPage | `/train` | ✅ | 🔶 | 🔶 |
| 8 | EvaluationPage | `/evaluate` | ✅ | 🔶 | 🔶 |
| 9 | ExplanationPage | `/explain` | ✅ | 🔶 | 🔶 |
| 10 | ExportPage | `/export` | ✅ | 🔶 | 🔶 |

---

## 상세 구현 현황

### 1. HomePage (`/`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 새 실험 시작 카드 | ✅ | 클릭 시 `/setup/protocol`로 이동 |
| 최근 프로젝트 리스트 | 🔶 | Mock 데이터, 실제 저장소 연동 필요 |
| 10단계 파이프라인 표시 | ✅ | 시각적으로 표시됨 |
| 프로젝트 상태 저장/불러오기 | ❌ | LocalStorage 또는 백엔드 연동 필요 |

---

### 2. ProtocolPage (`/setup/protocol`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 파일 업로드 UI (Drag & Drop) | ✅ | 파일 선택 가능 |
| 파일 업로드 처리 | 🔶 | Mock 지연, 실제 서버 업로드 필요 |
| 프로토콜 분석 (AI) | 🔶 | Mock 데이터 반환, 실제 AI API 연동 필요 |
| TaskSpec 추출 결과 표시 | ✅ | 연구 제목, Task Type, Input Data 등 표시 |
| TaskSpec 저장 | ❌ | 상태 관리 또는 백엔드 저장 필요 |

---

### 3. CohortPage (`/setup/cohort`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 포함 기준 리스트 | ✅ | 체크박스로 ON/OFF 가능 |
| 제외 기준 리스트 | ✅ | 체크박스로 ON/OFF 가능 |
| 기준 추가 버튼 | 🔶 | UI만 있음, 실제 추가 기능 미구현 |
| 코호트 적용 | 🔶 | Mock 데이터로 결과 표시 |
| Funnel 시각화 (Total → Inclusion → Final) | ✅ | 시각적으로 표시됨 |
| Label Distribution 표시 | ✅ | Positive/Negative/Prevalence 표시 |
| CohortSpec 저장 | ❌ | 상태 관리 또는 백엔드 저장 필요 |

---

### 4. DatasetPage (`/setup/dataset`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 데이터 경로 입력 | ✅ | 텍스트 입력 가능 |
| Browse 버튼 | 🔶 | UI만 있음, 실제 폴더 선택 미구현 |
| 데이터 스캔 | 🔶 | Mock 데이터로 결과 표시 |
| 파일 목록 표시 | ✅ | 파일명, 크기, 채널 수, 샘플레이트 등 |
| 파일 상태 표시 (Valid/Warning) | ✅ | 아이콘으로 구분 |
| 감지된 포맷 정보 | ✅ | Format, Channels, Sample Rate, Duration |
| DatasetManifest 저장 | ❌ | 상태 관리 또는 백엔드 저장 필요 |

---

### 5. QCPage (`/data/qc`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| QC 체크 실행 버튼 | ✅ | 클릭 시 순차적 체크 실행 |
| 6가지 QC 항목 표시 | ✅ | Signal Quality, Channel, Sampling, Duration, PHI, Integrity |
| 실시간 진행 상태 | ✅ | Running 상태 애니메이션 |
| Pass/Warn/Fail 결과 표시 | ✅ | 아이콘 + 배지로 표시 |
| QC Gate 판정 | ✅ | 전체 Pass/Fail 메시지 |
| 실제 신호 품질 분석 | ❌ | 백엔드 신호 처리 로직 필요 |

---

### 6. SplitPage (`/data/split`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 분할 전략 선택 (Patient/Random/Stratified) | ✅ | 라디오 버튼으로 선택 |
| Random Seed 입력 | ✅ | 숫자 입력 + Shuffle 버튼 |
| Leakage 검사 | 🔶 | Mock 결과, 실제 검사 로직 필요 |
| 분할 결과 통계 | ✅ | Train/Val/Test 별 subjects, samples, positive, negative |
| SplitPlan 저장 | ❌ | 상태 관리 또는 백엔드 저장 필요 |

---

### 7. PreprocessPage (`/data/preprocess`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 6단계 전처리 파이프라인 | ✅ | Bandpass, Notch, Reref, ICA, Epoch, Normalize |
| 각 단계 ON/OFF 스위치 | ✅ | Switch 컴포넌트로 토글 |
| 각 단계 설정 버튼 | 🔶 | UI만 있음, 설정 모달 미구현 |
| Quick Presets | 🔶 | 버튼만 있음, 실제 적용 미구현 |
| 전처리 실행 | 🔶 | Mock 결과, 실제 신호 처리 필요 |
| 처리 결과 통계 | ✅ | Files, Epochs, Artifact Rate, SNR |
| PreprocessRecipe 저장 | ❌ | 상태 관리 또는 백엔드 저장 필요 |

---

### 8. TrainingPage (`/train`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 모델 아키텍처 선택 | ✅ | CNN-LSTM, Transformer, ResNet, RF |
| Start Training 버튼 | ✅ | 클릭 시 학습 시작 |
| Pause/Stop 버튼 | 🔶 | UI만 있음, 실제 기능 미구현 |
| 실시간 Progress Bar | ✅ | 진행률 표시 |
| 실시간 Metrics | ✅ | Loss, Accuracy, Val Loss, Val Accuracy |
| Epoch 카운터 | ✅ | 현재 Epoch / 총 Epoch |
| 시간/비용 추정 | ✅ | Elapsed, Remaining, Cost 표시 |
| 학습 완료 결과 | ✅ | Best AUROC, AUPRC, 총 시간, 비용 |
| Training Curves 차트 | 🔶 | Placeholder만 있음, 실제 차트 미구현 |
| 실제 모델 학습 | ❌ | ML 백엔드 연동 필요 |

---

### 9. EvaluationPage (`/evaluate`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| Run Evaluation 버튼 | ✅ | 클릭 시 평가 시작 |
| Primary Metrics 표시 | ✅ | AUROC, AUPRC, F1, Sensitivity, Specificity, ECE, Brier |
| 95% CI 표시 | ✅ | AUROC, AUPRC에 신뢰구간 표시 |
| Subgroup Analysis 탭 | ✅ | Age, Gender별 AUROC 표시 |
| Subgroup Warning | ✅ | 성능 저하 그룹 경고 메시지 |
| External Validation 탭 | ✅ | MASS Database 결과 표시 |
| Calibration 탭 | 🔶 | Placeholder만 있음, 실제 차트 미구현 |
| 실제 모델 평가 | ❌ | ML 백엔드 연동 필요 |

---

### 10. ExplanationPage (`/explain`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| Run xAI Analysis 버튼 | ✅ | 클릭 시 분석 시작 |
| Feature Importance 탭 | ✅ | Top 5 features + 중요도 바 차트 |
| Direction 표시 (positive/negative) | ✅ | 배지로 표시 |
| Attribution Map | 🔶 | Placeholder만 있음, 실제 시각화 미구현 |
| Failure Cases 탭 | ✅ | 실패 케이스 목록 + 원인 |
| Common Failure Patterns | ✅ | 패턴별 비율 요약 |
| Hypotheses 탭 | ✅ | AI 생성 가설 + Confidence + Evidence |
| 실제 xAI 분석 | ❌ | SHAP/LIME 등 백엔드 연동 필요 |

---

### 11. ExportPage (`/export`)

| 기능 | 상태 | 설명 |
|------|:----:|------|
| Report Template 선택 | ✅ | IMRaD, IRB, Internal |
| Output Format 선택 | ✅ | PDF, DOCX, HTML |
| Pre-Export QA Gate | ✅ | 5가지 체크 항목 표시 |
| Report Preview | ✅ | Methods, Results, Validation, Limitations |
| Export Report 버튼 | 🔶 | Mock 지연, 실제 파일 생성 미구현 |
| Export Artifact Pack 버튼 | 🔶 | Mock 지연, 실제 ZIP 생성 미구현 |
| Pipeline Complete 메시지 | ✅ | 완료 축하 메시지 |
| 실제 PDF/DOCX 생성 | ❌ | 문서 생성 라이브러리 연동 필요 |

---

## 공통 컴포넌트 구현 현황

### StepPageLayout

| 기능 | 상태 | 설명 |
|------|:----:|------|
| 사이드바 네비게이션 | ✅ | 10단계 전체 표시 |
| 현재 단계 하이라이트 | ✅ | Primary 색상으로 강조 |
| 완료된 단계 체크마크 | ✅ | 녹색 체크 아이콘 |
| 잠금 상태 표시 | ✅ | (현재 비활성화됨) |
| Progress Bar | ✅ | 하단에 진행률 표시 |
| 이전/다음 버튼 | ✅ | 헤더에 네비게이션 버튼 |
| 반응형 레이아웃 | 🔶 | 기본 반응형, 모바일 최적화 필요 |

---

## 미구현 기능 우선순위

### 높음 (Core Functionality)
1. **상태 관리 (Global State)** - 페이지 간 데이터 공유
2. **LocalStorage 연동** - 프로젝트 저장/불러오기
3. **실제 파일 업로드** - Protocol, Dataset 파일 처리
4. **차트 라이브러리 연동** - Calibration Curve, Training Curves

### 중간 (Enhanced Features)
5. **전처리 설정 모달** - 각 단계별 파라미터 조정
6. **Quick Presets 적용** - 전처리 프리셋 선택
7. **기준 추가/삭제** - Cohort 기준 동적 관리
8. **폴더 선택 다이얼로그** - 데이터 경로 선택

### 낮음 (Backend Required)
9. **실제 AI 분석** - Protocol → TaskSpec 추출
10. **실제 신호 처리** - 전처리, QC, 분할
11. **실제 모델 학습** - ML 백엔드 연동
12. **실제 xAI 분석** - SHAP/LIME 연동
13. **PDF/DOCX 생성** - 보고서 내보내기

---

## 파일 구조

```
src/
├── components/
│   └── layout/
│       └── StepPageLayout.tsx    # ✅ 공통 레이아웃
├── pages/
│   ├── HomePage.tsx              # ✅ 홈
│   ├── setup/
│   │   ├── ProtocolPage.tsx      # ✅ Step 1
│   │   ├── CohortPage.tsx        # ✅ Step 2
│   │   └── DatasetPage.tsx       # ✅ Step 3
│   ├── data/
│   │   ├── QCPage.tsx            # ✅ Step 4
│   │   ├── SplitPage.tsx         # ✅ Step 5
│   │   └── PreprocessPage.tsx    # ✅ Step 6
│   ├── TrainingPage.tsx          # ✅ Step 7
│   ├── EvaluationPage.tsx        # ✅ Step 8
│   ├── ExplanationPage.tsx       # ✅ Step 9
│   └── ExportPage.tsx            # ✅ Step 10
└── App.tsx                       # ✅ 라우팅 설정
```

---

## 요약

- **UI 구현**: 11/11 페이지 완료 (100%)
- **Mock 기능**: 모든 페이지에 시뮬레이션 동작 구현
- **실제 백엔드 연동**: 0% (모든 페이지 Mock 데이터 사용)
- **다음 단계**: 상태 관리 → LocalStorage → 차트 → 백엔드 API
