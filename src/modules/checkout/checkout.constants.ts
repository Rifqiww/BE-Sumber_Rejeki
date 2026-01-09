// Checkout Status Constants
export const CHECKOUT_STATUS = {
  BELUM_DIBAYAR: "Belum dibayar",
  DIPROSES: "Diproses",
  BERHASIL: "Berhasil",
  DIBATALKAN: "Dibatalkan",
} as const;

// Type for TypeScript
export type CheckoutStatus =
  (typeof CHECKOUT_STATUS)[keyof typeof CHECKOUT_STATUS];

// Array of valid statuses (for validation)
export const VALID_CHECKOUT_STATUSES = Object.values(
  CHECKOUT_STATUS
) as readonly string[];
