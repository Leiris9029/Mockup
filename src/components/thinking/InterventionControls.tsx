import { Check, Pencil, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Alternative {
  id: string;
  label: string;
  description: string;
}

interface InterventionControlsProps {
  recommendation: string;
  confidence: number;
  alternatives: Alternative[];
  selectedAction: 'approve' | 'modify' | 'reject' | null;
  selectedAlternative: string | null;
  onApprove: () => void;
  onModify: (alternativeId: string) => void;
  onReject: () => void;
}

export function InterventionControls({
  recommendation,
  confidence,
  alternatives,
  selectedAction,
  selectedAlternative,
  onApprove,
  onModify,
  onReject,
}: InterventionControlsProps) {
  return (
    <div className="p-4 bg-status-warn/5 rounded-lg border border-status-warn/30">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <div className="w-6 h-6 rounded-full bg-status-warn/20 flex items-center justify-center">
          <span className="text-status-warn text-xs">?</span>
        </div>
        <span className="font-medium text-sm">Intervention Point</span>
      </div>

      {/* Current Recommendation */}
      <div className="p-3 bg-background rounded-lg border mb-4">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-xs text-muted-foreground mb-1">AI Recommendation</div>
            <div className="font-semibold text-primary">{recommendation}</div>
          </div>
          <Badge className="bg-status-pass/10 text-status-pass border-0">
            {confidence}% confidence
          </Badge>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Button
          variant={selectedAction === 'approve' ? 'default' : 'outline'}
          size="sm"
          className={cn(
            "gap-1",
            selectedAction === 'approve' && "bg-status-pass hover:bg-status-pass/90"
          )}
          onClick={onApprove}
        >
          <Check className="w-3.5 h-3.5" />
          Approve
        </Button>
        <Button
          variant={selectedAction === 'modify' ? 'default' : 'outline'}
          size="sm"
          className={cn(
            "gap-1",
            selectedAction === 'modify' && "bg-status-warn hover:bg-status-warn/90"
          )}
          onClick={() => onModify(alternatives[0]?.id || '')}
        >
          <Pencil className="w-3.5 h-3.5" />
          Modify
        </Button>
        <Button
          variant={selectedAction === 'reject' ? 'destructive' : 'outline'}
          size="sm"
          className="gap-1"
          onClick={onReject}
        >
          <X className="w-3.5 h-3.5" />
          Reject
        </Button>
      </div>

      {/* Alternatives (shown when Modify is selected) */}
      {selectedAction === 'modify' && alternatives.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-muted-foreground">
            Select an alternative:
          </div>
          {alternatives.map((alt) => (
            <label
              key={alt.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all",
                selectedAlternative === alt.id
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <input
                type="radio"
                name="alternative"
                value={alt.id}
                checked={selectedAlternative === alt.id}
                onChange={() => onModify(alt.id)}
                className="mt-0.5"
              />
              <div>
                <div className="font-medium text-sm">{alt.label}</div>
                <div className="text-xs text-muted-foreground">{alt.description}</div>
              </div>
            </label>
          ))}
        </div>
      )}

      {/* Reject explanation */}
      {selectedAction === 'reject' && (
        <div className="p-3 bg-status-fail/5 rounded-lg border border-status-fail/20 text-sm">
          <span className="text-status-fail font-medium">Note: </span>
          <span className="text-muted-foreground">
            Rejecting will restart the analysis with different parameters.
          </span>
        </div>
      )}
    </div>
  );
}
