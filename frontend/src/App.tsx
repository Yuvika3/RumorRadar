import React, { useState } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { LiveInferenceDrawer } from './components/LiveInferenceDrawer';

import { HomePage } from './pages/HomePage';
import { DashboardPage } from './pages/DashboardPage';
import { DataExplorerPage } from './pages/DataExplorerPage';
import { ExperimentLabPage } from './pages/ExperimentLabPage';
import { ModelComparisonPage } from './pages/ModelComparisonPage';
import { EmotionEngagementAnalyticsPage } from './pages/EmotionEngagementAnalyticsPage';
import { ResearchReportPage } from './pages/ResearchReportPage';
import { MethodologyPage } from './pages/MethodologyPage';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('home');
  const [isInferenceOpen, setIsInferenceOpen] = useState<boolean>(false);

  const renderActivePage = () => {
    switch (currentTab) {
      case 'home':
        return (
          <HomePage
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenInference={() => setIsInferenceOpen(true)}
          />
        );
      case 'dashboard':
        return <DashboardPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'explorer':
        return <DataExplorerPage />;
      case 'lab':
        return <ExperimentLabPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'comparison':
        return <ModelComparisonPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'analytics':
        return <EmotionEngagementAnalyticsPage />;
      case 'report':
        return <ResearchReportPage onNavigate={(tab) => setCurrentTab(tab)} />;
      case 'methodology':
        return <MethodologyPage />;
      default:
        return (
          <HomePage
            onNavigate={(tab) => setCurrentTab(tab)}
            onOpenInference={() => setIsInferenceOpen(true)}
          />
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 text-slate-100 selection:bg-cyan-500/30 selection:text-cyan-200">
      <Navbar
        currentTab={currentTab}
        onTabChange={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenInference={() => setIsInferenceOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderActivePage()}
      </main>

      <Footer />

      <LiveInferenceDrawer
        isOpen={isInferenceOpen}
        onClose={() => setIsInferenceOpen(false)}
      />
    </div>
  );
}

export default App;
