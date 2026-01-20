import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FileText,
  Users,
  Database,
  Shield,
  Split,
  Settings,
  Cpu,
  BarChart3,
  Brain,
  FileOutput,
  Check,
  Lock,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

type StepStatus = "complete" | "current" | "locked" | "warning";

interface Step {
  id: number;
  name: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
  status: StepStatus;
  layer: string;
}

const steps: Step[] = [
  { id: 1, name: "연구계획서", path: "/step/1", icon: FileText, status: "complete", layer: "L0" },
  { id: 2, name: "코호트 정의", path: "/step/2", icon: Users, status: "complete", layer: "L0" },
  { id: 3, name: "데이터셋", path: "/step/3", icon: Database, status: "complete", layer: "L0" },
  { id: 4, name: "QC 검증", path: "/step/4", icon: Shield, status: "complete", layer: "L0" },
  { id: 5, name: "데이터 분할", path: "/step/5", icon: Split, status: "complete", layer: "L1" },
  { id: 6, name: "전처리", path: "/step/6", icon: Settings, status: "current", layer: "L1" },
  { id: 7, name: "모델 학습", path: "/step/7", icon: Cpu, status: "locked", layer: "L1" },
  { id: 8, name: "성능 평가", path: "/step/8", icon: BarChart3, status: "locked", layer: "L2" },
  { id: 9, name: "설명 분석", path: "/step/9", icon: Brain, status: "locked", layer: "L2" },
  { id: 10, name: "리포트", path: "/step/10", icon: FileOutput, status: "locked", layer: "L2" },
];

const layerNames: Record<string, string> = {
  "L0": "실험 준비",
  "L1": "데이터 처리",
  "L2": "결과 분석",
};

function StepIndicator({ step, isActive }: { step: Step; isActive: boolean }) {
  const Icon = step.icon;

  return (
    <Link
      to={step.status === "locked" ? "#" : step.path}
      className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors",
        isActive && "bg-primary/10 border border-primary/30",
        step.status === "complete" && !isActive && "text-foreground hover:bg-muted/50",
        step.status === "current" && !isActive && "text-primary hover:bg-primary/5",
        step.status === "warning" && "text-status-warn",
        step.status === "locked" && "text-muted-foreground/50 cursor-not-allowed"
      )}
    >
      <div className={cn(
        "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium",
        step.status === "complete" && "bg-status-pass text-white",
        step.status === "current" && "bg-primary text-white",
        step.status === "warning" && "bg-status-warn text-white",
        step.status === "locked" && "bg-muted text-muted-foreground"
      )}>
        {step.status === "complete" ? (
          <Check className="w-3.5 h-3.5" />
        ) : step.status === "locked" ? (
          <Lock className="w-3 h-3" />
        ) : step.status === "warning" ? (
          <AlertTriangle className="w-3 h-3" />
        ) : (
          step.id
        )}
      </div>
      <span className="hidden lg:inline">Step {step.id}:</span>
      <span>{step.name}</span>
    </Link>
  );
}

interface StepLayoutProps {
  children: ReactNode;
  currentStep: number;
  title: string;
  description?: string;
  input?: {
    label: string;
    description: string;
  };
  output?: {
    label: string;
    description: string;
  };
}

export function StepLayout({
  children,
  currentStep,
  title,
  description,
  input,
  output,
}: StepLayoutProps) {
  const location = useLocation();
  const current = steps.find(s => s.id === currentStep);
  const prevStep = steps.find(s => s.id === currentStep - 1);
  const nextStep = steps.find(s => s.id === currentStep + 1);

  // Group steps by layer
  const groupedSteps = steps.reduce((acc, step) => {
    if (!acc[step.layer]) acc[step.layer] = [];
    acc[step.layer].push(step);
    return acc;
  }, {} as Record<string, Step[]>);

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <h1 className="font-semibold text-lg">AI Co-Scientist</h1>
        </div>

        {/* Steps Navigation */}
        <nav className="flex-1 p-4 overflow-y-auto">
          {Object.entries(groupedSteps).map(([layer, layerSteps]) => (
            <div key={layer} className="mb-6">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2 px-3">
                {layer}: {layerNames[layer]}
              </div>
              <div className="space-y-1">
                {layerSteps.map(step => (
                  <StepIndicator
                    key={step.id}
                    step={step}
                    isActive={step.id === currentStep}
                  />
                ))}
              </div>
            </div>
          ))}
        </nav>

        {/* Current Status */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            현재 상태
          </div>
          <div className="text-sm space-y-1">
            {steps.filter(s => s.status === "complete").map(s => (
              <div key={s.id} className="flex items-center gap-2 text-muted-foreground">
                <Check className="w-3 h-3 text-status-pass" />
                <span>{s.name}: 완료</span>
              </div>
            ))}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/50 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Step {currentStep}: {title}</h2>
              {description && (
                <p className="text-muted-foreground mt-1">{description}</p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {prevStep && prevStep.status !== "locked" && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={prevStep.path}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    이전
                  </Link>
                </Button>
              )}
              {nextStep && nextStep.status !== "locked" && (
                <Button size="sm" asChild>
                  <Link to={nextStep.path}>
                    다음
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Link>
                </Button>
              )}
            </div>
          </div>

          {/* Input/Output Info */}
          {(input || output) && (
            <div className="flex gap-6 mt-4 text-sm">
              {input && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">입력:</span>
                  <span className="font-medium">{input.label}</span>
                  <span className="text-muted-foreground">({input.description})</span>
                </div>
              )}
              {output && (
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground">출력:</span>
                  <span className="font-medium">{output.label}</span>
                  <span className="text-muted-foreground">({output.description})</span>
                </div>
              )}
            </div>
          )}
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          {children}
        </div>
      </main>
    </div>
  );
}
