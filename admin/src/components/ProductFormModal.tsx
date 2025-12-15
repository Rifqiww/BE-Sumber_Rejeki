import { useState, useEffect } from "react";
import {
  X,
  Package,
  Filter,
  ChevronDown,
  Check,
  Loader2,
  Image as ImageIcon,
  Trash2,
} from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
}

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

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingProduct: Product | null;
  categories: Category[];
}

export default function ProductFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingProduct,
  categories,
}: ProductFormModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: "",
    stock: "",
    category_id: "",
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isCategoryDropdownOpen, setIsCategoryDropdownOpen] = useState(false);

  useEffect(() => {
    if (editingProduct) {
      setFormData({
        name: editingProduct.name,
        description: editingProduct.description || "",
        price: editingProduct.price.toString(),
        stock: editingProduct.stock.toString(),
        category_id: editingProduct.category_id.toString(),
      });
    } else {
      setFormData({
        name: "",
        description: "",
        price: "",
        stock: "",
        category_id: "",
      });
    }
    setImageFile(null);
  }, [editingProduct, isOpen]);

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

      toast.success(
        editingProduct
          ? "Produk berhasil diperbarui"
          : "Produk berhasil ditambahkan"
      );
      onSuccess();
    } catch (error) {
      console.error("Failed to save product", error);
      toast.error("Gagal menyimpan produk");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getImageUrl = (url: string) => {
    if (url.startsWith("http")) return url;
    return `http://localhost:3000${url}`;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 transition-all duration-300">
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
            onClick={onClose}
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
                      formData.category_id ? "text-primary" : "text-quaternary"
                    }
                  >
                    {formData.category_id
                      ? categories.find(
                          (c) =>
                            c.id.toString() === formData.category_id.toString()
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
                            formData.category_id.toString() === c.id.toString()
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
                  <ImageIcon size={32} className="text-secondary opacity-80" />
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
                      : getImageUrl(editingProduct?.images?.[0].image_url || "")
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
              onClick={onClose}
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
  );
}
