import { useEffect, useState } from "react";
import api from "../services/api";
import { Plus, Pencil, Trash2, Search } from "lucide-react";
import toast from "react-hot-toast";
import DeleteConfirmationModal from "../components/DeleteConfirmationModal";
import PageHeader from "../components/PageHeader";
import CategoryFormModal from "../components/CategoryFormModal";

interface Category {
  id: number;
  name: string;
}

export default function Categories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
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
    category.name.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleDeleteClick = async (id: number) => {
    const loadingToast = toast.loading("Memeriksa ketergantungan kategori...");
    try {
      // Check if category is used by any product
      const response = await api.get("/products");
      const products = response.data.data;

      const isUsed = products.some(
        (product: any) => product.category_id === id,
      );

      toast.dismiss(loadingToast);

      if (isUsed) {
        toast.error(
          "Kategori tidak dapat dihapus karena sedang digunakan oleh produk.",
        );
        return;
      }

      setCategoryToDelete(id);
      setDeleteModalOpen(true);
    } catch (error) {
      console.error("Failed to check category usage", error);
      toast.dismiss(loadingToast);
      toast.error("Gagal memeriksa status kategori");
    }
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
    } else {
      setEditingCategory(null);
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div>
      <PageHeader
        title="Kategori"
        description="Halaman untuk mengelola kategori"
      />

      <div className="bg-[#FFFBF2] rounded-4xl shadow-sm border border-primary/5 overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center p-6 gap-4">
          <div className="border-b border-primary/5 flex flex-col md:flex-row gap-4 bg-tertiary/30 w-full md:w-auto">
            <div className="relative flex-1 max-w-full md:max-w-md">
              <Search
                className="absolute left-4 top-1/2 -translate-y-1/2 text-quaternary"
                size={20}
              />
              <input
                type="text"
                placeholder="Cari kategori..."
                className="w-full pl-12 pr-4 py-3 bg-white border-2 border-transparent focus:border-secondary rounded-2xl focus:ring-0 text-primary placeholder-quaternary/50 font-medium transition-all shadow-sm focus:outline-none"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          <button
            onClick={() => openModal()}
            className="bg-primary text-secondary px-6 py-3 rounded-2xl flex items-center justify-center gap-2 hover:bg-primary-dark shadow-lg shadow-primary/20 hover:-translate-y-1 transition-all font-bold cursor-pointer"
          >
            <Plus size={20} />
            Tambah Kategori
          </button>
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

      <CategoryFormModal
        isOpen={isModalOpen}
        onClose={closeModal}
        onSuccess={() => {
          fetchCategories();
          closeModal();
        }}
        editingCategory={editingCategory}
      />

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
