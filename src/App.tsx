import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { TaskProvider, useTasks } from "./context/TaskContext";
import { Sidebar } from "./components/layout/Sidebar";
import { Navbar } from "./components/layout/Navbar";
import { DashboardView } from "./components/dashboard/DashboardView";
import { AiInboxView } from "./components/inbox/AiInboxView";
import { TasksView } from "./components/tasks/TasksView";
import { UpcomingView } from "./components/upcoming/UpcomingView";
import { CompletedView } from "./components/completed/CompletedView";
import { AiSearchView } from "./components/search/AiSearchView";
import { SettingsView } from "./components/settings/SettingsView";
import { TaskModal } from "./components/common/TaskModal";

const MainContent: React.FC = () => {
  const { activeTab } = useTasks();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <DashboardView />;
      case "inbox":
        return <AiInboxView />;
      case "tasks":
        return <TasksView />;
      case "upcoming":
        return <UpcomingView />;
      case "completed":
        return <CompletedView />;
      case "search":
        return <AiSearchView />;
      case "settings":
        return <SettingsView />;
      default:
        return <DashboardView />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Dynamic ambient backdrop lighting elements */}
      <div className="fixed top-0 left-1/4 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none -z-10" />
      <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-blue-600/3 rounded-full blur-[180px] pointer-events-none -z-10" />

      {/* Left Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Layout Area */}
      <div className="lg:pl-64 xl:pl-72 flex flex-col flex-1 min-h-screen">
        {/* Top Navbar */}
        <Navbar onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Dynamic Page Container */}
        <main className="flex-1 px-4 sm:px-8 py-6 sm:py-8 max-w-7xl w-full mx-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveTab()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Global Task Creation/Edit Modal */}
      <TaskModal />
    </div>
  );
};

export default function App() {
  return (
    <TaskProvider>
      <MainContent />
    </TaskProvider>
  );
}
