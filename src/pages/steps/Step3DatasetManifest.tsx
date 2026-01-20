import { useState } from "react";
import { StepLayout } from "@/components/layout/StepLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Database,
  FileText,
  Check,
  AlertTriangle,
  FolderOpen,
  HardDrive,
  Clock,
  RefreshCw,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface DataFile {
  id: string;
  name: string;
  size: string;
  duration: string;
  channels: number;
  sampleRate: number;
  status: "valid" | "warning" | "error";
  message?: string;
}

export default function Step3DatasetManifest() {
  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);

  // Mock data files
  const dataFiles: DataFile[] = [
    { id: "1", name: "patient_001.edf", size: "45.2 MB", duration: "8h 32m", channels: 19, sampleRate: 256, status: "valid" },
    { id: "2", name: "patient_002.edf", size: "52.1 MB", duration: "9h 15m", channels: 19, sampleRate: 256, status: "valid" },
    { id: "3", name: "patient_003.edf", size: "38.7 MB", duration: "7h 48m", channels: 19, sampleRate: 256, status: "valid" },
    { id: "4", name: "patient_004.edf", size: "41.3 MB", duration: "8h 05m", channels: 21, sampleRate: 256, status: "warning", message: "채널 수 불일치 (21 vs 19)" },
    { id: "5", name: "patient_005.edf", size: "48.9 MB", duration: "8h 58m", channels: 19, sampleRate: 256, status: "valid" },
    { id: "6", name: "patient_006.edf", size: "12.3 MB", duration: "2h 15m", channels: 19, sampleRate: 256, status: "warning", message: "녹화 시간 부족 (< 4h)" },
  ];

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    // Simulate scanning
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanComplete(true);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  const validFiles = dataFiles.filter(f => f.status === "valid").length;
  const warningFiles = dataFiles.filter(f => f.status === "warning").length;
  const errorFiles = dataFiles.filter(f => f.status === "error").length;

  return (
    <StepLayout
      currentStep={3}
      title="데이터셋"
      description="데이터 파일을 스캔하고 메타데이터를 추출합니다."
      input={{ label: "데이터 경로", description: "EDF 파일 폴더" }}
      output={{ label: "DatasetManifest", description: "파일 목록 및 메타데이터" }}
    >
      <div className="max-w-5xl space-y-6">
        {/* Path Selection */}
        <div className="bg-card rounded-lg border p-4">
          <h3 className="font-semibold mb-4">데이터 경로</h3>

          <div className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value="/home/jinsuyun/co_scientist/dataset/raw_dataset"
                className="w-full px-3 py-2 border rounded-lg bg-muted/30 text-sm font-mono"
                readOnly
              />
            </div>
            <Button variant="outline" className="gap-2">
              <FolderOpen className="w-4 h-4" />
              변경
            </Button>
            <Button
              className="gap-2 bg-rose-500 hover:bg-rose-600"
              onClick={handleScan}
              disabled={isScanning}
            >
              {isScanning ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              {isScanning ? "스캔 중..." : "데이터 스캔"}
            </Button>
          </div>

          {isScanning && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-1">
                <span>스캔 진행중...</span>
                <span>{scanProgress}%</span>
              </div>
              <Progress value={scanProgress} className="h-2" />
            </div>
          )}
        </div>

        {scanComplete && (
          <>
            {/* Summary Stats */}
            <div className="grid grid-cols-4 gap-4">
              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold">{dataFiles.length}</div>
                <div className="text-sm text-muted-foreground">전체 파일</div>
              </div>
              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-status-pass">{validFiles}</div>
                <div className="text-sm text-muted-foreground">유효</div>
              </div>
              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-status-warn">{warningFiles}</div>
                <div className="text-sm text-muted-foreground">경고</div>
              </div>
              <div className="bg-card rounded-lg border p-4 text-center">
                <div className="text-3xl font-bold text-status-fail">{errorFiles}</div>
                <div className="text-sm text-muted-foreground">오류</div>
              </div>
            </div>

            {/* Detected Format */}
            <div className="bg-card rounded-lg border p-4">
              <h4 className="font-semibold mb-3">감지된 데이터 포맷</h4>
              <div className="grid grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">파일 형식:</span>
                  <span className="ml-2 font-medium">EDF+</span>
                </div>
                <div>
                  <span className="text-muted-foreground">채널 수:</span>
                  <span className="ml-2 font-medium">19 (10-20 System)</span>
                </div>
                <div>
                  <span className="text-muted-foreground">샘플링 레이트:</span>
                  <span className="ml-2 font-medium">256 Hz</span>
                </div>
                <div>
                  <span className="text-muted-foreground">총 용량:</span>
                  <span className="ml-2 font-medium">4.2 GB</span>
                </div>
              </div>
            </div>

            {/* File List */}
            <div className="bg-card rounded-lg border">
              <div className="p-4 border-b flex items-center justify-between">
                <h4 className="font-semibold">파일 목록</h4>
                <Badge variant="outline">{dataFiles.length}개 파일</Badge>
              </div>

              <div className="divide-y max-h-80 overflow-y-auto">
                {dataFiles.map(file => (
                  <div
                    key={file.id}
                    className={cn(
                      "p-3 flex items-center gap-4",
                      file.status === "warning" && "bg-status-warn/5",
                      file.status === "error" && "bg-status-fail/5"
                    )}
                  >
                    <FileText className="w-5 h-5 text-muted-foreground" />

                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{file.name}</div>
                      {file.message && (
                        <div className="text-xs text-status-warn">{file.message}</div>
                      )}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <HardDrive className="w-3 h-3" />
                      {file.size}
                    </div>

                    <div className="text-xs text-muted-foreground flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {file.duration}
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {file.channels}ch
                    </div>

                    <div className="text-xs text-muted-foreground">
                      {file.sampleRate}Hz
                    </div>

                    <div>
                      {file.status === "valid" ? (
                        <Check className="w-4 h-4 text-status-pass" />
                      ) : file.status === "warning" ? (
                        <AlertTriangle className="w-4 h-4 text-status-warn" />
                      ) : (
                        <AlertTriangle className="w-4 h-4 text-status-fail" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="flex items-center justify-between">
              {warningFiles > 0 && (
                <div className="flex items-center gap-2 text-sm text-status-warn">
                  <AlertTriangle className="w-4 h-4" />
                  {warningFiles}개 파일에 경고가 있습니다. 검토 후 진행하세요.
                </div>
              )}
              <Button className="ml-auto">
                DatasetManifest 생성
                <Check className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </>
        )}
      </div>
    </StepLayout>
  );
}
