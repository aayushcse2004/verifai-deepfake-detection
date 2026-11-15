import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';

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

export function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#080D18] text-[#F8FAFC]">
        <Navbar />
        <main className="flex-1">
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
            <Route path="/audit" element={<AuditTrailPage />} />
            <Route path="/settings" element={<SettingsPage />} />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
