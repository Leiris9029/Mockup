import { ReactNode } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
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
  Home,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  shortName: string;
  path: string;
  icon: React.ComponentType<{ className?: string }>;
}

const steps: Step[] = [
  { id: 1, name: "Protocol Upload", shortName: "Protocol", path: "/setup/protocol", icon: FileText },
  { id: 2, name: "Dataset / Cohort", shortName: "Data", path: "/setup/data", icon: Database },
  { id: 3, name: "Data Validation", shortName: "Validate", path: "/data/validation", icon: Shield },
  { id: 4, name: "Preprocessing", shortName: "Preprocess", path: "/data/preprocess", icon: Settings },
  { id: 5, name: "Model Training", shortName: "Training", path: "/train", icon: Cpu },
  { id: 6, name: "Evaluation", shortName: "Eval", path: "/evaluate", icon: BarChart3 },
  { id: 7, name: "Mech Interpretability", shortName: "Mech-I", path: "/explain", icon: Brain },
  { id: 8, name: "Export Report", shortName: "Export", path: "/export", icon: FileOutput },
];

interface StepPageLayoutProps {
  stepNumber: number;
  title: string;
  description?: string;
  children: ReactNode;
  prevPath?: string;
  nextPath?: string;
  prevLabel?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  onNext?: () => void;
}

export function StepPageLayout({
  stepNumber,
  title,
  description,
  children,
  prevPath,
  nextPath,
  prevLabel = "Previous",
  nextLabel = "Next",
  nextDisabled = false,
  onNext,
}: StepPageLayoutProps) {
  const location = useLocation();

  const isComplete = (id: number) => id < stepNumber;
  const isCurrent = (id: number) => id === stepNumber;
  const isLocked = (_id: number) => false; // 모든 페이지 접근 가능

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col shrink-0">
        {/* Logo */}
        <div className="p-4 border-b border-sidebar-border">
          <Link to="/" className="flex flex-col items-center hover:opacity-80 transition-opacity">
            <img src="/logo_white.png" alt="Risorius" className="h-8 w-auto object-contain" />
            <span className="text-[10px] text-sidebar-foreground/60 mt-1">AI Co-Neuroscientist</span>
          </Link>
        </div>

        {/* Home Link */}
        <div className="p-2 border-b border-sidebar-border">
          <Link
            to="/"
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Home</span>
          </Link>
        </div>

        {/* Steps Navigation */}
        <nav className="flex-1 p-2 overflow-y-auto">
          <div className="text-xs font-medium text-sidebar-foreground/50 uppercase tracking-wider px-3 py-2">
            Pipeline Steps
          </div>
          <div className="space-y-1">
            {steps.map((step) => {
              const Icon = step.icon;
              const complete = isComplete(step.id);
              const current = isCurrent(step.id);
              const locked = isLocked(step.id);

              return (
                <Link
                  key={step.id}
                  to={locked ? "#" : step.path}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors",
                    current && "bg-sidebar-primary/20 text-sidebar-primary-foreground border border-sidebar-primary/30",
                    complete && !current && "text-sidebar-foreground hover:bg-sidebar-accent",
                    !complete && !current && !locked && "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    locked && "text-sidebar-foreground/30 cursor-not-allowed"
                  )}
                  onClick={(e) => locked && e.preventDefault()}
                >
                  <div
                    className={cn(
                      "w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium shrink-0",
                      complete && "bg-status-pass text-white",
                      current && "bg-sidebar-primary text-sidebar-primary-foreground",
                      !complete && !current && "bg-sidebar-accent text-sidebar-foreground"
                    )}
                  >
                    {complete ? (
                      <Check className="w-3.5 h-3.5" />
                    ) : locked ? (
                      <Lock className="w-3 h-3" />
                    ) : (
                      step.id
                    )}
                  </div>
                  <span className="flex-1 truncate">{step.name}</span>
                  <Icon className={cn(
                    "w-4 h-4 shrink-0",
                    current ? "text-sidebar-primary" : "text-sidebar-foreground/50"
                  )} />
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Current Progress */}
        <div className="p-4 border-t border-sidebar-border">
          <div className="text-xs font-medium text-sidebar-foreground/50 mb-2">Progress</div>
          <div className="flex items-center gap-2">
            <div className="flex-1 h-2 bg-sidebar-accent rounded-full overflow-hidden">
              <div
                className="h-full bg-sidebar-primary rounded-full transition-all"
                style={{ width: `${(stepNumber / 8) * 100}%` }}
              />
            </div>
            <span className="text-xs font-mono text-sidebar-foreground/70">
              {stepNumber}/8
            </span>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-card border-b px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-bold">
                  {stepNumber}
                </div>
                <div>
                  <h1 className="text-xl font-bold">{title}</h1>
                  {description && (
                    <p className="text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-2">
              {prevPath && (
                <Button variant="outline" size="sm" asChild>
                  <Link to={prevPath}>
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    {prevLabel}
                  </Link>
                </Button>
              )}
              {nextPath && !onNext && (
                <Button size="sm" disabled={nextDisabled} asChild={!nextDisabled}>
                  {nextDisabled ? (
                    <>
                      {nextLabel}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </>
                  ) : (
                    <Link to={nextPath}>
                      {nextLabel}
                      <ChevronRight className="w-4 h-4 ml-1" />
                    </Link>
                  )}
                </Button>
              )}
              {onNext && (
                <Button size="sm" onClick={onNext} disabled={nextDisabled}>
                  {nextLabel}
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-5xl mx-auto space-y-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
