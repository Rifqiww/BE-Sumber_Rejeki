import { useEffect, useState } from "react";
import api from "../services/api";
import { Eye, Search, X, ChevronDown, Check } from "lucide-react";
import PageHeader from "../components/PageHeader";
import { StatusBadge } from "../components/StatusBadge";
import { StatusDropdown } from "../components/StatusDropdown";

interface Order {
  id: number;
  total_price: number;
  created_at: string;
  status: string;
  user: { name: string; email: string };
  address: { address: string; zip_code: number };
  payment: { status: string; method: string; provider: string } | null;
  productCheckouts: {
    quantity: number;
    subtotal: number;
    product: { name: string; price: number; images: { image_url: string }[] };
  }[];
}

export default function Orders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // Constants
  const STATUS_OPTIONS = [
    "Belum dibayar",
    "Sedang dikirim",
    "Berhasil",
    "Dibatalkan",
  ];

  // Click outside to close filter
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest("#filter-dropdown-container")) {
        setIsFilterOpen(false);
      }
    };
    if (isFilterOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isFilterOpen]);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      console.log("Fetching orders from API...");
      const response = await api.get("/checkouts");
      console.log("API Response:", response.data);
      if (
        response.data &&
        response.data.data &&
        response.data.data.length > 0
      ) {
        setOrders(response.data.data);
      } else {
        console.warn(
          "API returned empty data, falling back to dummy data for testing."
        );
        throw new Error("Empty API data");
      }
    } catch (error) {
      console.error("Failed to fetch orders from API", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleStatus = (status: string) => {
    if (status === "Semua") {
      setSelectedStatuses([]);
      return;
    }
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const filteredOrders = orders.filter((order: Order) => {
    const matchesSearch =
      order.id.toString().includes(searchQuery) ||
      order.user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user?.email?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      selectedStatuses.length === 0 || selectedStatuses.includes(order.status);

    return matchesSearch && matchesStatus;
  });

  useEffect(() => {
    console.log("Current Orders State:", orders);
    console.log("Filtered Orders:", filteredOrders);
  }, [orders, filteredOrders]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(filteredOrders.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedOrders = filteredOrders.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset page when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedStatuses]);

  // Helper for Filter Button Label
  const getFilterLabel = () => {
    if (selectedStatuses.length === 0) return "Semua Status";
    if (selectedStatuses.length === 1) return selectedStatuses[0];
    return `${selectedStatuses.length} Status Dipilih`;
  };

  return (
    <div>
      <PageHeader
        title="Pesanan"
        description="Halaman untuk mengelola pesanan"
      />
      <div className="bg-[#FFFBF2] rounded-4xl shadow-sm border border-primary/5 overflow-hidden">
        <div className="p-6 border-b border-primary/5 flex flex-col sm:flex-row gap-4 bg-tertiary/30">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-quaternary"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari pesanan..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent focus:border-secondary rounded-2xl focus:ring-0 text-primary placeholder-quaternary/50 font-medium transition-all shadow-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Multi-Select Filter Dropdown */}
          <div className="relative" id="filter-dropdown-container">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center justify-between gap-3 px-5 py-3.5 bg-white border-2 rounded-2xl cursor-pointer min-w-[200px] transition-all shadow-sm outline-none font-bold text-sm ${
                isFilterOpen
                  ? "border-secondary ring-2 ring-secondary/10 text-primary"
                  : "border-transparent hover:border-secondary/50 text-quaternary hover:text-primary"
              }`}
            >
              <span className="truncate">{getFilterLabel()}</span>
              <ChevronDown
                size={16}
                className={`transition-transform duration-300 ${
                  isFilterOpen ? "rotate-180 text-secondary" : "text-quaternary"
                }`}
              />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-xl border border-primary/5 z-50 overflow-hidden animate-scale-in w-full min-w-[220px]">
                <div className="p-2 space-y-1">
                  {/* Option: Semua */}
                  <button
                    onClick={() => toggleStatus("Semua")}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                      selectedStatuses.length === 0
                        ? "bg-secondary/10 text-primary"
                        : "text-quaternary hover:bg-tertiary/30 hover:text-primary"
                    }`}
                  >
                    Semua
                    {selectedStatuses.length === 0 && (
                      <Check size={14} className="text-secondary" />
                    )}
                  </button>

                  <div className="h-px bg-primary/5 my-1" />

                  {/* Status Options */}
                  {STATUS_OPTIONS.map((status) => {
                    const isSelected = selectedStatuses.includes(status);
                    return (
                      <button
                        key={status}
                        onClick={() => toggleStatus(status)}
                        className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center justify-between ${
                          isSelected
                            ? "bg-secondary/10 text-primary"
                            : "text-quaternary hover:bg-tertiary/30 hover:text-primary"
                        }`}
                      >
                        {status}
                        {isSelected && (
                          <Check size={14} className="text-secondary" />
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-primary/5">
            <thead className="bg-tertiary/50">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  ID Pesanan
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  Pelanggan
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  Total
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-5 text-right text-xs font-bold text-quaternary uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-quaternary font-medium"
                  >
                    Memuat pesanan...
                  </td>
                </tr>
              ) : filteredOrders.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="px-6 py-12 text-center text-quaternary font-medium"
                  >
                    Tidak ada pesanan ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedOrders.map((order: Order) => {
                  console.log("Rendering Order Row:", order.id);
                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-tertiary/30 transition-colors group"
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                        #{order.id}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-primary">
                          {order.user?.name || "No Name"}
                        </div>
                        <div className="text-xs text-quaternary">
                          {order.user?.email || "No Email"}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-quaternary font-medium">
                        {order.created_at
                          ? new Date(order.created_at).toLocaleDateString(
                              "id-ID"
                            )
                          : "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                        Rp {Number(order.total_price || 0).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusDropdown
                          orderId={order.id}
                          currentStatus={order.status || "Belum dibayar"}
                          onStatusUpdate={fetchOrders}
                        />
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => setSelectedOrder(order)}
                          className="p-2.5 text-primary hover:bg-secondary/20 rounded-xl transition-colors"
                          title="Lihat Detail"
                        >
                          <Eye size={18} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredOrders.length > 0 && (
          <div className="px-6 py-4 border-t border-primary/5 bg-tertiary/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-primary/5 hover:bg-tertiary/50 text-primary cursor-pointer"
              >
                Sebelumnya
              </button>
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                        currentPage === page
                          ? "bg-primary text-secondary shadow-lg shadow-primary/20"
                          : "bg-white border border-primary/5 text-quaternary hover:bg-tertiary/50 hover:text-primary"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed bg-white border border-primary/5 hover:bg-tertiary/50 text-primary cursor-pointer"
              >
                Selanjutnya
              </button>
            </div>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFBF2] rounded-4xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in border border-primary/10 [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none']">
            <div className="flex justify-between items-center p-8 border-b border-primary/5 sticky top-0 bg-[#FFFBF2] z-10">
              <h2 className="text-2xl font-bold text-primary">
                Detail Pesanan #{selectedOrder.id}
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-quaternary hover:text-primary hover:bg-tertiary p-2 rounded-full transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <div className="p-8 space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-sm font-bold text-quaternary uppercase tracking-wider mb-4">
                    Informasi Pelanggan
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-secondary/20 rounded-full flex items-center justify-center text-primary">
                        <span className="font-bold">
                          {selectedOrder.user.name.charAt(0)}
                        </span>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-primary">
                          {selectedOrder.user.name}
                        </p>
                        <p className="text-xs text-quaternary">
                          {selectedOrder.user.email}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-quaternary uppercase tracking-wider mb-4">
                    Status Pesanan
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-quaternary font-medium">
                        Status Pesanan
                      </span>
                      <StatusBadge status={selectedOrder.status} size="md" />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-quaternary font-medium">
                        Status Pembayaran
                      </span>
                      <StatusBadge
                        status={selectedOrder.payment?.status || "Pending"}
                        size="sm"
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-quaternary font-medium">
                        Metode Pembayaran
                      </span>
                      <span className="text-sm font-bold text-primary uppercase">
                        {selectedOrder.payment?.method || "-"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-bold text-quaternary uppercase tracking-wider mb-4">
                  Item Pesanan
                </h3>
                <div className="bg-white rounded-2xl border border-primary/5 shadow-sm overflow-hidden">
                  <table className="min-w-full divide-y divide-primary/5">
                    <thead className="bg-tertiary/30">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                          Produk
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                          Harga
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                          Jumlah
                        </th>
                        <th className="px-6 py-4 text-right text-xs font-bold text-quaternary uppercase tracking-wider">
                          Subtotal
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-primary/5">
                      {selectedOrder.productCheckouts.map(
                        (item: any, index: number) => (
                          <tr key={index}>
                            <td className="px-5 py-3 text-sm font-medium text-primary">
                              {item.product.name}
                            </td>
                            <td className="px-5 py-3 text-sm text-quaternary text-right">
                              Rp {Number(item.product.price).toLocaleString()}
                            </td>
                            <td className="px-5 py-3 text-sm text-quaternary text-right">
                              {item.quantity}
                            </td>
                            <td className="px-5 py-3 text-sm font-bold text-primary text-right">
                              Rp {Number(item.subtotal).toLocaleString()}
                            </td>
                          </tr>
                        )
                      )}
                    </tbody>
                    <tfoot className="bg-tertiary/30">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-4 text-sm font-bold text-primary text-right"
                        >
                          Total Pembayaran
                        </td>
                        <td className="px-5 py-4 text-lg font-bold text-secondary text-right">
                          Rp{" "}
                          {Number(selectedOrder.total_price).toLocaleString()}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-tertiary-dark/10 bg-tertiary/10 rounded-b-3xl flex justify-end">
              <button
                onClick={() => setSelectedOrder(null)}
                className="px-6 py-3 bg-white border border-tertiary-dark/20 text-quaternary rounded-xl font-bold hover:bg-tertiary/50 transition-colors shadow-sm"
              >
                Close Details
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
