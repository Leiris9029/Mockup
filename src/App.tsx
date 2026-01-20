import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";

// Pages - 8 Step Pipeline
import HomePage from "./pages/HomePage";
import ProtocolPage from "./pages/setup/ProtocolPage";
import DataCohortPage from "./pages/setup/DataCohortPage";
import DataValidationPage from "./pages/data/DataValidationPage";
import PreprocessPage from "./pages/data/PreprocessPage";
import TrainingPage from "./pages/TrainingPage";
import EvaluationPage from "./pages/EvaluationPage";
import ExplanationPage from "./pages/ExplanationPage";
import ExportPage from "./pages/ExportPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Home */}
          <Route path="/" element={<HomePage />} />

          {/* Step 1: Protocol */}
          <Route path="/setup/protocol" element={<ProtocolPage />} />

          {/* Step 2: Dataset & Cohort (merged) */}
          <Route path="/setup/data" element={<DataCohortPage />} />

          {/* Step 3: Data Validation (QC + Split merged) */}
          <Route path="/data/validation" element={<DataValidationPage />} />

          {/* Step 4: Preprocessing */}
          <Route path="/data/preprocess" element={<PreprocessPage />} />

          {/* Step 5: Training */}
          <Route path="/train" element={<TrainingPage />} />

          {/* Step 6: Evaluation */}
          <Route path="/evaluate" element={<EvaluationPage />} />

          {/* Step 7: Mechanistic Interpretability */}
          <Route path="/explain" element={<ExplanationPage />} />

          {/* Step 8: Export */}
          <Route path="/export" element={<ExportPage />} />

          {/* Legacy routes for backward compatibility */}
          <Route path="/setup/cohort" element={<DataCohortPage />} />
          <Route path="/setup/dataset" element={<DataCohortPage />} />
          <Route path="/data/qc" element={<DataValidationPage />} />
          <Route path="/data/split" element={<DataValidationPage />} />

          {/* 404 */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
