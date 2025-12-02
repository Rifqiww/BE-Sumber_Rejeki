import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import LOGO from "../assets/LOGO.png";
import { useAuth } from "../context/AuthContext";
import {
  LayoutDashboard,
  Package,
  Tags,
  ShoppingCart,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import clsx from "clsx";
import { useState } from "react";

export default function Layout() {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/products", label: "Produk", icon: Package },
    { path: "/categories", label: "Kategori", icon: Tags },
    { path: "/orders", label: "Pesanan", icon: ShoppingCart },
  ];

  return (
    <div className="flex h-screen bg-tertiary font-sans overflow-hidden text-primary">
      {/* Sidebar */}
      <aside
        className={clsx(
          "bg-primary shadow-2xl z-30 transition-all duration-300 ease-in-out flex flex-col relative border-r border-primary-dark",
          isSidebarOpen ? "w-72" : "w-24"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between border-b border-primary-light/20">
          <div
            className={clsx(
              "flex items-center gap-3 overflow-hidden transition-all duration-300",
              isSidebarOpen ? "opacity-100" : "opacity-0 w-0"
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

          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className={clsx(
              "p-2 rounded-xl text-tertiary hover:bg-primary-light/20 transition-colors focus:outline-none cursor-pointer",
              !isSidebarOpen && "mx-auto"
            )}
          >
            <Menu size={20} />
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
                className={clsx(
                  "flex items-center gap-3 p-3.5 rounded-xl transition-all duration-200 group relative",
                  isActive
                    ? "bg-secondary text-primary font-bold shadow-lg shadow-secondary/20"
                    : "text-tertiary/80 hover:bg-primary-light/10 hover:text-tertiary",
                  !isSidebarOpen && "justify-center"
                )}
              >
                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                <span
                  className={clsx(
                    "whitespace-nowrap transition-all duration-300 origin-left",
                    isSidebarOpen
                      ? "opacity-100 translate-x-0"
                      : "opacity-0 -translate-x-4 w-0 hidden"
                  )}
                >
                  {item.label}
                </span>

                {/* Tooltip for collapsed state */}
                {!isSidebarOpen && (
                  <div className="absolute left-full ml-4 px-3 py-1.5 bg-primary-dark text-tertiary text-sm rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap shadow-xl z-50 border border-primary-light/20 transition-opacity duration-200">
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
              !isSidebarOpen && "justify-center"
            )}
          >
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center border-2 border-secondary text-secondary shrink-0">
              <User size={20} />
            </div>
            {isSidebarOpen && (
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
              !isSidebarOpen && "justify-center"
            )}
            title="Keluar"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Keluar</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden bg-tertiary relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-secondary/5 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none"></div>

        {/* Header */}
        <header className="h-24 flex items-center justify-between px-8 z-10">
          <div>
            <h2 className="text-3xl font-bold text-primary tracking-tight">
              {navItems.find((i) => i.path === location.pathname)?.label ||
                "Dashboard"}
            </h2>
            <p className="text-quaternary font-medium mt-1">
              Selamat datang kembali, {user?.name}
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-primary/5 text-sm font-medium text-primary shadow-sm">
              {new Date().toLocaleDateString("id-ID", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
          </div>
        </header>

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
