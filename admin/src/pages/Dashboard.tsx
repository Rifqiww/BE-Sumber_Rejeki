import {
  Activity,
  ChevronDown,
  DollarSign,
  Package,
  ShoppingCart,
  TrendingUp,
  Check,
} from "lucide-react";
import { useState } from "react";
import PageHeader from "../components/PageHeader";

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("7 Hari Terakhir");
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);

  const timeRanges = [
    "7 Hari Terakhir",
    "30 Hari Terakhir",
    "Bulan Ini",
    "Tahun Ini",
  ];

  const stats = [
    {
      label: "Total Pesanan",
      value: "0",
      icon: ShoppingCart,
      color: "text-secondary",
      bg: "bg-primary",
      trend: "+0%",
    },
    {
      label: "Total Produk",
      value: "0",
      icon: Package,
      color: "text-primary",
      bg: "bg-secondary",
      trend: "+0%",
    },
    {
      label: "Total Pendapatan",
      value: "Rp 0",
      icon: DollarSign,
      color: "text-tertiary",
      bg: "bg-green-600",
      trend: "+0%",
    },
  ];

  return (
    <div>
      <PageHeader title="Dashboard" description="Selamat datang di dashboard Admin" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div
              key={index}
              className="bg-[#FFFBF2] p-6 rounded-4xl shadow-sm border border-primary/5 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-4 rounded-2xl ${stat.bg} shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
                </div>
                <div className="flex items-center text-xs font-bold text-primary bg-secondary/20 px-3 py-1.5 rounded-full border border-secondary/30">
                  <TrendingUp size={12} className="mr-1" />
                  {stat.trend}
                </div>
              </div>

              <div>
                <p className="text-quaternary text-sm font-bold mb-1">
                  {stat.label}
                </p>
                <h3 className="text-3xl font-bold text-primary tracking-tight">
                  {stat.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      <div className="w-full">
        <div className="lg:col-span-2 bg-[#FFFBF2] p-8 rounded-4xl shadow-sm border border-primary/5">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Activity size={20} className="text-secondary" />
              Aktivitas Terbaru
            </h2>
            <div className="relative group">
              <div
                className="relative"
                onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
              >
                <button
                  type="button"
                  className={`appearance-none bg-white border-2 text-sm text-primary font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none transition-all shadow-sm flex items-center justify-between min-w-[180px] cursor-pointer ${
                    isTimeRangeOpen
                      ? "border-secondary ring-2 ring-secondary/10"
                      : "border-tertiary hover:border-secondary/50"
                  }`}
                >
                  {timeRange}
                  <ChevronDown
                    size={16}
                    className={`absolute right-3 top-1/2 -translate-y-1/2 text-quaternary transition-transform duration-300 ${
                      isTimeRangeOpen
                        ? "rotate-180 text-secondary"
                        : "group-hover:text-primary"
                    }`}
                  />
                </button>

                {isTimeRangeOpen && (
                  <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-primary/5 z-50 overflow-hidden animate-scale-in w-full min-w-[180px]">
                    <div className="p-2 space-y-1">
                      {timeRanges.map((range) => (
                        <button
                          key={range}
                          type="button"
                          onClick={() => {
                            setTimeRange(range);
                            setIsTimeRangeOpen(false);
                          }}
                          className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                            timeRange === range
                              ? "bg-secondary/10 text-primary"
                              : "text-quaternary hover:bg-tertiary/30 hover:text-primary"
                          }`}
                        >
                          {range}
                          {timeRange === range && (
                            <Check size={14} className="text-secondary" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="h-80 flex items-center justify-center text-quaternary/40 bg-tertiary/50 rounded-3xl border-2 border-dashed border-primary/10">
            <div className="text-center">
              <Activity size={48} className="mx-auto mb-2 opacity-20" />
              <p className="font-medium">Placeholder Grafik Aktivitas</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
