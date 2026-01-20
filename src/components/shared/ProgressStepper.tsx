import { Link } from "react-router-dom";
import { Check, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: number;
  name: string;
  path: string;
  shortName: string;
}

const steps: Step[] = [
  { id: 1, name: "Protocol", path: "/setup/protocol", shortName: "Protocol" },
  { id: 2, name: "Data & Cohort", path: "/setup/data", shortName: "Data" },
  { id: 3, name: "Validation", path: "/data/validation", shortName: "Validate" },
  { id: 4, name: "Preprocess", path: "/data/preprocess", shortName: "Preproc" },
  { id: 5, name: "Training", path: "/train", shortName: "Train" },
  { id: 6, name: "Evaluation", path: "/evaluate", shortName: "Eval" },
  { id: 7, name: "Mech-I", path: "/explain", shortName: "Mech-I" },
  { id: 8, name: "Export", path: "/export", shortName: "Export" },
];

interface ProgressStepperProps {
  currentStep: number;
  completedSteps?: number[];
}

export function ProgressStepper({
  currentStep,
  completedSteps = []
}: ProgressStepperProps) {
  // By default, all steps before current are considered complete
  const isComplete = (stepId: number) => {
    return completedSteps.includes(stepId) || stepId < currentStep;
  };

  const isCurrent = (stepId: number) => stepId === currentStep;
  const isLocked = (stepId: number) => stepId > currentStep;

  return (
    <div className="flex items-center justify-between w-full">
      {steps.map((step, index) => (
        <div key={step.id} className="flex items-center flex-1 last:flex-none">
          {/* Step Circle */}
          <Link
            to={isLocked(step.id) ? "#" : step.path}
            className={cn(
              "flex flex-col items-center group",
              isLocked(step.id) && "cursor-not-allowed"
            )}
          >
            <div
              className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                isComplete(step.id) && "bg-status-pass text-white",
                isCurrent(step.id) && "bg-primary text-primary-foreground ring-4 ring-primary/20",
                isLocked(step.id) && "bg-muted text-muted-foreground"
              )}
            >
              {isComplete(step.id) ? (
                <Check className="w-4 h-4" />
              ) : isLocked(step.id) ? (
                <Lock className="w-3 h-3" />
              ) : (
                step.id
              )}
            </div>
            <span
              className={cn(
                "text-xs mt-1 whitespace-nowrap",
                isCurrent(step.id) && "text-primary font-medium",
                isComplete(step.id) && "text-muted-foreground",
                isLocked(step.id) && "text-muted-foreground/50"
              )}
            >
              {step.shortName}
            </span>
          </Link>

          {/* Connector Line */}
          {index < steps.length - 1 && (
            <div
              className={cn(
                "flex-1 h-0.5 mx-2",
                isComplete(step.id) ? "bg-status-pass" : "bg-muted"
              )}
            />
          )}
        </div>
      ))}
    </div>
  );
}
