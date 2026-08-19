import React, { useState } from "react";
import { Outlet } from "react-router-dom";
import { Navbar } from "./Navbar";
import { Sidebar } from "./Sidebar";
import { HabitModal } from "./HabitModal";

export const Layout = () => {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [habitModalOpen, setHabitModalOpen] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const handleHabitSaved = () => {
    setRefreshTrigger((prev) => prev + 1);
    window.dispatchEvent(new CustomEvent("habit_updated"));
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white transition-colors">
      {/* Sidebar (Fixed on Desktop) */}
      <Sidebar
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      {/* Main Column (Offset by Sidebar on Desktop) */}
      <div className="flex-1 lg:pl-64 flex flex-col min-w-0">
        {/* Top Navbar */}
        <Navbar
          onOpenHabitModal={() => setHabitModalOpen(true)}
          onToggleMobileSidebar={() => setMobileSidebarOpen(!mobileSidebarOpen)}
        />

        {/* Page Content */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet context={{ refreshTrigger, onOpenCreateHabit: () => setHabitModalOpen(true) }} />
        </main>
      </div>

      {/* Global Habit Creation Modal */}
      <HabitModal
        isOpen={habitModalOpen}
        onClose={() => setHabitModalOpen(false)}
        onSaved={handleHabitSaved}
      />
    </div>
  );
};
