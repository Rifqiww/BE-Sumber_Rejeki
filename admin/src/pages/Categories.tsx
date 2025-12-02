import { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Pencil, Trash2, X, Search, Tags, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";

interface Category {
  id: number;
  name: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [name, setName] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await api.get("/categories");
      setCategories(response.data.data);
    } catch (error) {
      console.error("Failed to fetch categories", error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredCategories = categories.filter((category) =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, { name });
      } else {
        await api.post("/categories", { name });
      }
      fetchCategories();
      closeModal();
      toast.success(
        editingCategory
          ? "Kategori berhasil diperbarui"
          : "Kategori berhasil ditambahkan"
      );
    } catch (error) {
      console.error("Failed to save category", error);
      toast.error("Gagal menyimpan kategori");
    }
  };

  const handleDeleteClick = (id: number) => {
    setCategoryToDelete(id);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!categoryToDelete) return;

    setIsDeleting(true);
    try {
      await api.delete(`/categories/${categoryToDelete}`);
      fetchCategories();
      toast.success("Kategori berhasil dihapus");
    } catch (error) {
      console.error("Failed to delete category", error);
      toast.error("Gagal menghapus kategori");
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
      setCategoryToDelete(null);
    }
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
    } else {
      setEditingCategory(null);
      setName("");
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
    setName("");
  };

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-end items-start md:items-center mb-8 gap-4">
        <button
          onClick={() => openModal()}
          className="bg-primary text-secondary px-6 py-3 rounded-2xl flex items-center gap-2 hover:bg-primary-dark shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all font-bold"
        >
          <Plus size={20} />
          Tambah Kategori
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
              placeholder="Cari kategori..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent focus:border-secondary rounded-2xl focus:ring-0 text-primary placeholder-quaternary/50 font-medium transition-all shadow-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="overflow-x-auto scrollbar-hide">
          <table className="min-w-full divide-y divide-primary/5">
            <thead className="bg-tertiary/50">
              <tr>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider w-20">
                  ID
                </th>
                <th className="px-6 py-5 text-left text-xs font-bold text-quaternary uppercase tracking-wider">
                  Nama
                </th>
                <th className="px-6 py-5 text-right text-xs font-bold text-quaternary uppercase tracking-wider w-32">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {isLoading ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-quaternary font-medium"
                  >
                    Memuat kategori...
                  </td>
                </tr>
              ) : filteredCategories.length === 0 ? (
                <tr>
                  <td
                    colSpan={3}
                    className="px-6 py-12 text-center text-quaternary font-medium"
                  >
                    Tidak ada kategori ditemukan.
                  </td>
                </tr>
              ) : (
                filteredCategories.map((category) => (
                  <tr
                    key={category.id}
                    className="hover:bg-tertiary/30 transition-colors group"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-quaternary font-bold">
                      #{category.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary">
                      {category.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => openModal(category)}
                          className="p-2.5 text-primary hover:bg-secondary/20 rounded-xl transition-colors"
                          title="Edit"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(category.id)}
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
          <div className="bg-[#FFFBF2] rounded-[2.5rem] w-full max-w-md shadow-2xl animate-scale-in border border-white/20 ring-1 ring-primary/5">
            <div className="flex justify-between items-center p-8 border-b border-primary/5 sticky top-0 bg-[#FFFBF2]/95 backdrop-blur-sm z-10">
              <div>
                <h2 className="text-2xl font-bold text-primary tracking-tight">
                  {editingCategory ? "Edit Kategori" : "Tambah Kategori"}
                </h2>
                <p className="text-sm text-quaternary font-medium mt-1">
                  Kelola nama kategori produk
                </p>
              </div>
              <button
                onClick={closeModal}
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
                  onClick={closeModal}
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
      )}

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Kategori"
        message="Apakah Anda yakin ingin menghapus kategori ini? Tindakan ini tidak dapat dibatalkan."
        isDeleting={isDeleting}
      />
    </div>
  );
}
