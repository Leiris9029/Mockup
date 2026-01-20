import { useState, useEffect, useCallback } from "react";
import { X, Brain, Play, Pause, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { ThinkingStep } from "./ThinkingStep";
import { InterventionControls } from "./InterventionControls";
import { ThinkingStep as ThinkingStepType, ThinkingSession } from "@/types/thinking";

interface ThinkingPanelProps {
  isOpen: boolean;
  onClose: () => void;
  session: ThinkingSession;
  onSessionUpdate: (session: ThinkingSession) => void;
  onIntervention: (action: 'approve' | 'modify' | 'reject', value?: string) => void;
  autoStart?: boolean;
}

export function ThinkingPanel({
  isOpen,
  onClose,
  session,
  onSessionUpdate,
  onIntervention,
  autoStart = true,
}: ThinkingPanelProps) {
  const [selectedAction, setSelectedAction] = useState<'approve' | 'modify' | 'reject' | null>(null);
  const [selectedAlternative, setSelectedAlternative] = useState<string | null>(null);

  // Auto-start thinking process
  useEffect(() => {
    if (isOpen && autoStart && session.status === 'idle') {
      const timer = setTimeout(() => {
        onSessionUpdate({
          ...session,
          status: 'running',
          steps: session.steps.map((step, idx) =>
            idx === 0 ? { ...step, status: 'processing' } : step
          ),
        });
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [isOpen, autoStart, session, onSessionUpdate]);

  // Simulate step progression
  useEffect(() => {
    if (session.status !== 'running') return;

    const currentStep = session.steps[session.currentStepIndex];
    if (!currentStep || currentStep.status !== 'processing') return;

    // Simulate processing time based on reasoning length
    const processingTime = Math.min(currentStep.reasoning.length * 20, 3000);

    const timer = setTimeout(() => {
      const newSteps = [...session.steps];

      if (currentStep.isInterventionPoint) {
        // Wait for user intervention
        newSteps[session.currentStepIndex] = { ...currentStep, status: 'intervention' };
        onSessionUpdate({
          ...session,
          status: 'paused',
          steps: newSteps,
        });
      } else {
        // Complete step and move to next
        newSteps[session.currentStepIndex] = { ...currentStep, status: 'complete' };

        const nextIndex = session.currentStepIndex + 1;
        if (nextIndex < session.steps.length) {
          newSteps[nextIndex] = { ...newSteps[nextIndex], status: 'processing' };
          onSessionUpdate({
            ...session,
            currentStepIndex: nextIndex,
            steps: newSteps,
          });
        } else {
          onSessionUpdate({
            ...session,
            status: 'complete',
            steps: newSteps,
          });
        }
      }
    }, processingTime);

    return () => clearTimeout(timer);
  }, [session, onSessionUpdate]);

  const handleApprove = useCallback(() => {
    setSelectedAction('approve');
    const currentStep = session.steps[session.currentStepIndex];

    setTimeout(() => {
      const newSteps = [...session.steps];
      newSteps[session.currentStepIndex] = { ...currentStep, status: 'complete' };

      const nextIndex = session.currentStepIndex + 1;
      if (nextIndex < session.steps.length) {
        newSteps[nextIndex] = { ...newSteps[nextIndex], status: 'processing' };
        onSessionUpdate({
          ...session,
          status: 'running',
          currentStepIndex: nextIndex,
          steps: newSteps,
          interventions: [
            ...session.interventions,
            {
              stepId: currentStep.id,
              action: 'approve',
              originalValue: currentStep.recommendation?.value || '',
              timestamp: new Date(),
            },
          ],
        });
      } else {
        onSessionUpdate({
          ...session,
          status: 'complete',
          steps: newSteps,
          finalRecommendation: currentStep.recommendation?.value,
        });
      }

      onIntervention('approve', currentStep.recommendation?.value);
      setSelectedAction(null);
    }, 300);
  }, [session, onSessionUpdate, onIntervention]);

  const handleModify = useCallback((alternativeId: string) => {
    setSelectedAction('modify');
    setSelectedAlternative(alternativeId);
  }, []);

  const handleConfirmModify = useCallback(() => {
    if (!selectedAlternative) return;

    const currentStep = session.steps[session.currentStepIndex];
    const newSteps = [...session.steps];
    newSteps[session.currentStepIndex] = { ...currentStep, status: 'complete' };

    const nextIndex = session.currentStepIndex + 1;
    if (nextIndex < session.steps.length) {
      newSteps[nextIndex] = { ...newSteps[nextIndex], status: 'processing' };
      onSessionUpdate({
        ...session,
        status: 'running',
        currentStepIndex: nextIndex,
        steps: newSteps,
        interventions: [
          ...session.interventions,
          {
            stepId: currentStep.id,
            action: 'modify',
            originalValue: currentStep.recommendation?.value || '',
            newValue: selectedAlternative,
            timestamp: new Date(),
          },
        ],
      });
    } else {
      onSessionUpdate({
        ...session,
        status: 'complete',
        steps: newSteps,
        finalRecommendation: selectedAlternative,
      });
    }

    onIntervention('modify', selectedAlternative);
    setSelectedAction(null);
    setSelectedAlternative(null);
  }, [session, selectedAlternative, onSessionUpdate, onIntervention]);

  const handleReject = useCallback(() => {
    setSelectedAction('reject');
    onIntervention('reject');
  }, [onIntervention]);

  const handleReset = useCallback(() => {
    onSessionUpdate({
      ...session,
      status: 'idle',
      currentStepIndex: 0,
      steps: session.steps.map(step => ({ ...step, status: 'pending' })),
      interventions: [],
    });
    setSelectedAction(null);
    setSelectedAlternative(null);
  }, [session, onSessionUpdate]);

  const progress = ((session.currentStepIndex + (session.status === 'complete' ? 1 : 0)) / session.steps.length) * 100;
  const currentStep = session.steps[session.currentStepIndex];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Panel */}
      <div className="fixed top-0 right-0 h-full w-full max-w-lg bg-background border-l shadow-xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                <Brain className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold">AI Thinking</h3>
                <p className="text-xs text-muted-foreground">
                  {session.status === 'running' && 'Analyzing...'}
                  {session.status === 'paused' && 'Waiting for your input'}
                  {session.status === 'complete' && 'Analysis complete'}
                  {session.status === 'idle' && 'Ready to start'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={handleReset}>
                <RotateCcw className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3">
            <Progress value={progress} className="h-2 flex-1" />
            <span className="text-xs text-muted-foreground font-mono">
              {Math.min(session.currentStepIndex + 1, session.steps.length)}/{session.steps.length}
            </span>
          </div>
        </div>

        {/* Steps */}
        <div className="flex-1 overflow-y-auto p-4">
          {session.steps.map((step, index) => (
            <ThinkingStep
              key={step.id}
              step={step}
              stepNumber={index + 1}
              isActive={index === session.currentStepIndex}
            />
          ))}
        </div>

        {/* Intervention Controls */}
        {currentStep?.isInterventionPoint && currentStep.status === 'intervention' && (
          <div className="p-4 border-t bg-card">
            <InterventionControls
              recommendation={currentStep.recommendation?.value || ''}
              confidence={currentStep.confidence || 0}
              alternatives={currentStep.recommendation?.alternatives || []}
              selectedAction={selectedAction}
              selectedAlternative={selectedAlternative}
              onApprove={handleApprove}
              onModify={handleModify}
              onReject={handleReject}
            />
            {selectedAction === 'modify' && selectedAlternative && (
              <Button
                className="w-full mt-3"
                onClick={handleConfirmModify}
              >
                Confirm Selection
              </Button>
            )}
          </div>
        )}

        {/* Complete state */}
        {session.status === 'complete' && (
          <div className="p-4 border-t bg-status-pass/5">
            <div className="flex items-center gap-2 text-status-pass">
              <Brain className="w-5 h-5" />
              <span className="font-medium">Analysis Complete</span>
            </div>
            {session.finalRecommendation && (
              <p className="text-sm text-muted-foreground mt-1">
                Final recommendation: <span className="font-medium text-foreground">{session.finalRecommendation}</span>
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
}
