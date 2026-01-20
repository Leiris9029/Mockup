import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Upload,
  FileText,
  Check,
  HelpCircle,
  FolderOpen,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function Step1TaskSpec() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploaded, setIsUploaded] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setIsUploaded(true);
      setShowResult(true);
    }
  };

  // Mock extracted data
  const extractedData = {
    title: "항경련제 중단 후 경련발작 재발의 뇌파 바이오마커 탐색",
    purpose: "딥러닝을 활용해 항경련제 중단 후 재발과 관련된 뇌파 바이오마커를 탐색함",
    targetDisease: "뇌전증",
    studyType: "후향적 관찰 연구",
    taskType: "classification",
    inputData: "EEG",
    subjects: 102,
    variables: 12,
  };

  return (
    <StepLayout
      currentStep={1}
      title="연구계획서"
      description="연구계획서와 데이터셋을 업로드하여 실험을 시작합니다."
      input={{ label: "연구계획서", description: ".docx" }}
      output={{ label: "TaskSpec", description: "연구 개요 추출" }}
    >
      <div className="max-w-4xl space-y-6">
        {/* Upload Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Research Protocol Upload */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">연구계획서</h3>
              <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
            </div>
            <p className="text-sm text-muted-foreground">
              연구계획서 파일 (.docx)
            </p>

            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-8 text-center transition-colors",
                isUploaded
                  ? "border-status-pass bg-status-pass/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              {isUploaded ? (
                <div className="space-y-2">
                  <div className="w-12 h-12 rounded-full bg-status-pass/20 flex items-center justify-center mx-auto">
                    <Check className="w-6 h-6 text-status-pass" />
                  </div>
                  <p className="font-medium">{file?.name}</p>
                  <p className="text-sm text-muted-foreground">업로드 완료</p>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
                    <Upload className="w-6 h-6 text-muted-foreground" />
                  </div>
                  <p className="font-medium">Drag and drop file here</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Limit 200MB per file • DOCX
                  </p>
                  <input
                    type="file"
                    accept=".docx"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <Button variant="outline" size="sm" className="mt-4">
                    Browse files
                  </Button>
                </label>
              )}
            </div>
          </div>

          {/* Dataset Path */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-lg">데이터셋 경로</h3>
              <Badge variant="outline" className="text-xs">빠른 선택</Badge>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 justify-start gap-2">
                <FolderOpen className="w-4 h-4" />
                raw_dataset
              </Button>
              <Button variant="outline" className="flex-1 justify-start gap-2">
                <FolderOpen className="w-4 h-4" />
                251020
              </Button>
            </div>

            <div className="space-y-2">
              <label className="text-sm text-muted-foreground flex items-center gap-2">
                경로 직접 입력
                <HelpCircle className="w-3 h-3" />
              </label>
              <input
                type="text"
                placeholder="/home/jinsuyun/co_scientist/dataset/raw_dataset"
                className="w-full px-3 py-2 border rounded-lg bg-muted/30 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Metadata File Upload */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-lg">메타데이터 파일</h3>
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </div>
          <p className="text-sm text-muted-foreground">
            환자 정보 파일 (.xlsx, .csv)
          </p>

          <div className="border-2 border-dashed rounded-lg p-6 text-center hover:border-primary/50 transition-colors">
            <label className="cursor-pointer block">
              <Upload className="w-6 h-6 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm">Drag and drop file here</p>
              <p className="text-xs text-muted-foreground mt-1">
                Limit 200MB per file • XLSX, CSV
              </p>
              <input type="file" accept=".xlsx,.csv" className="hidden" />
              <Button variant="outline" size="sm" className="mt-3">
                Browse files
              </Button>
            </label>
          </div>
        </div>

        {/* Action Button */}
        <Button
          size="lg"
          className="w-full bg-rose-500 hover:bg-rose-600 text-white"
          disabled={!isUploaded}
        >
          연구계획서 분석 시작
        </Button>

        {/* Extracted Result */}
        {showResult && (
          <div className="space-y-4 mt-8">
            <div className="flex items-center gap-2 p-3 bg-status-pass/10 rounded-lg border border-status-pass/30">
              <Check className="w-5 h-5 text-status-pass" />
              <span className="text-status-pass font-medium">
                Layer 0 실험 준비가 완료되었습니다!
              </span>
            </div>

            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4 p-4 bg-card rounded-lg border">
              <div>
                <div className="text-xs text-muted-foreground">연구</div>
                <div className="font-medium truncate">{extractedData.title.substring(0, 15)}...</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">피험자</div>
                <div className="font-medium">{extractedData.subjects}명</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">활용변수</div>
                <div className="font-medium">{extractedData.variables}개</div>
              </div>
              <div>
                <div className="text-xs text-muted-foreground">상태</div>
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-status-pass" />
                  <span className="font-medium">통과</span>
                </div>
              </div>
            </div>

            {/* Detailed Result */}
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b flex items-center gap-2">
                <FileText className="w-5 h-5 text-muted-foreground" />
                <h4 className="font-semibold">전체 결과 요약</h4>
              </div>

              {/* Section 1 */}
              <div className="border-b">
                <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <span className="font-medium">1. 연구 개요</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="px-4 pb-4">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 text-muted-foreground w-24">항목</td>
                        <td className="py-2 font-medium">내용</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-muted-foreground">연구 제목</td>
                        <td className="py-2">{extractedData.title}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-muted-foreground">목적</td>
                        <td className="py-2">{extractedData.purpose}</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-muted-foreground">대상 질환</td>
                        <td className="py-2">{extractedData.targetDisease}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-muted-foreground">연구 유형</td>
                        <td className="py-2">{extractedData.studyType}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Section 2 */}
              <div className="border-b">
                <button className="w-full p-4 flex items-center justify-between hover:bg-muted/30 transition-colors">
                  <span className="font-medium">2. 과업 정의</span>
                  <ChevronDown className="w-4 h-4 text-muted-foreground" />
                </button>
                <div className="px-4 pb-4">
                  <table className="w-full text-sm">
                    <tbody>
                      <tr className="border-b">
                        <td className="py-2 text-muted-foreground w-24">항목</td>
                        <td className="py-2 font-medium">내용</td>
                      </tr>
                      <tr className="border-b">
                        <td className="py-2 text-muted-foreground">과업 유형</td>
                        <td className="py-2">{extractedData.taskType}</td>
                      </tr>
                      <tr>
                        <td className="py-2 text-muted-foreground">입력 데이터</td>
                        <td className="py-2">{extractedData.inputData}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </StepLayout>
  );
}
