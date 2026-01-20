import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { StepPageLayout } from "@/components/layout/StepPageLayout";
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
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { useProjectStore, DataFile } from "@/store/useProjectStore";

export default function DatasetPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currentProject, setDatasetManifest, completeStep, setCurrentStep } = useProjectStore();

  const [isScanning, setIsScanning] = useState(false);
  const [scanComplete, setScanComplete] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [datasetPath, setDatasetPath] = useState("/data/eeg/raw_dataset");

  // Generate mock data files (100 patients)
  const generateMockFiles = (): DataFile[] => {
    const files: DataFile[] = [];
    for (let i = 1; i <= 100; i++) {
      const id = String(i);
      const patientNum = String(i).padStart(3, '0');

      // Random duration between 5h and 10h (most valid)
      const hours = Math.floor(Math.random() * 5) + 5;
      const minutes = Math.floor(Math.random() * 60);

      // Random size based on duration (roughly 5-6 MB per hour)
      const sizeBase = hours * 5.5 + (minutes / 60) * 5.5;
      const size = (sizeBase + Math.random() * 10).toFixed(1);

      // Most files are valid, some have warnings
      let status: "valid" | "warning" = "valid";
      let message: string | undefined;
      let channels = 19;
      let actualHours = hours;
      let actualMinutes = minutes;

      // ~5% chance of channel mismatch
      if (Math.random() < 0.05) {
        status = "warning";
        channels = Math.random() < 0.5 ? 21 : 17;
        message = `Channel mismatch (${channels} vs 19)`;
      }
      // ~5% chance of short recording
      else if (Math.random() < 0.05) {
        status = "warning";
        actualHours = Math.floor(Math.random() * 3) + 1; // 1-3 hours
        actualMinutes = Math.floor(Math.random() * 60);
        message = "Recording too short (< 4h)";
      }

      files.push({
        id,
        name: `patient_${patientNum}.edf`,
        size: `${size} MB`,
        duration: `${actualHours}h ${String(actualMinutes).padStart(2, '0')}m`,
        channels,
        sampleRate: 256,
        status,
        message,
      });
    }
    return files;
  };

  const [dataFiles, setDataFiles] = useState<DataFile[]>([]);

  // Load existing data from store OR generate new mock data
  useEffect(() => {
    if (currentProject?.datasetManifest && currentProject.datasetManifest.files.length > 10) {
      // Only use stored data if it has 100 files (new format)
      setDatasetPath(currentProject.datasetManifest.path);
      setDataFiles(currentProject.datasetManifest.files);
      setScanComplete(true);
    } else {
      // Generate new 100 patient mock data
      setDataFiles(generateMockFiles());
    }
  }, []);

  const handleScan = () => {
    setIsScanning(true);
    setScanProgress(0);

    // Always generate fresh mock data on scan
    const freshFiles = generateMockFiles();
    setDataFiles(freshFiles);

    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsScanning(false);
          setScanComplete(true);

          // Calculate total size for manifest
          const totalMB = freshFiles.reduce((acc, f) => {
            const sizeNum = parseFloat(f.size.replace(/[^0-9.]/g, ""));
            return acc + sizeNum;
          }, 0);

          // Save to store
          const manifest = {
            path: datasetPath,
            files: freshFiles,
            format: "EDF+",
            totalSize: `${(totalMB / 1024).toFixed(1)} GB`,
            avgDuration: "8h 15m",
          };

          setDatasetManifest(manifest);
          completeStep(2);
          setCurrentStep(3);

          toast({
            title: "Scan Complete",
            description: `Found ${freshFiles.length} data files.`,
          });
          return 100;
        }
        return prev + 10;
      });
    }, 150);
  };

  const handleBrowse = () => {
    // In a real app, this would open a file picker
    toast({
      title: "Browse Folder",
      description: "File picker would open here in production.",
    });
  };

  const handleNext = () => {
    navigate("/setup/cohort");
  };

  const validFiles = dataFiles.filter(f => f.status === "valid").length;
  const warningFiles = dataFiles.filter(f => f.status === "warning").length;

  // Calculate total size in MB
  const totalSizeMB = dataFiles.reduce((acc, f) => {
    const sizeNum = parseFloat(f.size.replace(/[^0-9.]/g, ""));
    return acc + sizeNum;
  }, 0);
  const totalSizeGB = (totalSizeMB / 1024).toFixed(1);

  return (
    <StepPageLayout
      stepNumber={2}
      title="Dataset Setup"
      description="Specify and scan your EEG/PSG data folder. File format, channel count, and sampling rate are automatically detected."
      prevPath="/setup/protocol"
      nextPath="/setup/cohort"
      onNext={handleNext}
    >
      {/* Path Selection */}
      <div className="card-elevated p-6">
        <h3 className="font-semibold mb-4">Data Path</h3>

        <div className="flex gap-4">
          <div className="flex-1">
            <input
              type="text"
              value={datasetPath}
              onChange={(e) => {
                setDatasetPath(e.target.value);
                setScanComplete(false);
              }}
              className="w-full px-4 py-3 border rounded-lg bg-muted/30 font-mono text-sm"
              placeholder="Enter path to EEG/PSG data folder..."
            />
          </div>
          <Button variant="outline" className="gap-2" onClick={handleBrowse}>
            <FolderOpen className="w-4 h-4" />
            Browse
          </Button>
          <Button
            className="gap-2"
            onClick={handleScan}
            disabled={isScanning || !datasetPath}
          >
            {isScanning ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Database className="w-4 h-4" />
            )}
            {isScanning ? "Scanning..." : "Scan Data"}
          </Button>
        </div>

        {isScanning && (
          <div className="mt-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Scanning files...</span>
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
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold">{dataFiles.length}</div>
              <div className="text-sm text-muted-foreground">Total Files</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold text-status-pass">{validFiles}</div>
              <div className="text-sm text-muted-foreground">Valid</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold text-status-warn">{warningFiles}</div>
              <div className="text-sm text-muted-foreground">Warnings</div>
            </div>
            <div className="card-elevated p-4 text-center">
              <div className="text-3xl font-bold">{totalSizeGB} GB</div>
              <div className="text-sm text-muted-foreground">Total Size</div>
            </div>
          </div>

          {/* Detected Format */}
          <div className="card-elevated p-4">
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Format:</span>
                <span className="ml-2 font-medium">EDF+</span>
              </div>
              <div>
                <span className="text-muted-foreground">Channels:</span>
                <span className="ml-2 font-medium">19 (10-20)</span>
              </div>
              <div>
                <span className="text-muted-foreground">Sample Rate:</span>
                <span className="ml-2 font-medium">256 Hz</span>
              </div>
              <div>
                <span className="text-muted-foreground">Avg Duration:</span>
                <span className="ml-2 font-medium">8h 15m</span>
              </div>
            </div>
          </div>

          {/* File List */}
          <div className="card-elevated overflow-hidden">
            <div className="p-4 border-b flex items-center justify-between">
              <h4 className="font-semibold">File List</h4>
              <Badge variant="outline">{dataFiles.length} files</Badge>
            </div>

            <div className="divide-y max-h-64 overflow-y-auto">
              {dataFiles.map(file => (
                <div
                  key={file.id}
                  className={cn(
                    "p-3 flex items-center gap-4",
                    file.status === "warning" && "bg-status-warn/5"
                  )}
                >
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0" />

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
                    {file.channels}ch | {file.sampleRate}Hz
                  </div>

                  <div>
                    {file.status === "valid" ? (
                      <Check className="w-4 h-4 text-status-pass" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-status-warn" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Warning Message */}
          {warningFiles > 0 && (
            <div className="flex items-center gap-2 p-4 bg-status-warn/10 rounded-lg border border-status-warn/30">
              <AlertTriangle className="w-5 h-5 text-status-warn shrink-0" />
              <span className="text-sm text-status-warn">
                {warningFiles} file(s) have warnings. Review before proceeding.
              </span>
            </div>
          )}

          {/* Success Message */}
          <div className="flex items-center gap-2 p-4 bg-status-pass/10 rounded-lg border border-status-pass/30">
            <Check className="w-5 h-5 text-status-pass" />
            <span className="text-status-pass font-medium">
              DatasetManifest created. Proceed to QC.
            </span>
          </div>
        </>
      )}
    </StepPageLayout>
  );
}
