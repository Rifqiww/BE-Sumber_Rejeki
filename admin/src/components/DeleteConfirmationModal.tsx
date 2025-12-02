import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteConfirmationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  isDeleting?: boolean;
}

export default function DeleteConfirmationModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  isDeleting = false,
}: DeleteConfirmationModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-primary/40 backdrop-blur-md flex items-center justify-center z-60 p-4 transition-all duration-300">
      <div className="bg-[#FFFBF2] rounded-4xl w-full max-w-md shadow-2xl animate-scale-in border border-white/20 ring-1 ring-primary/5 p-8 text-center">
        <div className="w-20 h-20 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
          <AlertTriangle size={40} className="text-red-500" />
        </div>

        <h3 className="text-2xl font-bold text-primary mb-2">{title}</h3>
        <p className="text-quaternary font-medium mb-8 leading-relaxed">
          {message}
        </p>

        <div className="flex gap-3 justify-center">
          <button
            onClick={onClose}
            className="px-6 py-3 text-quaternary hover:bg-tertiary/50 rounded-xl font-bold transition-all duration-300 min-w-[100px]"
            disabled={isDeleting}
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-6 py-3 bg-red-500 text-white rounded-xl font-bold hover:bg-red-600 shadow-lg shadow-red-500/20 hover:-translate-y-1 hover:shadow-xl hover:shadow-red-500/30 active:translate-y-0 transition-all duration-300 min-w-[100px] flex items-center justify-center gap-2"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                <span>Menghapus...</span>
              </>
            ) : (
              "Hapus"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
