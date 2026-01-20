import { useState } from "react";
import { X, ClipboardCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReviewCard } from "./ReviewCard";
import { cn } from "@/lib/utils";

interface ReviewItem {
  questionNumber: number;
  question: string;
  autoScore: number;
  rubricItems: { label: string; checked: boolean }[];
  evidenceLinks: string[];
}

interface HumanReviewPanelProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  reviewItems: ReviewItem[];
}

export function HumanReviewPanel({ isOpen, onClose, title, reviewItems }: HumanReviewPanelProps) {
  const [reviewStatuses, setReviewStatuses] = useState<Record<number, "satisfied" | "revision" | "reject">>({});

  const completedCount = Object.keys(reviewStatuses).length;
  const totalCount = reviewItems.length;

  return (
    <>
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-40 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={cn(
          "fixed right-0 top-0 h-full w-[420px] bg-background shadow-2xl z-50 transition-transform duration-300 ease-out",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <ClipboardCheck className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold">{title}</h2>
              <p className="text-xs text-muted-foreground">
                {completedCount} / {totalCount} reviewed
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Progress Bar */}
        <div className="px-4 py-2 border-b bg-muted/30">
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${(completedCount / totalCount) * 100}%` }}
            />
          </div>
        </div>

        {/* Review Cards */}
        <div className="p-4 space-y-4 overflow-y-auto h-[calc(100vh-140px)] scrollbar-thin">
          {reviewItems.map((item) => (
            <ReviewCard
              key={item.questionNumber}
              questionNumber={item.questionNumber}
              question={item.question}
              autoScore={item.autoScore}
              rubricItems={item.rubricItems}
              evidenceLinks={item.evidenceLinks}
              selectedStatus={reviewStatuses[item.questionNumber]}
              onStatusChange={(status) =>
                setReviewStatuses({ ...reviewStatuses, [item.questionNumber]: status })
              }
            />
          ))}
        </div>
      </div>
    </>
  );
}

// Button to open the panel
interface HumanReviewButtonProps {
  onClick: () => void;
  reviewedCount?: number;
  totalCount?: number;
}

export function HumanReviewButton({ onClick, reviewedCount = 0, totalCount = 0 }: HumanReviewButtonProps) {
  return (
    <Button
      variant="outline"
      className="gap-2"
      onClick={onClick}
    >
      <ClipboardCheck className="w-4 h-4" />
      Human Review
      {totalCount > 0 && (
        <span className={cn(
          "ml-1 px-1.5 py-0.5 rounded text-xs font-medium",
          reviewedCount === totalCount
            ? "bg-status-pass/20 text-status-pass"
            : "bg-muted text-muted-foreground"
        )}>
          {reviewedCount}/{totalCount}
        </span>
      )}
    </Button>
  );
}
