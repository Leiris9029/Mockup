import { Check, Circle, Loader2, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThinkingStep as ThinkingStepType, Evidence } from "@/types/thinking";
import { useStreamingText } from "@/hooks/useStreamingText";

interface ThinkingStepProps {
  step: ThinkingStepType;
  stepNumber: number;
  isActive: boolean;
  onStepComplete?: () => void;
}

export function ThinkingStep({ step, stepNumber, isActive, onStepComplete }: ThinkingStepProps) {
  const { displayedText, isComplete } = useStreamingText({
    text: step.reasoning,
    enabled: isActive && step.status === 'processing',
    speed: 15,
    onComplete: onStepComplete,
  });

  const getStatusIcon = () => {
    switch (step.status) {
      case 'complete':
        return <Check className="w-4 h-4 text-status-pass" />;
      case 'processing':
        return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
      case 'intervention':
        return <AlertCircle className="w-4 h-4 text-status-warn" />;
      default:
        return <Circle className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusStyles = () => {
    switch (step.status) {
      case 'complete':
        return 'border-status-pass/30 bg-status-pass/5';
      case 'processing':
        return 'border-primary/50 bg-primary/5';
      case 'intervention':
        return 'border-status-warn/50 bg-status-warn/5';
      default:
        return 'border-border border-dashed opacity-50';
    }
  };

  return (
    <div className={cn(
      "relative pl-8 pb-6",
      step.status === 'pending' && "opacity-60"
    )}>
      {/* Vertical line */}
      <div className={cn(
        "absolute left-[11px] top-6 bottom-0 w-0.5",
        step.status === 'complete' ? "bg-status-pass/30" : "bg-border"
      )} />

      {/* Step indicator */}
      <div className={cn(
        "absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center bg-background border-2",
        step.status === 'complete' && "border-status-pass",
        step.status === 'processing' && "border-primary",
        step.status === 'intervention' && "border-status-warn",
        step.status === 'pending' && "border-muted-foreground border-dashed"
      )}>
        {getStatusIcon()}
      </div>

      {/* Content */}
      <div className={cn(
        "rounded-lg border p-4 transition-all",
        getStatusStyles()
      )}>
        {/* Header */}
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-medium text-sm">
            Step {stepNumber}: {step.title}
          </h4>
          {step.confidence !== undefined && step.status !== 'pending' && (
            <span className="text-xs text-muted-foreground">
              {step.confidence}% confidence
            </span>
          )}
        </div>

        {/* Reasoning text with streaming effect */}
        {step.status !== 'pending' && (
          <div className="text-sm text-muted-foreground mb-3">
            {step.status === 'processing' && isActive ? (
              <>
                {displayedText}
                {!isComplete && <span className="animate-pulse">|</span>}
              </>
            ) : (
              step.reasoning
            )}
          </div>
        )}

        {/* Evidence */}
        {step.evidence.length > 0 && step.status !== 'pending' && (
          <div className="space-y-2 mb-3">
            {step.evidence.map((evidence) => (
              <EvidenceItem key={evidence.id} evidence={evidence} />
            ))}
          </div>
        )}

        {/* Conclusion */}
        {step.conclusion && (step.status === 'complete' || step.status === 'intervention') && (
          <div className={cn(
            "p-3 rounded-lg text-sm",
            step.status === 'complete' ? "bg-status-pass/10 text-status-pass" : "bg-status-warn/10 text-status-warn"
          )}>
            <span className="font-medium">Conclusion: </span>
            {step.conclusion}
          </div>
        )}

        {/* Pending state */}
        {step.status === 'pending' && (
          <div className="text-sm text-muted-foreground italic">
            Waiting for previous steps...
          </div>
        )}
      </div>
    </div>
  );
}

function EvidenceItem({ evidence }: { evidence: Evidence }) {
  const Icon = evidence.icon;

  return (
    <div className="flex items-start gap-2 p-2 bg-muted/30 rounded text-xs">
      <Icon className="w-3.5 h-3.5 text-primary mt-0.5 shrink-0" />
      <div>
        <div className="font-medium">{evidence.title}</div>
        <div className="text-muted-foreground">{evidence.detail}</div>
      </div>
    </div>
  );
}
