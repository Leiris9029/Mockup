import { useState } from "react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Sleep stages
const stages = ["W", "N1", "N2", "N3", "REM"];
const stageColors: Record<string, string> = {
  W: "#ef4444",
  N1: "#f59e0b",
  N2: "#3b82f6",
  N3: "#8b5cf6",
  REM: "#22c55e",
};

// Generate hypnogram data (30-second epochs)
function generateHypnogram(totalEpochs: number): string[] {
  const result: string[] = [];
  let currentStage = "W";
  let stageCounter = 0;

  // Typical sleep progression
  const progression = ["W", "N1", "N2", "N3", "N2", "REM", "N2", "N3", "N2", "REM", "N2", "N1", "W"];
  let progressionIndex = 0;

  for (let i = 0; i < totalEpochs; i++) {
    result.push(currentStage);
    stageCounter++;

    // Change stage periodically
    const stageDuration = currentStage === "W" ? 5 :
      currentStage === "N1" ? 8 :
        currentStage === "N2" ? 30 :
          currentStage === "N3" ? 25 :
            currentStage === "REM" ? 20 : 10;

    if (stageCounter >= stageDuration + Math.floor(Math.random() * 10 - 5)) {
      progressionIndex = (progressionIndex + 1) % progression.length;
      currentStage = progression[progressionIndex];
      stageCounter = 0;
    }
  }

  return result;
}

// Event types
interface SleepEvent {
  type: "spindle" | "k-complex" | "arousal" | "artifact";
  epoch: number;
  time: number; // seconds within epoch
  duration: number;
  confidence: number;
}

// Generate events
function generateEvents(totalEpochs: number, hypnogram: string[]): SleepEvent[] {
  const events: SleepEvent[] = [];

  for (let epoch = 0; epoch < totalEpochs; epoch++) {
    const stage = hypnogram[epoch];

    // Spindles mostly in N2
    if (stage === "N2" && Math.random() > 0.4) {
      events.push({
        type: "spindle",
        epoch,
        time: Math.random() * 25,
        duration: 0.5 + Math.random() * 1,
        confidence: 0.75 + Math.random() * 0.2,
      });
      // Sometimes multiple spindles per epoch
      if (Math.random() > 0.6) {
        events.push({
          type: "spindle",
          epoch,
          time: 15 + Math.random() * 10,
          duration: 0.5 + Math.random() * 1,
          confidence: 0.7 + Math.random() * 0.25,
        });
      }
    }

    // K-complexes in N2
    if (stage === "N2" && Math.random() > 0.7) {
      events.push({
        type: "k-complex",
        epoch,
        time: Math.random() * 28,
        duration: 0.8 + Math.random() * 0.4,
        confidence: 0.8 + Math.random() * 0.15,
      });
    }

    // Arousals
    if (Math.random() > 0.92) {
      events.push({
        type: "arousal",
        epoch,
        time: Math.random() * 27,
        duration: 3 + Math.random() * 5,
        confidence: 0.85 + Math.random() * 0.1,
      });
    }

    // Artifacts
    if (Math.random() > 0.95) {
      events.push({
        type: "artifact",
        epoch,
        time: Math.random() * 25,
        duration: 2 + Math.random() * 3,
        confidence: 0.9 + Math.random() * 0.1,
      });
    }
  }

  return events;
}

const eventColors: Record<string, string> = {
  spindle: "#3b82f6",
  "k-complex": "#f59e0b",
  arousal: "#ef4444",
  artifact: "#6b7280",
};

export function EventTimeline() {
  const totalEpochs = 240; // 2 hours of data
  const [viewStart, setViewStart] = useState(0);
  const viewWidth = 60; // epochs visible at once

  const hypnogram = generateHypnogram(totalEpochs);
  const events = generateEvents(totalEpochs, hypnogram);

  const visibleEvents = events.filter(
    (e) => e.epoch >= viewStart && e.epoch < viewStart + viewWidth
  );

  const handlePrev = () => setViewStart(Math.max(0, viewStart - 30));
  const handleNext = () => setViewStart(Math.min(totalEpochs - viewWidth, viewStart + 30));

  // Count events by type
  const eventCounts = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <h4 className="font-medium">Sleep Event Timeline</h4>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handlePrev}>
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <span className="text-sm font-mono min-w-[120px] text-center">
              {Math.floor(viewStart * 0.5)}m - {Math.floor((viewStart + viewWidth) * 0.5)}m
            </span>
            <Button variant="ghost" size="icon" className="h-8 w-8" onClick={handleNext}>
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hypnogram */}
      <div className="bg-card rounded-lg border p-4">
        <div className="text-xs text-muted-foreground mb-2">Hypnogram</div>
        <div className="relative h-24">
          {/* Stage labels */}
          <div className="absolute left-0 top-0 bottom-0 w-10 flex flex-col justify-between text-[10px] text-muted-foreground pr-2">
            {stages.map((stage) => (
              <span key={stage} className="text-right">{stage}</span>
            ))}
          </div>

          {/* Hypnogram plot */}
          <div className="ml-10 h-full relative">
            <svg viewBox={`0 0 ${viewWidth} 100`} className="w-full h-full" preserveAspectRatio="none">
              {/* Background grid */}
              {[0, 25, 50, 75, 100].map((y) => (
                <line key={y} x1="0" y1={y} x2={viewWidth} y2={y} stroke="currentColor" strokeOpacity="0.1" />
              ))}

              {/* Hypnogram line */}
              <polyline
                points={hypnogram
                  .slice(viewStart, viewStart + viewWidth)
                  .map((stage, i) => {
                    const y = stages.indexOf(stage) * 25;
                    return `${i},${y}`;
                  })
                  .join(" ")}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="0.5"
              />

              {/* Stage colors as background */}
              {hypnogram.slice(viewStart, viewStart + viewWidth).map((stage, i) => (
                <rect
                  key={i}
                  x={i}
                  y={stages.indexOf(stage) * 25 - 2}
                  width="1"
                  height="6"
                  fill={stageColors[stage]}
                  opacity="0.8"
                />
              ))}
            </svg>
          </div>
        </div>
      </div>

      {/* Events */}
      <div className="bg-card rounded-lg border p-4">
        <div className="text-xs text-muted-foreground mb-2">Detected Events</div>
        <div className="relative h-20">
          {/* Event type labels */}
          <div className="absolute left-0 top-0 bottom-0 w-16 flex flex-col justify-around text-[10px] text-muted-foreground pr-2">
            <span>Spindle</span>
            <span>K-Complex</span>
            <span>Arousal</span>
            <span>Artifact</span>
          </div>

          {/* Events plot */}
          <div className="ml-16 h-full relative">
            <svg viewBox={`0 0 ${viewWidth} 80`} className="w-full h-full" preserveAspectRatio="none">
              {/* Grid lines */}
              {[0, 20, 40, 60, 80].map((y) => (
                <line key={y} x1="0" y1={y} x2={viewWidth} y2={y} stroke="currentColor" strokeOpacity="0.1" />
              ))}

              {/* Event markers */}
              {visibleEvents.map((event, i) => {
                const x = event.epoch - viewStart + event.time / 30;
                const typeIndex = ["spindle", "k-complex", "arousal", "artifact"].indexOf(event.type);
                const y = typeIndex * 20 + 10;

                return (
                  <circle
                    key={i}
                    cx={x}
                    cy={y}
                    r={1.5}
                    fill={eventColors[event.type]}
                    opacity={event.confidence}
                  />
                );
              })}
            </svg>
          </div>
        </div>
      </div>

      {/* Event statistics */}
      <div className="grid grid-cols-5 gap-4">
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{eventCounts.spindle || 0}</div>
          <div className="text-xs text-muted-foreground">Spindles</div>
          <Badge className="mt-1 text-[10px]" style={{ backgroundColor: eventColors.spindle }}>
            {((eventCounts.spindle || 0) / (totalEpochs * 0.5)).toFixed(1)}/min
          </Badge>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{eventCounts["k-complex"] || 0}</div>
          <div className="text-xs text-muted-foreground">K-Complexes</div>
          <Badge className="mt-1 text-[10px]" style={{ backgroundColor: eventColors["k-complex"] }}>
            {((eventCounts["k-complex"] || 0) / (totalEpochs * 0.5)).toFixed(1)}/min
          </Badge>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{eventCounts.arousal || 0}</div>
          <div className="text-xs text-muted-foreground">Arousals</div>
          <Badge className="mt-1 text-[10px]" style={{ backgroundColor: eventColors.arousal }}>
            {((eventCounts.arousal || 0) / 2).toFixed(1)}/hr
          </Badge>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">{eventCounts.artifact || 0}</div>
          <div className="text-xs text-muted-foreground">Artifacts</div>
          <Badge className="mt-1 text-[10px]" style={{ backgroundColor: eventColors.artifact }}>
            {(((eventCounts.artifact || 0) / totalEpochs) * 100).toFixed(1)}%
          </Badge>
        </div>
        <div className="bg-muted/30 rounded-lg p-3 text-center">
          <div className="text-2xl font-bold">89%</div>
          <div className="text-xs text-muted-foreground">Sleep Efficiency</div>
          <Badge variant="outline" className="mt-1 text-[10px]">
            Normal
          </Badge>
        </div>
      </div>

      {/* Stage legend */}
      <div className="flex items-center justify-center gap-4 text-xs">
        {stages.map((stage) => (
          <div key={stage} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded"
              style={{ backgroundColor: stageColors[stage] }}
            />
            <span className="text-muted-foreground">{stage}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
