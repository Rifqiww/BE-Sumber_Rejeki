import { useEffect, useState } from "react";
import api from "../services/api";
import { Eye, Search, X } from "lucide-react";
import PageHeader from "../components/PageHeader";

interface Order {
  id: number;
  total_price: number;
  created_at: string;
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

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await api.get("/checkouts");
      setOrders(response.data.data);
    } catch (error) {
      console.error("Failed to fetch orders", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredOrders = orders.filter(
    (order) =>
      order.id.toString().includes(searchQuery) ||
      order.user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      order.user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getStatusColor = (status?: string) => {
    switch (status?.toLowerCase()) {
      case "paid":
      case "success":
      case "settlement":
        return "bg-green-50 text-green-700 border-green-200";
      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      case "failed":
      case "cancel":
        return "bg-red-50 text-red-700 border-red-200";
      default:
        return "bg-tertiary/50 text-quaternary border-tertiary-dark/20";
    }
  };
  return (
    
    <div>
      <PageHeader title="Pesanan" description="Halaman untuk mengelola pesanan" />
      <div className="bg-[#FFFBF2] rounded-4xl shadow-sm border border-primary/5 overflow-hidden">
        <div className="p-6 border-b border-primary/5 flex gap-4 bg-tertiary/30">
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
                filteredOrders.map((order) => (
                  <tr
                    key={order.id}
                    className="hover:bg-tertiary/30 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                      #{order.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-bold text-primary">
                        {order.user.name}
                      </div>
                      <div className="text-xs text-quaternary">
                        {order.user.email}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-quaternary font-medium">
                      {new Date(order.created_at).toLocaleDateString("id-ID")}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                      Rp {Number(order.total_price).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-xl border ${getStatusColor(
                          order.payment?.status
                        )}`}
                      >
                        {order.payment?.status || "Pending"}
                      </span>
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
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 bg-primary/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-[#FFFBF2] rounded-4xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-scale-in border border-primary/10">
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
                    Status Pembayaran
                  </h3>
                  <div className="bg-white p-6 rounded-2xl border border-primary/5 shadow-sm">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-quaternary font-medium">
                        Status
                      </span>
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-xl border ${getStatusColor(
                          selectedOrder.payment?.status
                        )}`}
                      >
                        {selectedOrder.payment?.status || "Pending"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-quaternary font-medium">
                        Metode
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
                      {selectedOrder.productCheckouts.map((item, index) => (
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
                      ))}
                    </tbody>
                    <tfoot className="bg-tertiary/30">
                      <tr>
                        <td
                          colSpan={3}
                          className="px-5 py-4 text-sm font-bold text-primary text-right"
                        >
                          Total Amount
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
