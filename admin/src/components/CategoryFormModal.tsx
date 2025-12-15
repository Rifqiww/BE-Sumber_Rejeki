import { useState, useEffect } from "react";
import { X, Tags, Loader2 } from "lucide-react";
import api from "../services/api";
import toast from "react-hot-toast";

interface Category {
  id: number;
  name: string;
}

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  editingCategory: Category | null;
}

export default function CategoryFormModal({
  isOpen,
  onClose,
  onSuccess,
  editingCategory,
}: CategoryFormModalProps) {
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingCategory) {
      setName(editingCategory.name);
    } else {
      setName("");
    }
  }, [editingCategory, isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name });
      } else {
        await api.post("/categories", { name });
      }
      onSuccess();
      toast.success(
        editingCategory
          ? "Kategori berhasil diperbarui"
          : "Kategori berhasil ditambahkan"
      );
    } catch (error) {
      console.error("Failed to save category", error);
      toast.error("Gagal menyimpan kategori");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-md flex items-center justify-center z-50 p-4 transition-all duration-300">
      <div className="bg-[#FFFBF2] w-full max-w-md shadow-2xl animate-scale-in border border-white/20 ring-1 ring-primary/5 rounded-2xl">
        <div className="flex justify-between items-center p-8 border-b border-primary/5 sticky top-0 bg-[#FFFBF2]/95 backdrop-blur-sm z-10 rounded-2xl">
          <div>
            <h2 className="text-2xl font-bold text-primary tracking-tight">
              {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
            </h2>
            <p className="text-sm text-quaternary font-medium mt-1">
              Kelola nama kategori produk
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-quaternary hover:text-primary hover:bg-tertiary p-2.5 rounded-full transition-all duration-300 hover:rotate-90"
          >
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-8">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-primary/70 uppercase tracking-wider ml-1">
              Nama Kategori
            </label>
            <div className="relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Tags className="h-5 w-5 text-quaternary group-focus-within:text-secondary transition-colors duration-300" />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-4 py-4 bg-white border border-primary/5 rounded-2xl focus:ring-4 focus:ring-secondary/10 focus:border-secondary outline-none transition-all duration-300 text-primary placeholder-quaternary/30 font-bold shadow-sm group-hover:shadow-md"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                placeholder="Contoh: Makanan"
                autoFocus
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-primary/5">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-4 text-quaternary hover:bg-tertiary/50 rounded-2xl font-bold transition-all duration-300 text-sm"
            >
              Batal
            </button>
            <button
              type="submit"
              className="px-8 py-4 bg-primary text-secondary rounded-2xl font-bold hover:bg-primary-dark shadow-xl shadow-primary/20 hover:-translate-y-1 hover:shadow-2xl hover:shadow-primary/30 active:translate-y-0 transition-all duration-300 text-sm flex items-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="animate-spin" size={18} />
                  Menyimpan...
                </>
              ) : (
                <>Simpan Kategori</>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
