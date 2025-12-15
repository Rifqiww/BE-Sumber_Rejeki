import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  Search,
  Filter,
  ChevronDown,
} from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import ProductFormModal from "../components/ProductFormModal";
import PageHeader from "../components/PageHeader";

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  stock: number;
  category_id: number;
  category?: { name: string };
  images?: { image_url: string }[];
}

interface Category {
  id: number;
  name: string;
}

export default function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name-asc" | "stock-desc" | "price-asc">(
    "name-asc"
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Mengdebounce search query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 300);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [productsRes, categoriesRes] = await Promise.all([
        api.get("/products"),
        api.get("/categories"),
      ]);
      setProducts(productsRes.data.data);
      setCategories(categoriesRes.data.data);
    } catch (error) {
      console.error("Failed to fetch data", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProducts = useMemo(() => {
    return products
      .filter(
        (product) =>
          product.name
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase()) ||
          product.description
            .toLowerCase()
            .includes(debouncedSearchQuery.toLowerCase())
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "name-asc":
            return a.name.localeCompare(b.name);
          case "stock-desc":
            return b.stock - a.stock;
          case "price-asc":
            return a.price - b.price;
          default:
            return 0;
        }
      });
  }, [products, debouncedSearchQuery, sortBy]);

  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 5;

  const totalPages = Math.ceil(filteredProducts.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedProducts = filteredProducts.slice(
    startIndex,
    startIndex + ITEMS_PER_PAGE
  );

  // Reset page kalau filter berubah
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchQuery, sortBy]);

  const handleDeleteClick = useCallback((id: number) => {
    setProductToDelete(id);
    setDeleteModalOpen(true);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!productToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/products/${productToDelete}`);
      fetchData();
      toast.success("Produk berhasil dihapus");
    } catch (error) {
      console.error("Failed to delete product", error);
      toast.error("Gagal menghapus produk");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setProductToDelete(null);
    }
  }, [productToDelete]);

  const openModal = useCallback((product?: Product) => {
    setEditingProduct(product || null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
  }, []);

  const getImageUrl = useCallback((url: string) => {
    if (url.startsWith("http")) return url;
    return `http://localhost:3000${url}`;
  }, []);

  return (
    <div>
      <PageHeader title="Produk" description="Halaman untuk mengelola produk" />
      <div className="flex justify-end"></div>

      <div className="bg-[#FFFBF2] rounded-4xl shadow-sm border border-primary/5 overflow-hidden">
        <div className="p-6 border-b border-primary/5 flex justify-between gap-4 bg-tertiary/30">
        <div className="flex gap-5 items-center min-w-2xl">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-quaternary"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent focus:border-secondary rounded-2xl focus:ring-0 text-primary placeholder-quaternary/50 font-medium transition-all shadow-sm focus:outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="relative">
            <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className="flex items-center gap-2 px-5 py-3 bg-white border-2 border-transparent hover:border-secondary/50 rounded-2xl text-primary font-bold transition-all shadow-sm cursor-pointer min-w-[180px] justify-between group"
            >
              <div className="flex items-center gap-2">
                <Filter
                  size={18}
                  className="text-quaternary group-hover:text-secondary transition-colors"
                />
                <span className="text-sm">
                  {sortBy === "name-asc" && "Nama (A-Z)"}
                  {sortBy === "stock-desc" && "Stok Terbanyak"}
                  {sortBy === "price-asc" && "Harga Terendah"}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-quaternary transition-transform duration-300 ${
                  isFilterOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isFilterOpen && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-primary/5 z-20 overflow-hidden animate-scale-in">
                <div className="p-2 space-y-1">
                  <button
                    onClick={() => {
                      setSortBy("name-asc");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      sortBy === "name-asc"
                        ? "bg-secondary/20 text-primary"
                        : "text-quaternary hover:bg-tertiary/30 hover:text-primary"
                    }`}
                  >
                    Nama (A-Z)
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("stock-desc");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      sortBy === "stock-desc"
                        ? "bg-secondary/20 text-primary"
                        : "text-quaternary hover:bg-tertiary/30 hover:text-primary"
                    }`}
                  >
                    Stok Terbanyak
                  </button>
                  <button
                    onClick={() => {
                      setSortBy("price-asc");
                      setIsFilterOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold transition-colors ${
                      sortBy === "price-asc"
                        ? "bg-secondary/20 text-primary"
                        : "text-quaternary hover:bg-tertiary/30 hover:text-primary"
                    }`}
                  >
                    Harga Terendah
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
          <button
            onClick={() => openModal()}
            className="bg-primary text-secondary px-6 py-3 rounded-2xl flex items-center justify-end gap-2 hover:bg-primary-dark shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all font-bold cursor-pointer"
          >
            <Plus size={20} />
            Tambah Produk
          </button>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-primary/5">
            <thead className="bg-tertiary/50">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  Produk
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  Kategori
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  Harga
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  Stok
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
                    colSpan={5}
                    className="px-6 py-12 text-center text-quaternary font-medium"
                  >
                    Memuat produk...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-quaternary font-medium"
                  >
                    Tidak ada produk ditemukan.
                  </td>
                </tr>
              ) : (
                paginatedProducts.map((product) => (
                  <tr
                    key={product.id}
                    className="hover:bg-tertiary/30 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-16 w-16 shrink-0">
                          {product.images && product.images.length > 0 ? (
                            <img
                              src={getImageUrl(product.images[0].image_url)}
                              alt={product.name}
                              loading="lazy"
                              className="h-16 w-16 rounded-2xl object-cover border border-primary/10 shadow-sm group-hover:scale-105 transition-transform"
                            />
                          ) : (
                            <div className="h-16 w-16 bg-tertiary rounded-2xl flex items-center justify-center text-quaternary">
                              <ImageIcon size={24} />
                            </div>
                          )}
                        </div>
                        <div className="ml-5">
                          <div className="text-sm font-bold text-primary">
                            {product.name}
                          </div>
                          <div className="text-sm text-quaternary truncate max-w-xs mt-0.5">
                            {product.description}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1.5 inline-flex text-xs leading-5 font-bold rounded-xl bg-secondary/10 text-primary border border-secondary/20">
                        {product.category?.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-primary font-bold">
                      Rp {product.price.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-sm font-bold px-3 py-1 rounded-lg ${
                          product.stock < 10
                            ? "bg-red-50 text-red-600"
                            : "bg-green-50 text-green-700"
                        }`}
                      >
                        {product.stock} unit
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(product)}
                          className="p-2.5 text-primary hover:bg-secondary/20 rounded-xl transition-colors cursor-pointer"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(product.id)}
                          className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
                          title="Hapus"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredProducts.length > 0 && (
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

      <ProductFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={() => {
          closeModal();
          fetchData();
        }}
        editingProduct={editingProduct}
        categories={categories}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Produk"
        message="Apakah Anda yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan."
        isDeleting={isDeleting}
      />
    </div>
  );
}
