import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { AppSidebar } from "./AppSidebar";
import { EvalDock } from "./EvalDock";

interface AppLayoutProps {
  children: ReactNode;
  gateStatus?: "pass" | "warn" | "fail";
  gateName?: string;
  checklistItems?: Array<{
    label: string;
    status: "pass" | "warn" | "fail";
    evidenceLink?: string;
  }>;
  whySummary?: string;
  showDockActions?: boolean;
  headerAction?: ReactNode;
}

const defaultChecklistItems = [
  { label: "Data manifest complete", status: "pass" as const },
  { label: "PHI scan passed", status: "pass" as const },
  { label: "Format validation", status: "pass" as const },
  { label: "External validation required", status: "warn" as const, evidenceLink: "#" },
  { label: "Split plan approved", status: "pass" as const },
];

export function AppLayout({
  children,
  gateStatus = "warn",
  gateName = "Pre-Eval Gate",
  checklistItems = defaultChecklistItems,
  whySummary = "Dataset passes basic quality checks. External validation is recommended due to single-site data. Consider adding site-level cross-validation.",
  showDockActions = true,
  headerAction,
}: AppLayoutProps) {
  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <AppHeader
        studyName="Sleep Spindle Detection"
        datasetVersion="v2.3.1"
        runId="run-7f3a2b"
        currentStage="Eval Pipeline"
        actionSlot={headerAction}
      />
      <div className="flex-1 flex overflow-hidden">
        <AppSidebar />
        <main className="flex-1 overflow-y-auto scrollbar-thin p-6 bg-background">
          {children}
        </main>
        <EvalDock
          gateStatus={gateStatus}
          gateName={gateName}
          checklistItems={checklistItems}
          whySummary={whySummary}
          showActions={showDockActions}
        />
      </div>
    </div>
  );
}
