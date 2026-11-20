import React, { Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './layouts/AppLayout';
import { Skeleton } from './components/common/Skeleton';

// Pages
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { UploadPage } from './pages/UploadPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';
import { SystemMonitorPage } from './pages/SystemMonitorPage';
import { ModelRegistryPage } from './pages/ModelRegistryPage';
import { EvaluationCenterPage } from './pages/EvaluationCenterPage';
import { AuditTrailPage } from './pages/AuditTrailPage';
import { MediaComparePage } from './pages/MediaComparePage';
import { ReportsPage } from './pages/ReportsPage';
import { VideoForensicsPage } from './pages/VideoForensicsPage';
import { AudioForensicsPage } from './pages/AudioForensicsPage';
import { SyncLabPage } from './pages/SyncLabPage';
import { EvidenceExplorerPage } from './pages/EvidenceExplorerPage';

const PageLoader = () => (
  <div className="py-24 text-center space-y-4">
    <div className="w-10 h-10 border-4 border-[#06B6D4] border-t-transparent rounded-full animate-spin mx-auto" />
    <p className="text-xs font-mono text-[#94A3B8]">Loading forensic module...</p>
  </div>
);

export function App() {
  return (
    <Router>
      <AppLayout>
        <Suspense fallback={<PageLoader />}>
          <Routes>
            {/* Workspace */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/processing/:analysisId" element={<ProcessingPage />} />
            <Route path="/results/:analysisId" element={<ResultsPage />} />
            <Route path="/investigation/:analysisId" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />

            {/* Forensic Laboratory */}
            <Route path="/lab/video" element={<VideoForensicsPage />} />
            <Route path="/lab/video/:analysisId" element={<VideoForensicsPage />} />
            <Route path="/lab/audio" element={<AudioForensicsPage />} />
            <Route path="/lab/audio/:analysisId" element={<AudioForensicsPage />} />
            <Route path="/lab/sync" element={<SyncLabPage />} />
            <Route path="/lab/sync/:analysisId" element={<SyncLabPage />} />
            <Route path="/lab/compare" element={<MediaComparePage />} />
            <Route path="/evidence" element={<EvidenceExplorerPage />} />
            <Route path="/evidence/:analysisId" element={<EvidenceExplorerPage />} />

            {/* AI Intelligence */}
            <Route path="/models" element={<ModelRegistryPage />} />
            <Route path="/evaluation" element={<EvaluationCenterPage />} />
            <Route path="/system" element={<SystemMonitorPage />} />

            {/* Management */}
            <Route path="/reports" element={<ReportsPage />} />
            <Route path="/reports/:analysisId" element={<ReportsPage />} />
            <Route path="/audit" element={<AuditTrailPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </AppLayout>
    </Router>
  );
}

export default App;
