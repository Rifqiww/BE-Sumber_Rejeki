import { Link, useLocation } from "react-router-dom";
import LOGO from "../assets/LOGO.png";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  LogOut,
  Menu,
  User,
  X,
} from "lucide-react";
import clsx from "clsx";
import { useAuth } from "../context/AuthContext";

interface SidebarProps {
  isDesktopOpen: boolean;
  toggleDesktopSidebar: () => void;
  isMobileOpen: boolean;
  closeMobileSidebar: () => void;
  className?: string;
}

export default function Sidebar({
  isDesktopOpen,
  toggleDesktopSidebar,
  isMobileOpen,
  closeMobileSidebar,
  className,
}: SidebarProps) {
  const { logout, user } = useAuth();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/products", label: "Produk", icon: Package },
    { path: "/categories", label: "Kategori", icon: Tags },
    { path: "/orders", label: "Pesanan", icon: ShoppingCart },
  ];

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={clsx(
          "fixed inset-0 bg-black/50 z-40 md:hidden transition-opacity duration-300",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none",
        )}
        onClick={closeMobileSidebar}
      />

      <aside
        className={clsx(
          "bg-primary shadow-2xl z-50 transition-all duration-300 ease-in-out flex flex-col border-r border-primary-dark",
          // Base styles
          "h-screen",
          // Desktop styles: Relative, width controlled by isDesktopOpen
          "md:relative",
          isDesktopOpen ? "md:w-72" : "md:w-24",
          // Mobile styles: Fixed, always width 72 (full sidebar), visibility controlled by transform
          "fixed top-0 left-0 w-72",
          isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
          className,
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-primary-light/20">
          <div
            className={clsx(
              "flex items-center gap-3 overflow-hidden transition-all duration-300",
              isDesktopOpen ? "opacity-100" : "md:opacity-0 md:w-0",
            )}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0">
              <img
                src={LOGO}
                alt="SR Logo"
                className="h-10 w-auto object-contain"
              />
            </div>
            <div className="flex flex-col">
              <h1 className="text-lg font-bold text-tertiary leading-tight whitespace-nowrap">
                SR Admin
              </h1>
              <span className="text-xs text-secondary tracking-wider font-medium">
                DASHBOARD
              </span>
            </div>
          </div>

          {/* Desktop Toggle Button */}
          <button
            onClick={toggleDesktopSidebar}
            className={clsx(
              "p-2 rounded-xl text-tertiary hover:bg-primary-light/20 transition-colors focus:outline-none cursor-pointer hidden md:block",
              !isDesktopOpen && "mx-auto",
            )}
          >
            <Menu size={20} />
          </button>

          {/* Mobile Close Button */}
          <button
            onClick={closeMobileSidebar}
            className="p-2 rounded-xl text-tertiary hover:bg-primary-light/20 transition-colors focus:outline-none cursor-pointer md:hidden"
          >
            <X size={20} />
          </button>
        </div>

        {/* Navigation */}
        <nav className="p-4 space-y-2 flex-1 overflow-y-auto scrollbar-hide">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => {
                  // Close sidebar on mobile when a link is clicked
                  if (window.innerWidth < 768) {
                    closeMobileSidebar();
                  }
                }}
                className={clsx(
                  "flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-secondary text-primary font-bold shadow-lg shadow-secondary/20"
                    : "text-tertiary/80 hover:bg-primary-light/10 hover:text-tertiary",
                  // Centered icon when collapsed on desktop
                  !isDesktopOpen && "md:justify-center",
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className={clsx(
                    "whitespace-nowrap transition-all duration-300 origin-left",
                    isDesktopOpen
                      ? "opacity-100 translate-x-0"
                      : "md:opacity-0 md:-translate-x-4 md:w-0 md:hidden",
                  )}
                >
                  {item.label}
                </span>

                {/* Tooltip for collapsed state (Desktop only) */}
                {!isDesktopOpen && (
                  <div className="hidden md:block absolute left-full ml-4 px-3 py-1.5 bg-primary-dark text-tertiary text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl z-50 border border-primary-light/20 transition-opacity duration-200">
                    {item.label}
                    <div className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 w-2 h-2 bg-primary-dark rotate-45 border-l border-b border-primary-light/20"></div>
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User Profile / Logout Section */}
        <div className="p-4 border-t border-primary-light/20 bg-primary-dark/20">
          <div
            className={clsx(
              "flex items-center gap-3 mb-3",
              !isDesktopOpen && "md:justify-center",
            )}
          >
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-secondary text-secondary shrink-0">
              <User size={20} />
            </div>
            {isDesktopOpen && (
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-tertiary truncate">
                  {user?.name || "Admin"}
                </p>
                <p className="text-xs text-tertiary/60 truncate">
                  {user?.email}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={handleLogout}
            className={clsx(
              "flex items-center gap-3 text-red-300 p-3 w-full hover:bg-red-500/10 rounded-xl transition-colors",
              !isDesktopOpen && "md:justify-center",
            )}
            title="Keluar"
          >
            <LogOut size={20} />
            {isDesktopOpen && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </aside>
    </>
  );
}
