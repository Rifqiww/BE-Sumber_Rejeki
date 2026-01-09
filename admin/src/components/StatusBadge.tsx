// Alternative: Visual Status Badge Component
// This is a read-only badge component for displaying order status

import { CheckCircle, Clock, Loader, XCircle } from "lucide-react";

interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  size?: "sm" | "md" | "lg";
}

export function StatusBadge({
  status,
  showIcon = true,
  size = "md",
}: StatusBadgeProps) {
  const getStatusConfig = (status: string) => {
    // Normalize status to handle case sensitivity
    const normalizedStatus = status?.toLowerCase();

    switch (true) {
      // ORDER STATUSES
      case normalizedStatus === "belum dibayar":
        return {
          label: "Belum Dibayar",
          icon: Clock,
          bg: "bg-[#F4BD62]/40",
          text: "text-primary",
          border: "border-primary",
          iconColor: "text-primary",
        };
      case normalizedStatus === "sedang dikirim":
        return {
          label: "Sedang dikirim",
          icon: Loader,
          bg: "bg-[#3E2723]",
          text: "text-secondary",
          border: "border-secondary",
          iconColor: "text-secondary",
        };
      case normalizedStatus === "dikirim": // Keeping mostly for compatibility if old data exists
        return {
          label: "Sedang dikirim",
          icon: Loader,
          bg: "bg-blue-100",
          text: "text-blue-800",
          border: "border-blue-200",
          iconColor: "text-blue-800",
        };
      case normalizedStatus === "berhasil":
        return {
          label: "Berhasil",
          icon: CheckCircle,
          bg: "bg-[#7D9E3B]/50",
          text: "text-[#587224]",
          border: "border-[#587224]",
          iconColor: "text-[#587224]",
        };
      case normalizedStatus === "dibatalkan":
        return {
          label: "Dibatalkan",
          icon: XCircle,
          bg: "bg-[#FFCCBC]",
          text: "text-[#D84315]",
          border: "border-[#FFAB91]",
          iconColor: "text-[#D84315]",
        };

      // PAYMENT STATUSES (MIDTRANS)
      case normalizedStatus === "settlement":
      case normalizedStatus === "capture":
        return {
          label: "Lunas",
          icon: CheckCircle,
          bg: "bg-green-100",
          text: "text-green-800",
          border: "border-green-200",
          iconColor: "text-green-600",
        };
      case normalizedStatus === "pending":
        return {
          label: "Menunggu Pembayaran",
          icon: Clock,
          bg: "bg-yellow-100",
          text: "text-yellow-800",
          border: "border-yellow-200",
          iconColor: "text-yellow-600",
        };
      case normalizedStatus === "deny":
      case normalizedStatus === "cancel":
      case normalizedStatus === "expire":
      case normalizedStatus === "failure":
        return {
          label: "Gagal / Kadaluarsa",
          icon: XCircle,
          bg: "bg-red-100",
          text: "text-red-800",
          border: "border-red-200",
          iconColor: "text-red-600",
        };

      default:
        return {
          label: status,
          icon: Clock,
          bg: "bg-gray-50",
          text: "text-gray-700",
          border: "border-gray-200",
          iconColor: "text-gray-500",
        };
    }
  };

  const config = getStatusConfig(status);
  const Icon = config.icon;

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  const iconSizes = {
    sm: 14,
    md: 16,
    lg: 18,
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-bold rounded-xl border ${sizeClasses[size]} ${config.bg} ${config.text} ${config.border}`}
    >
      {showIcon && <Icon size={iconSizes[size]} className={config.iconColor} />}
      {config.label}
    </span>
  );
}

// ===== USAGE EXAMPLE =====

/*
// Simple usage
<StatusBadge status="Belum dibayar" />

// Without icon
<StatusBadge status="Diproses" showIcon={false} />

// Large size with icon
<StatusBadge status="Berhasil" size="lg" />

// In table cell
<td className="px-6 py-4 whitespace-nowrap">
  <StatusBadge status={order.status} />
</td>

// In card
<div className="flex items-center justify-between">
  <span className="text-sm text-gray-600">Status</span>
  <StatusBadge status={order.status} size="sm" />
</div>
*/
