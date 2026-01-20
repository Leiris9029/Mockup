import { ThumbsUp, RefreshCw, ThumbsDown, ExternalLink, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ReviewCardProps {
  questionNumber: number;
  question: string;
  autoScore: number;
  rubricItems: Array<{ label: string; checked: boolean }>;
  evidenceLinks: string[];
  selectedStatus?: "satisfied" | "revision" | "reject";
  onStatusChange?: (status: "satisfied" | "revision" | "reject") => void;
}

export function ReviewCard({
  questionNumber,
  question,
  autoScore,
  rubricItems,
  evidenceLinks,
  selectedStatus,
  onStatusChange,
}: ReviewCardProps) {
  const { toast } = useToast();
  const [showComment, setShowComment] = useState(false);

  const handleEvidenceClick = (link: string) => {
    toast({
      title: "Opening Evidence",
      description: `Loading ${link} documentation...`,
    });
  };

  return (
    <div className="card-elevated p-4">
      <div className="flex items-start gap-3 mb-3">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-xs font-semibold text-primary-foreground shrink-0">
          {questionNumber}
        </div>
        <div className="flex-1">
          <h4 className="text-sm font-medium leading-snug">{question}</h4>
          <Badge variant="secondary" className="mt-2 text-xs">
            Auto Score: {autoScore}/100
          </Badge>
        </div>
      </div>

      {/* Rubric Checklist */}
      <div className="space-y-1.5 mb-4">
        {rubricItems.map((item, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className={cn(
                "w-3.5 h-3.5 rounded border flex items-center justify-center",
                item.checked
                  ? "bg-status-pass border-status-pass"
                  : "border-border"
              )}
            >
              {item.checked && (
                <svg className="w-2.5 h-2.5 text-status-pass-foreground" fill="currentColor" viewBox="0 0 12 12">
                  <path d="M10.28 2.28L3.989 8.575 1.695 6.28A1 1 0 00.28 7.695l3 3a1 1 0 001.414 0l7-7A1 1 0 0010.28 2.28z" />
                </svg>
              )}
            </div>
            <span className={cn("text-muted-foreground", item.checked && "text-foreground")}>
              {item.label}
            </span>
          </div>
        ))}
      </div>

      {/* Evidence Links */}
      <div className="flex flex-wrap gap-2 mb-4">
        {evidenceLinks.map((link, index) => (
          <button
            key={index}
            className="evidence-link text-xs"
            onClick={() => handleEvidenceClick(link)}
          >
            <ExternalLink className="w-3 h-3" />
            {link}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-3 gap-1.5 mb-3">
        <Button
          variant={selectedStatus === "satisfied" ? "default" : "outline"}
          size="sm"
          className={cn(
            "gap-1 px-2 text-xs",
            selectedStatus === "satisfied" && "bg-status-pass hover:bg-status-pass/90"
          )}
          onClick={() => onStatusChange?.("satisfied")}
        >
          <ThumbsUp className="w-3 h-3 shrink-0" />
          <span className="truncate">OK</span>
        </Button>
        <Button
          variant={selectedStatus === "revision" ? "default" : "outline"}
          size="sm"
          className={cn(
            "gap-1 px-2 text-xs",
            selectedStatus === "revision" && "bg-status-warn hover:bg-status-warn/90"
          )}
          onClick={() => onStatusChange?.("revision")}
        >
          <RefreshCw className="w-3 h-3 shrink-0" />
          <span className="truncate">Revise</span>
        </Button>
        <Button
          variant={selectedStatus === "reject" ? "default" : "outline"}
          size="sm"
          className={cn(
            "gap-1 px-2 text-xs",
            selectedStatus === "reject" && "bg-status-fail hover:bg-status-fail/90"
          )}
          onClick={() => onStatusChange?.("reject")}
        >
          <ThumbsDown className="w-3 h-3 shrink-0" />
          <span className="truncate">Reject</span>
        </Button>
      </div>

      {/* Comment Toggle */}
      <Button
        variant="ghost"
        size="sm"
        className="w-full justify-start text-muted-foreground gap-2"
        onClick={() => setShowComment(!showComment)}
      >
        <MessageSquare className="w-3.5 h-3.5" />
        {showComment ? "Hide comment" : "Add comment"}
      </Button>

      {showComment && (
        <Textarea
          placeholder="Enter your feedback..."
          className="mt-2 text-sm min-h-[60px]"
        />
      )}
    </div>
  );
}
