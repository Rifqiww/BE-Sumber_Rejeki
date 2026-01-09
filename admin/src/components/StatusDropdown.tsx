// Example: Status Dropdown Component for Orders
// Add this to your Orders.tsx to update order status

import { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import api from "../services/api";
import { ChevronDown } from "lucide-react";

// Status Constants (matching backend)
const ORDER_STATUS = {
  BELUM_DIBAYAR: "Belum dibayar",
  SEDANG_DIKIRIM: "Sedang dikirim",
  BERHASIL: "Berhasil",
  DIBATALKAN: "Dibatalkan",
} as const;

const STATUS_OPTIONS = [
  {
    value: ORDER_STATUS.BELUM_DIBAYAR,
    label: "Belum Dibayar",
    color: "yellow",
  },
  {
    value: ORDER_STATUS.SEDANG_DIKIRIM,
    label: "Sedang dikirim",
    color: "blue",
  },
  { value: ORDER_STATUS.BERHASIL, label: "Berhasil", color: "green" },
  { value: ORDER_STATUS.DIBATALKAN, label: "Dibatalkan", color: "red" },
];

interface StatusDropdownProps {
  orderId: number;
  currentStatus: string;
  onStatusUpdate: () => void;
}

export function StatusDropdown({
  orderId,
  currentStatus,
  onStatusUpdate,
}: StatusDropdownProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState<{
    top?: number;
    left: number;
    bottom?: number;
  }>({ left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Check if click is possibly inside the portal
      const target = event.target as HTMLElement;
      // We need a way to detect if click is inside portal content which is attached to body
      // Simplest way is strict "outside dropdownRef"
      // check, BUT that fails because portal is outside.
      // So we close if click is NOT in dropdownRef AND NOT in the portal.
      // However, detecting "in portal" is tricky without ref to portal content.
      // Easier hack: Just rely on mousedown. If user clicks button, it toggles. If user clicks outside button...

      // Let's refine: Close only if we click outside the trigger button AND outside the menu?

      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(target) &&
        (!menuRef.current || !menuRef.current.contains(target))
      ) {
        setIsOpen(false);
      }
    };

    // Close on scroll to avoid floating drift
    const updatePos = () => setIsOpen(false);

    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", updatePos);
    window.addEventListener("resize", updatePos);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", updatePos);
      window.removeEventListener("resize", updatePos);
    };
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === currentStatus) {
      setIsOpen(false);
      return;
    }

    setIsUpdating(true);
    try {
      await api.patch(`/checkouts/${orderId}/status`, {
        status: newStatus,
      });
      onStatusUpdate(); // Refresh orders list
      setIsOpen(false);
    } catch (error: any) {
      console.error("Failed to update status:", error);
      // Fallback for dummy data testing (server returns 404)
      if (error.response && error.response.status === 404) {
        console.warn("Simulating status update for dummy data");
        // We can't update the parent list easily without prop changes,
        // but we can at least stop the error alert and maybe trigger a reload if using dummy data?
        // Actually, Orders.tsx re-reads dummy data which resets it.
        // Best effort: alert user or just swallow error for demo.
        alert(
          "Simulasi: Status akan berubah (Data Dummy tidak tersimpan di server)"
        );
        onStatusUpdate();
      } else {
        alert("Gagal mengubah status!");
      }
      setIsOpen(false);
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case ORDER_STATUS.BELUM_DIBAYAR:
        return "bg-[#F4BD62]/40 text-primary border-primary";
      case ORDER_STATUS.SEDANG_DIKIRIM:
        return "bg-[#3E2723] text-secondary border-secondary";
      case ORDER_STATUS.BERHASIL:
        return "bg-[#7D9E3B]/50 text-[#587224] border-[#587224]";
      case ORDER_STATUS.DIBATALKAN:
        return "bg-[#FFCCBC] text-[#D84315] border-[#FFAB91]";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const getLabel = (status: string) => {
    return STATUS_OPTIONS.find((opt) => opt.value === status)?.label || status;
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={(e) => {
          if (!isUpdating) {
            const rect = e.currentTarget.getBoundingClientRect();
            const spaceBelow = window.innerHeight - rect.bottom;
            // Estimated menu height is ~200px. If space < 220, flip up.
            const showAbove = spaceBelow < 220;

            if (showAbove) {
              setDropdownPosition({
                bottom: window.innerHeight - rect.top + 5,
                left: rect.left,
              });
            } else {
              setDropdownPosition({
                top: rect.bottom + 5,
                left: rect.left,
              });
            }
            setIsOpen(!isOpen);
          }
        }}
        disabled={isUpdating}
        className={`flex items-center gap-2 px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${getStatusColor(
          currentStatus
        )} ${isUpdating ? "opacity-50 cursor-wait" : "hover:opacity-90"}`}
      >
        <span>{getLabel(currentStatus)}</span>
        <ChevronDown
          size={14}
          className={`transition-transform duration-200 ${
            isOpen ? "rotate-180" : ""
          }`}
        />
      </button>

      {isOpen &&
        createPortal(
          <div
            ref={menuRef}
            className="fixed z-9999 min-w-48 bg-white rounded-xl shadow-xl border border-primary/10 overflow-hidden animate-in fade-in zoom-in-95 duration-100"
            style={{
              top: dropdownPosition.top,
              left: dropdownPosition.left,
              bottom: dropdownPosition.bottom,
            }}
          >
            <div className="py-1">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleStatusChange(option.value)}
                  className={`w-full text-left px-4 py-2.5 text-sm transition-colors hover:bg-gray-50 flex items-center gap-2
                    ${
                      currentStatus === option.value
                        ? "bg-primary/5 font-bold text-primary"
                        : "text-quaternary font-medium"
                    }
                  `}
                >
                  <div
                    className={`w-2 h-2 rounded-full ${
                      option.color === "yellow"
                        ? "bg-[#F4BD62]"
                        : option.color === "blue"
                        ? "bg-[#3E2723]"
                        : option.color === "green"
                        ? "bg-[#7D9E3B]"
                        : "bg-[#D84315]"
                    }`}
                  />
                  {option.label}
                </button>
              ))}
            </div>
          </div>,
          document.body
        )}
    </div>
  );
}
