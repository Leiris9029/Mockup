# AI Co-Scientist Pipeline 개선 제안

## 현재 문제점
- 10단계가 너무 세분화되어 있어 사용자가 반복적인 클릭과 확인 작업 필요
- 일부 단계는 AI가 자동으로 처리하거나 초안을 제안할 수 있음
- 연구자의 핵심 역할(검증, 승인)과 단순 작업(설정, 실행)이 혼재

## 개선안: 10단계 → 8단계 통합

### **Step 1: Protocol Analysis & Setup**
**통합 대상**: 기존 Step 1 (Protocol Upload)
- **AI 역할**:
  - PRD 업로드 시 자동으로 연구 질문, 코호트 기준, 실험 설계 초안 생성
  - 필요한 데이터셋 특성, 라벨 정의, 평가 지표 제안
- **사용자 역할**: AI 제안 검토 및 승인/수정
- **출력**: `ProtocolBundle` (연구 설계 전체)

```
[AI Draft Proposal]
📋 Research Question: "Sleep spindle density predicts seizure recurrence..."
👥 Cohort Criteria: Age 18-65, drug-free >6 months, ...
🎯 Primary Metric: AUROC ≥ 0.75 (CI lower bound)
📊 Evaluation Plan: Stratified 5-fold CV + held-out hospital

[Approve] [Edit] [Regenerate]
```

---

### **Step 2: Dataset Discovery & Cohort**
**통합 대상**: 기존 Step 2 (Dataset) + Step 3 (Cohort)
- **AI 역할**:
  - 파일 스캔 후 자동으로 subject 속성 파악 (나이, 성별, 진단 등)
  - Protocol 기준에 맞춰 cohort 자동 분류 및 통계 제시
  - Inclusion/exclusion criteria 충족 여부 자동 체크
- **사용자 역할**: cohort 분류 결과 확인
- **출력**: `CohortBundle`

```
[AI Automatic Analysis]
✅ Found 342 subjects matching criteria
  - Training cohort: 245 subjects
  - Positive cases: 89 (36.3%)
  - Age distribution: 34.2 ± 12.5 years

⚠️ 12 subjects excluded: missing EEG channels
```

---

### **Step 3: Quality Control & Data Split**
**통합 대상**: 기존 Step 4 (QC) + Step 5 (Split)
- **AI 역할**:
  - QC 기준 자동 제안 (artifact threshold, duration, etc.)
  - QC 통과 데이터로 최적 split 비율 계산 (stratification 고려)
  - Leakage 위험 자동 검사 (subject-level split 강제)
- **사용자 역할**: QC threshold 조정 가능
- **출력**: `QCSplitBundle`

```
[AI Suggested QC Criteria]
- Minimum duration: 6 hours
- Artifact threshold: <20%
- Required channels: C3, C4, Fz

[AI Suggested Split]
Train: 60% (147 subjects) | Val: 20% (49) | Test: 20% (49)
Stratified by: age group, seizure type
✅ No subject overlap detected
```

---

### **Step 4: Preprocessing Pipeline**
**통합 대상**: 기존 Step 6 (Preprocess)
- **AI 역할**:
  - 데이터 특성(샘플링 레이트, 노이즈 레벨) 분석 후 전처리 파이프라인 자동 제안
  - 필터 설정, resampling, normalization 파라미터 추천
  - 타 연구 참고하여 best practice 제안
- **사용자 역할**: 파이프라인 검토 및 파라미터 조정
- **출력**: `PreprocessBundle`

```
[AI Recommended Pipeline]
1. Bandpass filter: 0.5-30 Hz (Butterworth, order=5)
2. Notch filter: 60 Hz (power line)
3. Resample: 256 Hz → 128 Hz
4. Z-score normalization: per-channel

📚 Based on: 15 similar sleep EEG studies
[Apply] [Customize]
```

---

### **Step 5: Model Architecture Selection**
**신규 단계** (현재 Training에 통합되어 있음)
- **AI 역할**:
  - 데이터 크기, 도메인, 태스크 특성에 맞는 모델 아키텍처 제안
  - Baseline 모델 + SOTA 모델 옵션 제시
  - Hyperparameter search space 제안
- **사용자 역할**: 모델 선택 또는 custom 아키텍처 정의
- **출력**: `ModelConfigBundle`

```
[AI Model Recommendations]
🥇 Recommended: TinySleepNet (120K params)
   - Best for: small-medium datasets (<500 subjects)
   - Expected AUROC: 0.78-0.82

🥈 Alternative: EEGNet (lightweight CNN)
🥉 Advanced: Transformer (requires >1000 subjects)

[Select] [Custom Architecture]
```

---

### **Step 6: Training & Hyperparameter Optimization**
**통합 대상**: 기존 Step 7 (Training)
- **AI 역할**:
  - Auto-tuning (Optuna/Ray Tune 기반)
  - Early stopping, checkpointing 자동 설정
  - 실시간 학습 곡선 모니터링
- **사용자 역할**: 학습 진행 모니터링, 필요시 중단
- **출력**: `TrainedModelBundle`

---

### **Step 7: Evaluation & Performance Analysis**
**통합 대상**: 기존 Step 8 (Evaluation)
- **AI 역할**:
  - 전체 메트릭 자동 계산 (AUROC, calibration, subgroup analysis)
  - Success metrics (A0-A7, B0-B10) 자동 평가
  - Critical fail 자동 검사
- **사용자 역할**: 결과 해석, 개선 방향 결정
- **출력**: `MetricsBundle`

---

### **Step 8: Mechanistic Interpretability**
**통합 대상**: 기존 Step 9 (Explanation)
- **AI 역할**:
  - 신경 회로 분석 자동 수행
  - Feature detector 시각화
  - Failure case 자동 분류 및 원인 추론
- **사용자 역할**: 메커니즘 해석 검증
- **출력**: `ExplainBundle`

---

### **Step 9: Report Generation**
**통합 대상**: 기존 Step 10 (Export)
- **AI 역할**:
  - Methods, Results, Discussion 초안 자동 생성
  - 그래프, 테이블 자동 배치
  - 논문 형식 포맷팅
- **사용자 역할**: 최종 검토 및 편집
- **출력**: `ReportBundle`

---

## 주요 변경점 정리

| 기존 | 개선 후 | 변화 |
|-----|--------|-----|
| Step 1: Protocol | **Step 1: Protocol Analysis** | AI가 초안 자동 생성 |
| Step 2: Dataset | **Step 2: Dataset & Cohort** | 통합 + AI 자동 분류 |
| Step 3: Cohort | ↑ 통합됨 | - |
| Step 4: QC | **Step 3: QC & Split** | 통합 + AI 기준 제안 |
| Step 5: Split | ↑ 통합됨 | - |
| Step 6: Preprocess | **Step 4: Preprocess** | AI 파이프라인 제안 |
| - | **Step 5: Model Selection** | 신규 추가 |
| Step 7: Training | **Step 6: Training** | Auto-tuning 강화 |
| Step 8: Evaluation | **Step 7: Evaluation** | 유지 |
| Step 9: Explanation | **Step 8: Mech-I** | 유지 |
| Step 10: Export | **Step 9: Report** | 유지 |

**10단계 → 9단계** (실질적으로는 사용자 개입 지점 감소)

---

## 사용자 경험 개선

### Before (현재)
```
[User uploads PRD]
→ [User manually fills protocol form]
→ [User scans dataset]
→ [User defines cohort criteria]
→ [User sets QC thresholds]
→ [User chooses split ratio]
→ ... 10 steps of clicking ...
```

### After (개선안)
```
[User uploads PRD]
→ [AI generates draft protocol] → User approves
→ [AI scans & classifies cohort automatically] → User reviews
→ [AI suggests QC+Split] → User adjusts if needed
→ [AI proposes preprocessing] → User customizes
→ [AI recommends models] → User selects
→ [Training runs automatically]
→ [Results auto-generated] → User interprets
```

**핵심**: 사용자는 "검토-승인-해석"에 집중, 반복 작업은 AI가 처리

---

## 구현 우선순위

### Phase 1: Quick Wins (1-2주)
- [ ] QC + Split 통합
- [ ] Dataset + Cohort 통합
- [ ] Protocol에 AI 초안 생성 UI 추가

### Phase 2: AI Enhancement (3-4주)
- [ ] Preprocessing pipeline auto-suggestion
- [ ] Model architecture recommendation
- [ ] Hyperparameter auto-tuning

### Phase 3: Full Automation (5-8주)
- [ ] End-to-end 원클릭 실행 모드 추가
- [ ] "Run entire pipeline with AI defaults" 버튼
- [ ] 사용자는 최종 검증만 수행

---

## 예상 효과

| 항목 | 현재 | 개선 후 |
|-----|------|--------|
| 총 단계 수 | 10 | 9 |
| 평균 클릭 수 | ~50 | ~20 |
| 설정 시간 | 30-60분 | 10-15분 |
| 오류 발생률 | 높음 (수동 설정) | 낮음 (AI 검증) |
| 재현성 | 보통 | 높음 (자동 문서화) |

---

## 질문

1. **자동화 수준**: 사용자가 얼마나 개입하길 원하는가?
   - Option A: 모든 단계 수동 승인 (보수적)
   - Option B: AI 제안 → 한 번에 승인 (공격적)
   - Option C: 하이브리드 (중요 단계만 승인)

2. **통합 우선순위**: QC+Split vs Dataset+Cohort 중 어느 것부터?

3. **UI 설계**: "AI Draft" 표시 방식
   - 별도 패널?
   - Inline suggestion?
   - Side-by-side 비교?
