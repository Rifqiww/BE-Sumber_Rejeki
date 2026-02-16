import {
  Activity,
  ChevronDown,
  DollarSign,
  Package,
  ShoppingCart,
  Check,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import PageHeader from "../components/PageHeader";
import api from "../services/api";

interface Order {
  id: number;
  total_price: number;
  created_at: string;
  status: string;
  payment: { status: string } | null;
  productCheckouts: {
    quantity: number;
    subtotal: number;
    product: { price: number };
  }[];
  user: { name: string; email: string };
}

export default function Dashboard() {
  const [timeRange, setTimeRange] = useState("7 Hari Terakhir");
  const [isTimeRangeOpen, setIsTimeRangeOpen] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);

  const timeRanges = [
    "7 Hari Terakhir",
    "30 Hari Terakhir",
    "1 Tahun Terakhir",
  ];

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const response = await api.get("/checkouts");

      if (response.data && response.data.data) {
        // Sort by newest first
        const sortedData = response.data.data.sort(
          (a: Order, b: Order) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime(),
        );
        setOrders(sortedData);
      }
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    }
  };

  const isOrderPaid = (order: Order) => {
    const validStatuses = ["Berhasil", "Sedang dikirim"];
    const validPaymentStatuses = ["settlement", "capture"];

    return (
      validStatuses.includes(order.status) ||
      (order.payment && validPaymentStatuses.includes(order.payment.status))
    );
  };

  const calculatedStats = useMemo(() => {
    const totalOrders = orders.length;

    const totalProducts = orders.reduce((acc, order) => {
      return (
        acc +
        order.productCheckouts.reduce((sum, item) => sum + item.quantity, 0)
      );
    }, 0);

    const totalRevenue = orders.reduce((acc, order) => {
      return isOrderPaid(order) ? acc + order.total_price : acc;
    }, 0);

    return { totalOrders, totalProducts, totalRevenue };
  }, [orders]);

  const chartData = useMemo(() => {
    const categories: string[] = [];
    const dataPoints: number[] = [];
    const now = new Date(); // Use local time

    if (timeRange === "1 Tahun Terakhir") {
      // Rolling 12 Months logic
      const tempData: { [key: string]: number } = {};

      const formatMonthKey = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        return `${y}-${m}`;
      };

      // Generate last 12 months (0 to 11 months ago)
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = formatMonthKey(d);
        const label = d.toLocaleDateString("id-ID", { month: "short" });
        categories.push(label);
        tempData[key] = 0;
      }

      // Fill Data
      orders.forEach((order) => {
        if (!isOrderPaid(order)) return;

        const orderDate = new Date(order.created_at);
        const key = formatMonthKey(orderDate);

        if (tempData[key] !== undefined) {
          tempData[key] += order.total_price;
        }
      });

      // Map to array matching categories
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = formatMonthKey(d);
        dataPoints.push(tempData[key]);
      }
    } else {
      // Daily logic (7 or 30 days)
      const days = timeRange === "30 Hari Terakhir" ? 30 : 7;
      const tempData: { [key: string]: number } = {};

      // helper to format date as YYYY-MM-DD in local time
      const formatDateKey = (date: Date) => {
        const y = date.getFullYear();
        const m = String(date.getMonth() + 1).padStart(2, "0");
        const d = String(date.getDate()).padStart(2, "0");
        return `${y}-${m}-${d}`;
      };

      // Generate last N days
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = formatDateKey(d);

        categories.push(
          d.toLocaleDateString("id-ID", { day: "numeric", month: "short" }),
        );
        tempData[key] = 0;
      }

      // Fill Data
      orders.forEach((order) => {
        if (!isOrderPaid(order)) return;

        const orderDate = new Date(order.created_at);
        const key = formatDateKey(orderDate);

        if (tempData[key] !== undefined) {
          tempData[key] += order.total_price;
        }
      });

      // Map to array matching categories order
      for (let i = days - 1; i >= 0; i--) {
        const d = new Date();
        d.setDate(now.getDate() - i);
        const key = formatDateKey(d);
        dataPoints.push(tempData[key]);
      }
    }

    return {
      series: [
        {
          name: "Pendapatan",
          data: dataPoints,
        },
      ],
      options: {
        chart: {
          type: "area" as const,
          height: 350,
          toolbar: {
            show: false,
          },
          fontFamily: "inherit",
          animations: {
            enabled: true,
          },
        },
        colors: ["#8B4513"],
        fill: {
          type: "gradient",
          gradient: {
            shadeIntensity: 1,
            opacityFrom: 0.7,
            opacityTo: 0.2,
            stops: [0, 90, 100],
          },
        },
        dataLabels: {
          enabled: false,
        },
        stroke: {
          curve: "smooth" as const,
          width: 2,
        },
        xaxis: {
          categories: categories,
          axisBorder: {
            show: false,
          },
          axisTicks: {
            show: false,
          },
          labels: {
            style: {
              colors: "#9ca3af",
              fontSize: "12px",
            },
          },
        },
        yaxis: {
          labels: {
            style: {
              colors: "#9ca3af",
              fontSize: "12px",
            },
            formatter: (value: number) => {
              if (value >= 1000000) {
                return "Rp " + (value / 1000000).toFixed(1) + "jt";
              }
              return "Rp " + (value / 1000).toLocaleString("id-ID") + "k";
            },
          },
        },
        grid: {
          borderColor: "#f3f4f6",
          strokeDashArray: 4,
          yaxis: {
            lines: {
              show: true,
            },
          },
        },
        tooltip: {
          theme: "light",
          y: {
            formatter: (value: number) => {
              return new Intl.NumberFormat("id-ID", {
                style: "currency",
                currency: "IDR",
              }).format(value);
            },
          },
        },
      },
    };
  }, [orders, timeRange]);

  const stats = [
    {
      label: "Total Pesanan",
      value: calculatedStats.totalOrders.toString(),
      icon: ShoppingCart,
      color: "text-secondary",
      bg: "bg-primary",
    },
    {
      label: "Total Produk Terjual",
      value: calculatedStats.totalProducts.toString(),
      icon: Package,
      color: "text-primary",
      bg: "bg-secondary",
    },
    {
      label: "Total Pendapatan",
      value: `Rp ${calculatedStats.totalRevenue.toLocaleString("id-ID")}`,
      icon: DollarSign,
      color: "text-tertiary",
      bg: "bg-green-600",
    },
  ];

  return (
    <div>
      <PageHeader
        title="Dashboard"
        description="Selamat datang di dashboard Admin"
      />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              className="bg-[#FFFBF2] p-6 rounded-4xl shadow-sm border border-primary/5 hover:shadow-xl hover:shadow-primary/5 hover:-translate-y-1 transition-all duration-300 group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`p-4 rounded-2xl ${stat.bg} shadow-lg shadow-primary/10 group-hover:scale-110 transition-transform duration-300`}
                >
                  <Icon className={`w-6 h-6 ${stat.color}`} />
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
        {/* Chart Section */}
        <div className="bg-[#FFFBF2] p-8 rounded-4xl shadow-sm border border-primary/5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-primary flex items-center gap-2">
              <Activity size={20} className="text-secondary" />
              Aktivitas Pendapatan
            </h2>
            <div className="relative group w-full md:w-auto">
              <div
                className="relative"
                onClick={() => setIsTimeRangeOpen(!isTimeRangeOpen)}
              >
                <button
                  type="button"
                  className={`appearance-none bg-white border-2 text-sm text-primary font-bold rounded-xl pl-4 pr-10 py-2.5 outline-none transition-all shadow-sm flex items-center justify-between w-full md:min-w-[180px] cursor-pointer ${
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
          <div className="h-80 w-full relative">
            <ReactApexChart
              options={chartData.options}
              series={chartData.series}
              type="area"
              height="100%"
              width="100%"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
