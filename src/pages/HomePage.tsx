import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  FileText,
  Clock,
  Check,
  ChevronRight,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";

export default function HomePage() {
  const navigate = useNavigate();
  const { projects, createProject, loadProject, deleteProject } = useProjectStore();

  const handleNewProject = () => {
    const name = `New Experiment ${projects.length + 1}`;
    createProject(name);
    navigate("/setup/protocol");
  };

  const handleLoadProject = (id: string) => {
    loadProject(id);
    const project = projects.find(p => p.id === id);
    if (project) {
      const stepPaths = [
        "/setup/protocol",
        "/setup/cohort",
        "/setup/dataset",
        "/data/qc",
        "/data/split",
        "/data/preprocess",
        "/train",
        "/evaluate",
        "/explain",
        "/export",
      ];
      navigate(stepPaths[Math.min(project.currentStep - 1, 9)]);
    }
  };

  const handleDeleteProject = (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Delete this project?")) {
      deleteProject(id);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      const diffHours = Math.floor(diffMs / 3600000);
      const diffDays = Math.floor(diffMs / 86400000);

      if (diffMins < 1) return "Just now";
      if (diffMins < 60) return `${diffMins} min ago`;
      if (diffHours < 24) return `${diffHours} hours ago`;
      if (diffDays < 7) return `${diffDays} days ago`;
      return date.toLocaleDateString("en-US");
    } catch {
      return dateString;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex flex-col items-center">
            <img
              src="/logo_green.png"
              alt="Risorius"
              className="h-8 w-auto object-contain"
            />
            <span className="text-[10px] text-muted-foreground mt-1">EEG/PSG AI Co-Scientist</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full text-primary text-sm font-medium mb-4">
            <Sparkles className="w-4 h-4" />
            AI-Powered Research Assistant
          </div>
          <h2 className="text-4xl font-bold mb-4">
            Start Your EEG Analysis
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Upload your research protocol and dataset to begin.
            Our AI will guide you through each step of the analysis pipeline.
          </p>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 mb-12">
          {/* New Experiment Card */}
          <button
            onClick={handleNewProject}
            className="group block p-8 bg-card border-2 border-dashed border-primary/30 rounded-xl hover:border-primary hover:bg-primary/5 transition-all text-left"
          >
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <Plus className="w-7 h-7 text-primary" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">New Experiment</h3>
                <p className="text-muted-foreground mb-4">
                  Start a new analysis by uploading your research protocol and dataset.
                </p>
                <div className="flex items-center text-primary font-medium">
                  Get Started
                  <ChevronRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>
          </button>

          {/* Recent Projects Card */}
          <div className="p-8 bg-card border rounded-xl">
            <div className="flex items-start gap-4 mb-6">
              <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                <Clock className="w-7 h-7 text-muted-foreground" />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-semibold mb-2">Recent Projects</h3>
                <p className="text-muted-foreground">
                  {projects.length > 0
                    ? "Continue working on your previous experiments."
                    : "No projects yet. Create a new experiment to get started."
                  }
                </p>
              </div>
            </div>

            {/* Projects List */}
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {projects.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No projects yet</p>
                </div>
              ) : (
                projects.map((project) => (
                  <div
                    key={project.id}
                    onClick={() => handleLoadProject(project.id)}
                    className="flex items-center gap-4 p-3 rounded-lg bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer group"
                  >
                    <FileText className="w-5 h-5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{project.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {formatDate(project.updatedAt)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {project.currentStep === 10 && project.completedSteps.length === 10 ? (
                        <Badge variant="secondary" className="bg-status-pass/10 text-status-pass border-0">
                          <Check className="w-3 h-3 mr-1" />
                          Complete
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          Step {project.currentStep}/10
                        </Badge>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleDeleteProject(e, project.id)}
                      >
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                      <ChevronRight className="w-4 h-4 text-muted-foreground" />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Pipeline Overview */}
        <div className="bg-card border rounded-xl p-8">
          <h3 className="text-lg font-semibold mb-6 text-center">
            8-Step Analysis Pipeline
          </h3>

          <div className="grid grid-cols-4 gap-4 text-center">
            {[
              { step: 1, name: "Protocol", desc: "Upload research plan" },
              { step: 2, name: "Data & Cohort", desc: "Scan + filter subjects" },
              { step: 3, name: "Validation", desc: "QC + Split (AI auto)" },
              { step: 4, name: "Preprocess", desc: "Signal processing" },
            ].map((item) => (
              <div key={item.step} className="p-4 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium mx-auto mb-2">
                  {item.step}
                </div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-4 gap-4 text-center mt-4">
            {[
              { step: 5, name: "Training", desc: "Model training" },
              { step: 6, name: "Evaluation", desc: "Performance metrics" },
              { step: 7, name: "Mech-I", desc: "Mechanistic analysis" },
              { step: 8, name: "Export", desc: "Generate report" },
            ].map((item) => (
              <div key={item.step} className="p-4 bg-muted/30 rounded-lg">
                <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium mx-auto mb-2">
                  {item.step}
                </div>
                <div className="font-medium text-sm">{item.name}</div>
                <div className="text-xs text-muted-foreground mt-1">{item.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
