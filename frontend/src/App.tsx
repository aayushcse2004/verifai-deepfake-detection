import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LandingPage } from './pages/LandingPage';
import { Dashboard } from './pages/Dashboard';
import { UploadPage } from './pages/UploadPage';
import { ProcessingPage } from './pages/ProcessingPage';
import { ResultsPage } from './pages/ResultsPage';
import { HistoryPage } from './pages/HistoryPage';
import { SettingsPage } from './pages/SettingsPage';

export function App() {
  return (
    <Router>
      <div className="min-h-screen flex flex-col bg-[#080D18] text-[#F8FAFC]">
        <Navbar />
        <main className="flex-1">
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/processing/:analysisId" element={<ProcessingPage />} />
            <Route path="/results/:analysisId" element={<ResultsPage />} />
            <Route path="/history" element={<HistoryPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
