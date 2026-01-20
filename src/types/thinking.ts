import { LucideIcon } from "lucide-react";

export type StepStatus = 'pending' | 'processing' | 'complete' | 'intervention';

export interface Evidence {
  id: string;
  type: 'data' | 'literature' | 'taskspec' | 'qc_result';
  title: string;
  detail: string;
  icon: LucideIcon;
}

export interface ThinkingStep {
  id: string;
  title: string;
  status: StepStatus;
  reasoning: string;
  evidence: Evidence[];
  conclusion?: string;
  confidence?: number;
  isInterventionPoint: boolean;
  recommendation?: {
    value: string;
    alternatives: { id: string; label: string; description: string }[];
  };
}

export interface Intervention {
  stepId: string;
  action: 'approve' | 'modify' | 'reject';
  originalValue: string;
  newValue?: string;
  reason?: string;
  timestamp: Date;
}

export interface ThinkingSession {
  id: string;
  pageContext: 'split' | 'preprocess' | 'training';
  steps: ThinkingStep[];
  currentStepIndex: number;
  status: 'idle' | 'running' | 'paused' | 'complete';
  interventions: Intervention[];
  finalRecommendation?: string;
}
