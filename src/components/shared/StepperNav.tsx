import { Check, Circle } from "lucide-react";
import { cn } from "@/lib/utils";

interface Step {
  id: string;
  label: string;
  status: "complete" | "current" | "upcoming";
}

interface StepperNavProps {
  steps: Step[];
  orientation?: "vertical" | "horizontal";
}

export function StepperNav({ steps, orientation = "vertical" }: StepperNavProps) {
  return (
    <nav
      className={cn(
        "flex",
        orientation === "vertical" ? "flex-col gap-0" : "flex-row gap-4"
      )}
    >
      {steps.map((step, index) => (
        <div
          key={step.id}
          className={cn(
            "flex items-start gap-3",
            orientation === "vertical" && "relative"
          )}
        >
          {/* Connector line */}
          {orientation === "vertical" && index < steps.length - 1 && (
            <div
              className={cn(
                "absolute left-[11px] top-6 w-0.5 h-[calc(100%-8px)]",
                step.status === "complete" ? "bg-status-pass" : "bg-border"
              )}
            />
          )}

          {/* Step indicator */}
          <div
            className={cn(
              "w-6 h-6 rounded-full flex items-center justify-center shrink-0 z-10",
              step.status === "complete" && "bg-status-pass",
              step.status === "current" && "bg-primary",
              step.status === "upcoming" && "bg-muted border-2 border-border"
            )}
          >
            {step.status === "complete" ? (
              <Check className="w-3.5 h-3.5 text-status-pass-foreground" />
            ) : step.status === "current" ? (
              <Circle className="w-2.5 h-2.5 fill-primary-foreground text-primary-foreground" />
            ) : (
              <Circle className="w-2.5 h-2.5 text-muted-foreground" />
            )}
          </div>

          {/* Step content */}
          <div className={cn("pb-6", orientation === "horizontal" && "pb-0")}>
            <span
              className={cn(
                "text-sm font-medium",
                step.status === "complete" && "text-status-pass",
                step.status === "current" && "text-primary",
                step.status === "upcoming" && "text-muted-foreground"
              )}
            >
              {step.label}
            </span>
          </div>
        </div>
      ))}
    </nav>
  );
}
