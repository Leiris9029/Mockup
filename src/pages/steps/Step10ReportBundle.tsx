import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  FileOutput,
  Check,
  AlertTriangle,
  Download,
  FileText,
  Loader2,
  Shield,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ReportSection {
  id: string;
  name: string;
  wordCount: number;
  status: "complete" | "incomplete" | "warning";
}

export default function Step10ReportBundle() {
  const [isGenerating, setIsGenerating] = useState(false);
  const [isGenerated, setIsGenerated] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState("imrad");

  const reportSections: ReportSection[] = [
    { id: "abstract", name: "Abstract", wordCount: 250, status: "complete" },
    { id: "intro", name: "Introduction", wordCount: 500, status: "complete" },
    { id: "methods", name: "Methods", wordCount: 1200, status: "complete" },
    { id: "results", name: "Results", wordCount: 1500, status: "complete" },
    { id: "discussion", name: "Discussion", wordCount: 800, status: "complete" },
    { id: "limitations", name: "Limitations", wordCount: 400, status: "complete" },
    { id: "conclusion", name: "Conclusion", wordCount: 200, status: "complete" },
    { id: "references", name: "References", wordCount: 300, status: "complete" },
  ];

  const preExportChecks = [
    { id: "numeric", name: "수치 일관성", value: "diff = 0", status: "pass" as const },
    { id: "evidence", name: "근거 그라운딩", value: "100%", status: "pass" as const },
    { id: "overclaim", name: "과장 표현", value: "0 flags", status: "pass" as const },
    { id: "phi", name: "PHI/개인정보", value: "0 detected", status: "pass" as const },
    { id: "lineage", name: "Lineage 완전성", value: "100%", status: "pass" as const },
  ];

  const handleGenerate = () => {
    setIsGenerating(true);
    setTimeout(() => {
      setIsGenerating(false);
      setIsGenerated(true);
    }, 2000);
  };

  const totalWords = reportSections.reduce((sum, s) => sum + s.wordCount, 0);

  return (
    <StepLayout
      currentStep={10}
      title="리포트"
      description="최종 연구 리포트를 생성하고 내보냅니다."
      input={{ label: "All Bundles", description: "모든 분석 결과" }}
      output={{ label: "ReportBundle", description: "최종 리포트" }}
    >
      <div className="max-w-4xl space-y-6">
        {/* Template Selection */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold mb-4">리포트 템플릿</h3>

          <div className="grid grid-cols-4 gap-3">
            {[
              { id: "imrad", name: "Paper (IMRaD)", desc: "학술 논문 형식" },
              { id: "irb", name: "IRB Report", desc: "IRB 제출용" },
              { id: "internal", name: "Internal", desc: "내부 보고용" },
              { id: "brief", name: "Brief", desc: "요약 리포트" },
            ].map(template => (
              <button
                key={template.id}
                onClick={() => setSelectedTemplate(template.id)}
                className={cn(
                  "p-4 rounded-lg border text-left transition-colors",
                  selectedTemplate === template.id
                    ? "border-primary bg-primary/5"
                    : "hover:border-primary/50"
                )}
              >
                <div className="flex items-center justify-between mb-1">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  {selectedTemplate === template.id && (
                    <Check className="w-4 h-4 text-primary" />
                  )}
                </div>
                <div className="font-medium text-sm">{template.name}</div>
                <div className="text-xs text-muted-foreground">{template.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Report Sections */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b flex items-center justify-between">
            <h3 className="font-semibold">리포트 섹션</h3>
            <Badge variant="secondary">{totalWords.toLocaleString()} words</Badge>
          </div>

          <div className="divide-y">
            {reportSections.map(section => (
              <div key={section.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-status-pass" />
                  <span className="font-medium">{section.name}</span>
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  {section.wordCount} words
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Pre-Export Checks */}
        <div className="bg-card rounded-lg border">
          <div className="p-4 border-b flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Pre-Export QA Gate</h3>
          </div>

          <div className="divide-y">
            {preExportChecks.map(check => (
              <div key={check.id} className="p-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Check className="w-4 h-4 text-status-pass" />
                  <span>{check.name}</span>
                </div>
                <span className="text-sm text-muted-foreground font-mono">
                  {check.value}
                </span>
              </div>
            ))}
          </div>

          <div className="p-4 bg-status-pass/10 border-t border-status-pass/30">
            <div className="flex items-center gap-2 text-sm text-status-pass">
              <Check className="w-4 h-4" />
              <span>모든 Pre-Export 검사를 통과했습니다.</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Button
            size="lg"
            className="flex-1 bg-rose-500 hover:bg-rose-600"
            onClick={handleGenerate}
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                생성 중...
              </>
            ) : (
              <>
                <FileOutput className="w-4 h-4 mr-2" />
                리포트 생성
              </>
            )}
          </Button>

          {isGenerated && (
            <>
              <Button size="lg" variant="outline" className="gap-2">
                <Eye className="w-4 h-4" />
                미리보기
              </Button>
              <Button size="lg" variant="outline" className="gap-2">
                <Download className="w-4 h-4" />
                PDF 다운로드
              </Button>
            </>
          )}
        </div>

        {/* Generated Result */}
        {isGenerated && (
          <div className="space-y-4">
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-semibold mb-3">생성된 리포트</h4>

              <div className="grid grid-cols-4 gap-4 text-center">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{totalWords.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">Total Words</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">{reportSections.length}</div>
                  <div className="text-xs text-muted-foreground">Sections</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">6</div>
                  <div className="text-xs text-muted-foreground">Figures</div>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <div className="text-2xl font-bold">4</div>
                  <div className="text-xs text-muted-foreground">Tables</div>
                </div>
              </div>

              <div className="mt-4 p-3 bg-muted/30 rounded-lg text-sm font-mono">
                <div className="flex justify-between">
                  <span>Run ID:</span>
                  <span>run-7f3a2b</span>
                </div>
                <div className="flex justify-between">
                  <span>Generated:</span>
                  <span>2026-01-19 15:32:41</span>
                </div>
                <div className="flex justify-between">
                  <span>Lineage Hash:</span>
                  <span>sha256:v2w3x4y5z6</span>
                </div>
              </div>
            </div>

            {/* Final Success */}
            <div className="p-6 bg-status-pass/10 rounded-lg border border-status-pass/30 text-center">
              <div className="w-16 h-16 rounded-full bg-status-pass/20 flex items-center justify-center mx-auto mb-4">
                <Check className="w-8 h-8 text-status-pass" />
              </div>
              <h3 className="text-xl font-bold text-status-pass mb-2">
                실험이 완료되었습니다!
              </h3>
              <p className="text-sm text-muted-foreground">
                모든 단계가 성공적으로 완료되었습니다. 리포트를 다운로드하거나 공유할 수 있습니다.
              </p>
              <div className="flex justify-center gap-3 mt-4">
                <Button variant="outline" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Artifact Pack (ZIP)
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="w-4 h-4 mr-2" />
                  Lineage Report
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}
