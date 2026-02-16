import { Outlet } from "react-router-dom";
import { Menu } from "lucide-react";
import clsx from "clsx";
import { useState } from "react";
import Sidebar from "./Sidebar";

export default function Layout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);
  const toggleMobileSidebar = () => setIsMobileOpen(!isMobileOpen);

  return (
    <div className="flex h-screen bg-tertiary font-sans overflow-hidden text-primary">
      {/* Sidebar */}
      <Sidebar
        isDesktopOpen={isSidebarOpen}
        toggleDesktopSidebar={toggleSidebar}
        isMobileOpen={isMobileOpen}
        closeMobileSidebar={() => setIsMobileOpen(false)}
      />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-tertiary relative">
        {/* Mobile Header for Menu Toggle */}
        <div className="md:hidden p-4 flex items-center border-b border-primary/10 bg-primary/5">
          <button
            onClick={toggleMobileSidebar}
            className="p-2 rounded-xl text-primary hover:bg-primary/5 transition-colors"
          >
            <Menu size={24} />
          </button>
          <span className="ml-4 font-bold text-lg">SR Admin</span>
        </div>

        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto px-8 pb-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
