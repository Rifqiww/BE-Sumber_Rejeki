import { useEffect, useState, useMemo, useCallback } from "react";
import api from "../services/api";
import {
  Plus,
  Pencil,
  Trash2,
  X,
  Image as ImageIcon,
  Search,
  Filter,
  ChevronDown,
  Loader2,
  Package,
  Check,
} from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [isLoading, setIsLoading] = useState(true);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);

  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"name-asc" | "stock-desc" | "price-asc">(
    "name-asc"
  );
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Debounce search query
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const MAX_INT = 2000000000;
    if (Number(formData.price) > MAX_INT || Number(formData.stock) > MAX_INT) {
      toast.error(
        "Nilai harga atau stok terlalu besar (maksimal 2.000.000.000)"
      );
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        ...formData,
        price: Number(formData.price),
        stock: Number(formData.stock),
        category_id: Number(formData.category_id),
      };

      let productId;

      if (editingProduct) {
        await api.put(`/products/${editingProduct.id}`, payload);
        productId = editingProduct.id;
      } else {
        const response = await api.post("/products", payload);
        productId = response.data.data.id;
      }

      if (imageFile && productId) {
        const imageFormData = new FormData();
        imageFormData.append("image", imageFile);
        await api.post(`/products/${productId}/images`, imageFormData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
      }

      fetchData();
      closeModal();
      toast.success(
        editingProduct
          ? "Produk berhasil diperbarui"
          : "Produk berhasil ditambahkan"
      );
    } catch (error) {
      console.error("Failed to save product", error);
      toast.error("Gagal menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  };

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
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description || "",
        price: product.price.toString(),
        stock: product.stock.toString(),
        category_id: product.category_id.toString(),
      });
    } else {
      setEditingProduct(null);
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
      });
    }
    setImageFile(null);
    setIsModalOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setImageFile(null);
  }, []);

  const getImageUrl = useCallback((url: string) => {
    if (url.startsWith("http")) return url;
    return `http://localhost:3000${url}`;
  }, []);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-end items-center pb-8 pt-2">
        <button
          onClick={() => openModal()}
          className="bg-primary text-secondary px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-primary-dark shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all font-bold cursor-pointer"
        >
          <Plus size={20} />
          Tambah Produk
        </button>
      </div>

      <div className="bg-[#FFFBF2] rounded-4xl shadow-sm border border-primary/5 overflow-hidden">
        <div className="p-6 border-b border-primary/5 flex gap-4 bg-tertiary/30">
          <div className="relative flex-1 max-w-md">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-quaternary"
              size={20}
            />
            <input
              type="text"
              placeholder="Cari produk..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent focus:border-secondary rounded-2xl focus:ring-0 text-primary placeholder-quaternary/50 font-medium transition-all shadow-sm"
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
                filteredProducts.map((product) => (
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
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-primary/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
          <div className="bg-[#FFFBF2] rounded-[2.5rem] w-full max-w-lg max-h-[90vh] overflow-y-auto scrollbar-hide shadow-2xl animate-scale-in border border-white/20 ring-1 ring-primary/5">
            <div className="flex justify-between items-center p-8 border-b border-primary/5 sticky top-0 bg-[#FFFBF2]/95 backdrop-blur-sm z-10">
              <div>
                <h2 className="text-2xl font-bold text-primary tracking-tight">
                  {editingProduct ? "Edit Produk" : "Tambah Produk"}
                </h2>
                <p className="text-sm text-quaternary font-medium mt-1">
                  Lengkapi detail produk di bawah ini
                </p>
              </div>
              <button
                onClick={closeModal}
                className="text-quaternary hover:text-primary hover:bg-tertiary p-2.5 rounded-full transition-all duration-300 hover:rotate-90 cursor-pointer"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-6">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">
                  Nama Produk
                </label>
                <div className="relative group">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Package className="h-5 w-5 text-quaternary group-focus-within:text-secondary transition-colors duration-300" />
                  </div>
                  <input
                    type="text"
                    className="w-full pl-12 pr-4 py-4 bg-white border border-primary/5 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all duration-300 text-primary placeholder-quaternary/30 font-bold shadow-sm group-hover:shadow-md"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    required
                    placeholder="Contoh: Nasi Kuning"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">
                  Kategori
                </label>
                <div className="relative group">
                  <div
                    className="relative group"
                    onClick={() =>
                      setIsCategoryDropdownOpen(!isCategoryDropdownOpen)
                    }
                  >
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center cursor-pointer">
                      <Filter className="h-5 w-5 text-quaternary group-hover:text-secondary transition-colors duration-300" />
                    </div>
                    <button
                      type="button"
                      className={`w-full pl-12 pr-10 py-4 bg-white border rounded-2xl outline-none transition-all duration-300 text-left font-bold shadow-sm group-hover:shadow-md flex items-center justify-between ${
                        isCategoryDropdownOpen
                          ? "border-secondary ring-4 ring-secondary/10"
                          : "border-primary/5"
                      }`}
                    >
                      <span
                        className={
                          formData.category_id
                            ? "text-primary"
                            : "text-quaternary"
                        }
                      >
                        {formData.category_id
                          ? categories.find(
                              (c) =>
                                c.id.toString() ===
                                formData.category_id.toString()
                            )?.name
                          : "Pilih Kategori"}
                      </span>
                      <ChevronDown
                        className={`h-5 w-5 text-quaternary transition-transform duration-300 ${
                          isCategoryDropdownOpen
                            ? "rotate-180 text-secondary"
                            : "group-hover:text-primary"
                        }`}
                      />
                    </button>

                    {isCategoryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-xl border border-primary/5 z-50 overflow-hidden animate-scale-in max-h-60 overflow-y-auto scrollbar-hide">
                        <div className="p-2 space-y-1">
                          {categories.map((c) => (
                            <button
                              key={c.id}
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  category_id: c.id.toString(),
                                });
                                setIsCategoryDropdownOpen(false);
                              }}
                              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-bold transition-all flex items-center justify-between cursor-pointer ${
                                formData.category_id.toString() ===
                                c.id.toString()
                                  ? "bg-secondary/10 text-primary"
                                  : "text-quaternary hover:bg-tertiary/30 hover:text-primary"
                              }`}
                            >
                              {c.name}
                              {formData.category_id.toString() ===
                                c.id.toString() && (
                                <Check size={16} className="text-secondary" />
                              )}
                            </button>
                          ))}
                          {categories.length === 0 && (
                            <div className="px-4 py-3 text-sm text-quaternary text-center">
                              Tidak ada kategori
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">
                    Harga (Rp)
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <span className="text-quaternary font-bold group-focus-within:text-secondary transition-colors duration-300">
                        Rp
                      </span>
                    </div>
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-primary/5 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all duration-300 text-primary font-bold shadow-sm group-hover:shadow-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={formData.price}
                      onChange={(e) =>
                        setFormData({ ...formData, price: e.target.value })
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">
                    Stok
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <div className="h-5 w-5 flex items-center justify-center text-quaternary group-focus-within:text-secondary transition-colors duration-300">
                        #
                      </div>
                    </div>
                    <input
                      type="number"
                      className="w-full pl-12 pr-4 py-4 bg-white border border-primary/5 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all duration-300 text-primary font-bold shadow-sm group-hover:shadow-md [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                      value={formData.stock}
                      onChange={(e) =>
                        setFormData({ ...formData, stock: e.target.value })
                      }
                      onWheel={(e) => e.currentTarget.blur()}
                      onKeyDown={(e) => {
                        if (e.key === "ArrowUp" || e.key === "ArrowDown") {
                          e.preventDefault();
                        }
                      }}
                      required
                      min="0"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">
                  Deskripsi
                </label>
                <div className="relative group">
                  <textarea
                    className="w-full px-5 py-4 bg-white border border-primary/5 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all duration-300 resize-none text-primary placeholder-quaternary/30 font-medium shadow-sm group-hover:shadow-md min-h-[120px]"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData({ ...formData, description: e.target.value })
                    }
                    rows={3}
                    placeholder="Ceritakan tentang keunggulan produk ini..."
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">
                  Gambar Produk
                </label>
                <div className="border-2 border-dashed border-primary/10 rounded-3xl p-8 text-center hover:bg-white hover:border-secondary/50 transition-all duration-300 cursor-pointer relative group bg-tertiary/20">
                  <input
                    type="file"
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    onChange={(e) =>
                      setImageFile(e.target.files ? e.target.files[0] : null)
                    }
                    accept="image/*"
                  />
                  <div className="flex flex-col items-center justify-center text-quaternary group-hover:text-primary transition-colors duration-300 transform group-hover:scale-105">
                    <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-sm mb-4 group-hover:shadow-md transition-all">
                      <ImageIcon
                        size={32}
                        className="text-secondary opacity-80"
                      />
                    </div>
                    <p className="text-sm font-bold">
                      Klik atau seret gambar ke sini
                    </p>
                    <p className="text-xs opacity-60 mt-1 font-medium">
                      Mendukung PNG, JPG (Maks. 5MB)
                    </p>
                  </div>
                </div>

                {(imageFile ||
                  (editingProduct &&
                    editingProduct.images &&
                    editingProduct.images.length > 0)) && (
                  <div className="mt-4 p-3 bg-white rounded-2xl flex items-center gap-4 border border-primary/5 shadow-sm animate-fade-in">
                    <img
                      src={
                        imageFile
                          ? URL.createObjectURL(imageFile)
                          : getImageUrl(
                              editingProduct?.images?.[0].image_url || ""
                            )
                      }
                      alt="Preview"
                      className="h-16 w-16 object-cover rounded-xl border border-primary/10 shadow-sm"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-primary truncate">
                        {imageFile ? imageFile.name : "Gambar Saat Ini"}
                      </p>
                      <p className="text-xs text-green-600 font-bold mt-0.5 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                        Siap diunggah
                      </p>
                    </div>
                    {imageFile && (
                      <button
                        type="button"
                        onClick={() => setImageFile(null)}
                        className="p-2 hover:bg-red-50 text-red-400 hover:text-red-500 rounded-xl transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    )}
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-6 border-t border-primary/5">
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-6 py-4 text-quaternary hover:bg-tertiary/50 rounded-2xl font-bold transition-all duration-300 text-sm"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-8 py-4 bg-primary text-secondary rounded-2xl font-bold hover:bg-primary-dark shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 active:translate-y-0 transition-all duration-300 text-sm flex items-center gap-2 cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="animate-spin" size={18} />
                      Menyimpan...
                    </>
                  ) : (
                    <>Simpan Produk</>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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
