import { ReactNode } from "react";
import { Brain, ChevronRight, AlertTriangle, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface AppHeaderProps {
  studyName: string;
  datasetVersion: string;
  runId: string;
  currentStage: string;
  actionSlot?: ReactNode;
}

export function AppHeader({ studyName, datasetVersion, runId, currentStage, actionSlot }: AppHeaderProps) {
  return (
    <header className="h-14 bg-card border-b flex items-center justify-between px-4 shrink-0">
      <div className="flex items-center gap-4">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <Brain className="w-5 h-5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">AI Co-Neuroscientist</span>
        </div>

        <div className="h-6 w-px bg-border" />

        {/* Breadcrumb */}
        <div className="flex items-center gap-2 text-sm">
          <span className="text-muted-foreground">Study:</span>
          <span className="font-medium">{studyName}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{datasetVersion}</span>
          <ChevronRight className="w-4 h-4 text-muted-foreground" />
          <span className="font-mono text-xs bg-muted px-2 py-0.5 rounded">{runId}</span>
        </div>

        <Badge variant="outline" className="text-xs gap-1 bg-status-warn-bg text-status-warn border-status-warn/30">
          <AlertTriangle className="w-3 h-3" />
          {currentStage}
        </Badge>
      </div>

      <div className="flex items-center gap-3">
        {/* Action Slot (Human Review Button) */}
        {actionSlot}

        {/* Research Use Label */}
        <Badge variant="secondary" className="text-xs font-normal">
          Research-use only
        </Badge>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm">Dr. Kim</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem>Profile</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
