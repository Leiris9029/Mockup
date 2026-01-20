import { FileText, Image, Table, Code, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type ArtifactType = "plot" | "table" | "config" | "log";

interface ArtifactCardProps {
  title: string;
  type: ArtifactType;
  description?: string;
  timestamp?: string;
  onClick?: () => void;
}

const typeConfig = {
  plot: { icon: Image, color: "text-primary" },
  table: { icon: Table, color: "text-status-pass" },
  config: { icon: Code, color: "text-audit" },
  log: { icon: FileText, color: "text-muted-foreground" },
};

export function ArtifactCard({ title, type, description, timestamp, onClick }: ArtifactCardProps) {
  const { icon: Icon, color } = typeConfig[type];

  return (
    <div
      className="card-interactive p-4 group"
      onClick={onClick}
    >
      <div className="flex items-start gap-3">
        <div className={cn("w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0", color)}>
          <Icon className="w-5 h-5" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-medium truncate">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{description}</p>
          )}
          {timestamp && (
            <span className="text-xs text-muted-foreground font-mono mt-1 block">{timestamp}</span>
          )}
        </div>
        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <ExternalLink className="w-3.5 h-3.5" />
          </Button>
          <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
            <Download className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>
    </div>
  );
}
