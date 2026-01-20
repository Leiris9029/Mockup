import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Types
export interface TaskSpec {
  title: string;
  purpose: string;
  taskType: string;
  inputData: string;
  subjects: number;
  fileName?: string;
  fileSize?: number;
}

export interface CriteriaItem {
  id: string;
  text: string;
  type: 'include' | 'exclude';
  enabled: boolean;
}

export interface CohortSpec {
  criteria: CriteriaItem[];
  stats: {
    total: number;
    afterInclusion: number;
    afterExclusion: number;
    labelPositive: number;
    labelNegative: number;
  };
}

export interface DataFile {
  id: string;
  name: string;
  size: string;
  duration: string;
  channels: number;
  sampleRate: number;
  status: 'valid' | 'warning' | 'error';
  message?: string;
}

export interface DatasetManifest {
  path: string;
  files: DataFile[];
  format: string;
  totalSize: string;
  avgDuration: string;
}

export interface QCCheck {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'pass' | 'warn' | 'fail';
  value?: string;
}

export interface QCResult {
  checks: QCCheck[];
  passCount: number;
  warnCount: number;
  failCount: number;
  gateStatus: 'pass' | 'fail';
}

export interface SplitResult {
  strategy: string;
  seed: number;
  train: { subjects: number; samples: number; positive: number; negative: number };
  val: { subjects: number; samples: number; positive: number; negative: number };
  test: { subjects: number; samples: number; positive: number; negative: number };
  leakageChecked: boolean;
}

export interface PreprocessStep {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  config: string;
}

export interface PreprocessResult {
  steps: PreprocessStep[];
  stats: {
    filesProcessed: number;
    epochsCreated: number;
    artifactRate: number;
    avgSNR: number;
  };
}

export interface TrainingMetrics {
  epoch: number;
  loss: number;
  accuracy: number;
  valLoss: number;
  valAccuracy: number;
}

export interface TrainingResult {
  model: string;
  epochs: number;
  history: TrainingMetrics[];
  bestAUROC: number;
  bestAUPRC: number;
  totalTime: string;
  totalCost: string;
}

export interface EvaluationMetrics {
  auroc: { value: number; ci: [number, number] };
  auprc: { value: number; ci: [number, number] };
  f1: number;
  sensitivity: number;
  specificity: number;
  ece: number;
  brier: number;
}

export interface SubgroupResult {
  name: string;
  auroc: number;
  n: number;
  status: 'pass' | 'warn' | 'fail';
}

export interface EvaluationResult {
  metrics: EvaluationMetrics;
  subgroups: SubgroupResult[];
  externalValidation: {
    dataset: string;
    n: number;
    auroc: number;
    status: 'pass' | 'warn' | 'fail';
  };
  calibrationData: { predicted: number; observed: number }[];
}

export interface Feature {
  name: string;
  importance: number;
  direction: 'positive' | 'negative';
}

export interface FailureCase {
  id: string;
  prediction: number;
  actual: number;
  reason: string;
}

export interface Hypothesis {
  id: string;
  text: string;
  confidence: 'high' | 'medium' | 'low';
  evidence: string;
}

export interface ExplanationResult {
  topFeatures: Feature[];
  failureCases: FailureCase[];
  hypotheses: Hypothesis[];
}

export interface Project {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  currentStep: number;
  completedSteps: number[];
  taskSpec?: TaskSpec;
  cohortSpec?: CohortSpec;
  datasetManifest?: DatasetManifest;
  qcResult?: QCResult;
  splitResult?: SplitResult;
  preprocessResult?: PreprocessResult;
  trainingResult?: TrainingResult;
  evaluationResult?: EvaluationResult;
  explanationResult?: ExplanationResult;
}

interface ProjectStore {
  // Current project
  currentProject: Project | null;

  // All projects
  projects: Project[];

  // Actions
  createProject: (name: string) => string;
  loadProject: (id: string) => void;
  deleteProject: (id: string) => void;

  // Step completion
  setCurrentStep: (step: number) => void;
  completeStep: (step: number) => void;

  // Data setters
  setTaskSpec: (taskSpec: TaskSpec) => void;
  setCohortSpec: (cohortSpec: CohortSpec) => void;
  setDatasetManifest: (manifest: DatasetManifest) => void;
  setQCResult: (result: QCResult) => void;
  setSplitResult: (result: SplitResult) => void;
  setPreprocessResult: (result: PreprocessResult) => void;
  setTrainingResult: (result: TrainingResult) => void;
  setEvaluationResult: (result: EvaluationResult) => void;
  setExplanationResult: (result: ExplanationResult) => void;

  // Update project name
  updateProjectName: (name: string) => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      currentProject: null,
      projects: [],

      createProject: (name: string) => {
        const id = `project_${Date.now()}`;
        const newProject: Project = {
          id,
          name,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          currentStep: 1,
          completedSteps: [],
        };

        set(state => ({
          projects: [newProject, ...state.projects],
          currentProject: newProject,
        }));

        return id;
      },

      loadProject: (id: string) => {
        const project = get().projects.find(p => p.id === id);
        if (project) {
          set({ currentProject: project });
        }
      },

      deleteProject: (id: string) => {
        set(state => ({
          projects: state.projects.filter(p => p.id !== id),
          currentProject: state.currentProject?.id === id ? null : state.currentProject,
        }));
      },

      setCurrentStep: (step: number) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            currentStep: step,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      completeStep: (step: number) => {
        set(state => {
          if (!state.currentProject) return state;

          const completedSteps = state.currentProject.completedSteps.includes(step)
            ? state.currentProject.completedSteps
            : [...state.currentProject.completedSteps, step];

          const updated = {
            ...state.currentProject,
            completedSteps,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      setTaskSpec: (taskSpec: TaskSpec) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            taskSpec,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      setCohortSpec: (cohortSpec: CohortSpec) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            cohortSpec,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      setDatasetManifest: (manifest: DatasetManifest) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            datasetManifest: manifest,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      setQCResult: (result: QCResult) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            qcResult: result,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      setSplitResult: (result: SplitResult) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            splitResult: result,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      setPreprocessResult: (result: PreprocessResult) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            preprocessResult: result,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      setTrainingResult: (result: TrainingResult) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            trainingResult: result,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      setEvaluationResult: (result: EvaluationResult) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            evaluationResult: result,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      setExplanationResult: (result: ExplanationResult) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            explanationResult: result,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },

      updateProjectName: (name: string) => {
        set(state => {
          if (!state.currentProject) return state;

          const updated = {
            ...state.currentProject,
            name,
            updatedAt: new Date().toISOString(),
          };

          return {
            currentProject: updated,
            projects: state.projects.map(p => p.id === updated.id ? updated : p),
          };
        });
      },
    }),
    {
      name: 'ai-co-scientist-projects',
    }
  )
);
