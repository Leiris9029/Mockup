import { useState, useMemo, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Pencil,
} from "lucide-react";
import { cn } from "@/lib/utils";

// 기본 채널 설정
const defaultChannels = [
  { name: "Fp1", color: "#3b82f6" },
  { name: "Fp2", color: "#3b82f6" },
  { name: "F3", color: "#22c55e" },
  { name: "F4", color: "#22c55e" },
  { name: "C3", color: "#eab308" },
  { name: "C4", color: "#eab308" },
  { name: "P3", color: "#f97316" },
  { name: "P4", color: "#f97316" },
  { name: "O1", color: "#ef4444" },
  { name: "O2", color: "#ef4444" },
];

// 검출된 이벤트 (시뮬레이션)
const detectedEvents = [
  { type: "spindle", start: 2.3, end: 3.1, channel: "C3", confidence: 0.92 },
  { type: "spindle", start: 5.8, end: 6.4, channel: "C4", confidence: 0.87 },
  { type: "artifact", start: 8.2, end: 8.9, channel: "Fp1", confidence: 0.95 },
  { type: "spindle", start: 12.1, end: 12.8, channel: "C3", confidence: 0.89 },
  { type: "k-complex", start: 18.5, end: 19.2, channel: "F3", confidence: 0.84 },
  { type: "spindle", start: 22.4, end: 23.1, channel: "C4", confidence: 0.91 },
];

// Seeded random number generator for reproducible "random" waveforms
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

// 더 자연스러운 EEG 파형 생성 함수
function generateRealisticWaveform(
  channelIndex: number,
  timeOffset: number,
  seed: number
): string {
  const points: string[] = [];
  const width = 800;
  const amplitude = 15;
  const baseY = 25;

  // Pre-generate noise values for consistency
  const noiseCache: number[] = [];
  for (let i = 0; i < width; i++) {
    noiseCache.push(seededRandom(seed + i * 0.1 + channelIndex * 1000));
  }

  // Channel-specific characteristics
  const channelType = channelIndex % 5; // Different behavior per region

  for (let x = 0; x < width; x++) {
    const t = (x / width) * 30 + timeOffset;
    const localSeed = seed + x * 0.01;

    let y = baseY;

    // Base frequencies with varying amplitudes
    const deltaFreq = 1.5 + seededRandom(localSeed) * 1; // 0.5-4 Hz
    const thetaFreq = 5 + seededRandom(localSeed + 1) * 3; // 4-8 Hz
    const alphaFreq = 9 + seededRandom(localSeed + 2) * 4; // 8-13 Hz
    const betaFreq = 18 + seededRandom(localSeed + 3) * 12; // 13-30 Hz
    const spindleFreq = 12 + seededRandom(localSeed + 4) * 4; // 11-16 Hz

    // Amplitude modulation (creates natural waxing/waning)
    const slowMod = Math.sin(2 * Math.PI * 0.1 * t + channelIndex) * 0.5 + 0.5;
    const fastMod = Math.sin(2 * Math.PI * 0.5 * t + channelIndex * 2) * 0.3 + 0.7;

    // Channel-specific patterns
    switch (channelType) {
      case 0: // Frontal (Fp1, Fp2) - more eye artifacts, slow waves
        y += amplitude * 0.6 * slowMod * Math.sin(2 * Math.PI * deltaFreq * t + channelIndex);
        y += amplitude * 0.3 * Math.sin(2 * Math.PI * thetaFreq * t + channelIndex * 1.5);
        // Occasional eye blink artifact
        if (seededRandom(localSeed + 100) > 0.97) {
          y += amplitude * 1.5 * Math.exp(-Math.pow((x % 50) - 25, 2) / 100);
        }
        break;

      case 1: // Frontal (F3, F4) - mixed activity
        y += amplitude * 0.4 * slowMod * Math.sin(2 * Math.PI * deltaFreq * t + channelIndex);
        y += amplitude * 0.4 * fastMod * Math.sin(2 * Math.PI * thetaFreq * t + channelIndex * 1.3);
        y += amplitude * 0.2 * Math.sin(2 * Math.PI * alphaFreq * t + channelIndex * 0.7);
        break;

      case 2: // Central (C3, C4) - sleep spindles, mu rhythm
        y += amplitude * 0.3 * Math.sin(2 * Math.PI * deltaFreq * t + channelIndex);
        y += amplitude * 0.3 * fastMod * Math.sin(2 * Math.PI * thetaFreq * t + channelIndex * 1.1);
        // Sleep spindle bursts (waxing-waning 11-16 Hz)
        const spindleEnvelope = Math.pow(Math.sin(2 * Math.PI * 0.8 * t + channelIndex), 2);
        y += amplitude * 0.5 * spindleEnvelope * Math.sin(2 * Math.PI * spindleFreq * t);
        break;

      case 3: // Parietal (P3, P4) - alpha dominant
        y += amplitude * 0.2 * Math.sin(2 * Math.PI * deltaFreq * t + channelIndex);
        // Dominant alpha with natural waxing/waning
        const alphaMod = Math.pow(Math.sin(2 * Math.PI * 0.15 * t + channelIndex), 2) * 0.6 + 0.4;
        y += amplitude * 0.6 * alphaMod * Math.sin(2 * Math.PI * alphaFreq * t + channelIndex * 0.5);
        y += amplitude * 0.15 * Math.sin(2 * Math.PI * betaFreq * t + channelIndex * 0.3);
        break;

      case 4: // Occipital (O1, O2) - strong alpha
        // Strong posterior dominant rhythm (alpha)
        const posteriorAlphaMod = Math.pow(Math.sin(2 * Math.PI * 0.12 * t + channelIndex * 0.8), 2) * 0.7 + 0.3;
        y += amplitude * 0.7 * posteriorAlphaMod * Math.sin(2 * Math.PI * (alphaFreq + 1) * t + channelIndex * 0.4);
        y += amplitude * 0.2 * Math.sin(2 * Math.PI * thetaFreq * t + channelIndex * 1.2);
        break;
    }

    // Add realistic noise (pink noise approximation)
    const noise1 = (noiseCache[x] - 0.5) * 4;
    const noise2 = (seededRandom(localSeed + 50) - 0.5) * 2;
    const noise3 = (seededRandom(localSeed + 100) - 0.5) * 1;
    y += noise1 + noise2 * 0.5 + noise3 * 0.25;

    // Occasional sharp transients
    if (seededRandom(localSeed + 200) > 0.995) {
      const transientDir = seededRandom(localSeed + 201) > 0.5 ? 1 : -1;
      y += transientDir * amplitude * 0.8;
    }

    // Clamp to viewbox
    y = Math.max(2, Math.min(48, y));

    points.push(`${x},${y.toFixed(1)}`);
  }

  return points.join(" ");
}

export function EEGViewer() {
  const [currentEpoch, setCurrentEpoch] = useState(42);
  const [timeScale, setTimeScale] = useState("30s");
  const [amplitudeScale, setAmplitudeScale] = useState("50μV");
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedChannel, setSelectedChannel] = useState<string | null>(null);
  const [showEvents, setShowEvents] = useState(true);

  // Editable channel names
  const [channels, setChannels] = useState(defaultChannels);
  const [editingChannelIndex, setEditingChannelIndex] = useState<number | null>(null);
  const [editValue, setEditValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const totalEpochs = 284;

  // Memoize waveforms to prevent regeneration on every render
  const waveforms = useMemo(() => {
    return channels.map((_, idx) =>
      generateRealisticWaveform(idx, currentEpoch * 30, currentEpoch * 10 + idx)
    );
  }, [currentEpoch, channels.length]);

  // Focus input when editing
  useEffect(() => {
    if (editingChannelIndex !== null && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [editingChannelIndex]);

  const handlePrevEpoch = () => {
    setCurrentEpoch(Math.max(1, currentEpoch - 1));
  };

  const handleNextEpoch = () => {
    setCurrentEpoch(Math.min(totalEpochs, currentEpoch + 1));
  };

  const startEditChannel = (index: number) => {
    setEditingChannelIndex(index);
    setEditValue(channels[index].name);
  };

  const saveChannelName = () => {
    if (editingChannelIndex !== null && editValue.trim()) {
      setChannels(prev => prev.map((ch, idx) =>
        idx === editingChannelIndex ? { ...ch, name: editValue.trim() } : ch
      ));
    }
    setEditingChannelIndex(null);
    setEditValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      saveChannelName();
    } else if (e.key === "Escape") {
      setEditingChannelIndex(null);
      setEditValue("");
    }
  };

  const getEventColor = (type: string) => {
    switch (type) {
      case "spindle": return "bg-primary/20 border-primary";
      case "artifact": return "bg-status-fail/20 border-status-fail";
      case "k-complex": return "bg-status-warn/20 border-status-warn";
      default: return "bg-muted border-border";
    }
  };

  const getEventBadgeColor = (type: string) => {
    switch (type) {
      case "spindle": return "bg-primary text-primary-foreground";
      case "artifact": return "bg-status-fail text-white";
      case "k-complex": return "bg-status-warn text-white";
      default: return "bg-muted";
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {/* Epoch Navigation */}
          <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentEpoch(1)}>
              <SkipBack className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrevEpoch}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="px-3 text-sm font-mono min-w-[100px] text-center">
              Epoch {currentEpoch} / {totalEpochs}
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNextEpoch}>
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setCurrentEpoch(totalEpochs)}>
              <SkipForward className="w-4 h-4" />
            </Button>
          </div>

          {/* Play/Pause */}
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            onClick={() => setIsPlaying(!isPlaying)}
          >
            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
        </div>

        <div className="flex items-center gap-3">
          {/* Time Scale */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Time:</span>
            <Select value={timeScale} onValueChange={setTimeScale}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10s">10s</SelectItem>
                <SelectItem value="30s">30s</SelectItem>
                <SelectItem value="60s">60s</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Amplitude Scale */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Amp:</span>
            <Select value={amplitudeScale} onValueChange={setAmplitudeScale}>
              <SelectTrigger className="w-20 h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="20μV">20μV</SelectItem>
                <SelectItem value="50μV">50μV</SelectItem>
                <SelectItem value="100μV">100μV</SelectItem>
                <SelectItem value="200μV">200μV</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomOut className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ZoomIn className="w-4 h-4" />
            </Button>
          </div>

          {/* Show Events Toggle */}
          <Button
            variant={showEvents ? "default" : "outline"}
            size="sm"
            className="text-xs"
            onClick={() => setShowEvents(!showEvents)}
          >
            Events
          </Button>
        </div>
      </div>

      {/* EEG Display */}
      <div className="relative bg-card rounded-lg border overflow-hidden">
        {/* Channel Labels */}
        <div className="absolute left-0 top-0 bottom-0 w-14 bg-muted/50 border-r z-10 flex flex-col">
          {channels.map((channel, idx) => (
            <div
              key={idx}
              className={cn(
                "flex-1 flex items-center justify-center text-xs font-mono transition-colors border-b border-border/50 group relative",
                selectedChannel === channel.name ? "bg-primary/10 text-primary" : "hover:bg-muted"
              )}
            >
              {editingChannelIndex === idx ? (
                <div className="flex items-center gap-0.5 px-0.5">
                  <Input
                    ref={inputRef}
                    value={editValue}
                    onChange={(e) => setEditValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={saveChannelName}
                    className="h-5 w-10 text-xs px-1 py-0"
                    maxLength={6}
                  />
                </div>
              ) : (
                <>
                  <span
                    className="cursor-pointer"
                    onClick={() => setSelectedChannel(selectedChannel === channel.name ? null : channel.name)}
                  >
                    {channel.name}
                  </span>
                  <button
                    className="absolute right-0.5 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-muted rounded"
                    onClick={(e) => {
                      e.stopPropagation();
                      startEditChannel(idx);
                    }}
                  >
                    <Pencil className="w-2.5 h-2.5 text-muted-foreground" />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Waveforms */}
        <div className="ml-14 relative">
          {/* Time axis */}
          <div className="absolute top-0 left-0 right-0 h-6 bg-muted/30 border-b flex items-center px-2">
            {[0, 5, 10, 15, 20, 25, 30].map((sec) => (
              <span
                key={sec}
                className="absolute text-[10px] text-muted-foreground font-mono"
                style={{ left: `${(sec / 30) * 100}%`, transform: "translateX(-50%)" }}
              >
                {sec}s
              </span>
            ))}
          </div>

          {/* Channel Traces */}
          <div className="pt-6">
            {channels.map((channel, idx) => (
              <div
                key={idx}
                className={cn(
                  "relative h-[50px] border-b border-border/30",
                  selectedChannel === channel.name && "bg-primary/5"
                )}
              >
                <svg
                  className="w-full h-full"
                  viewBox="0 0 800 50"
                  preserveAspectRatio="none"
                >
                  <polyline
                    points={waveforms[idx]}
                    fill="none"
                    stroke={channel.color}
                    strokeWidth="1"
                    opacity={selectedChannel && selectedChannel !== channel.name ? 0.3 : 1}
                  />
                </svg>

                {/* Event Markers */}
                {showEvents && detectedEvents
                  .filter((e) => e.channel === channel.name)
                  .map((event, eventIdx) => (
                    <div
                      key={eventIdx}
                      className={cn(
                        "absolute top-1 bottom-1 border-2 rounded opacity-60 hover:opacity-100 transition-opacity cursor-pointer",
                        getEventColor(event.type)
                      )}
                      style={{
                        left: `${(event.start / 30) * 100}%`,
                        width: `${((event.end - event.start) / 30) * 100}%`,
                      }}
                      title={`${event.type} (${Math.round(event.confidence * 100)}%)`}
                    />
                  ))}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Event Legend & Stats */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">Detected Events:</span>
          <div className="flex items-center gap-2">
            <Badge className={cn("text-xs", getEventBadgeColor("spindle"))}>
              Spindle ({detectedEvents.filter((e) => e.type === "spindle").length})
            </Badge>
            <Badge className={cn("text-xs", getEventBadgeColor("k-complex"))}>
              K-Complex ({detectedEvents.filter((e) => e.type === "k-complex").length})
            </Badge>
            <Badge className={cn("text-xs", getEventBadgeColor("artifact"))}>
              Artifact ({detectedEvents.filter((e) => e.type === "artifact").length})
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs text-muted-foreground">
          <span>Subject: <span className="font-mono">SNU-042</span></span>
          <span>Stage: <span className="font-mono text-primary">N2</span></span>
          <span>Time: <span className="font-mono">{Math.floor(currentEpoch * 30 / 60)}:{String(currentEpoch * 30 % 60).padStart(2, "0")}</span></span>
        </div>
      </div>
    </div>
  );
}
