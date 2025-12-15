import { eq } from "drizzle-orm";
import { drizzleDb as db } from "../../config/database";
import { payments, checkouts } from "../../db/schema";
import { snap, coreApi } from "../../config/midtrans";
import { getCheckoutById } from "../checkout/checkout.service";

export const createPayment = async (checkoutId: number) => {
  const checkout = await getCheckoutById(checkoutId);
  if (!checkout) throw new Error("Checkout not found");

  // Create Snap Transaction
  const parameter = {
    transaction_details: {
      order_id: `ORDER-${checkout.id}-${Date.now()}`,
      gross_amount: Number(checkout.total_price),
    },
    customer_details: {
      first_name: "Customer", // In real app, get from user
      email: "customer@example.com", // In real app, get from user
    },
  };

  const transaction = await snap.createTransaction(parameter);

  // Save initial payment record (pending)
  // We might not know method/provider yet until notification, so we can store defaults or update later
  // For now, we just return the token/url to frontend.
  // The actual payment record creation is better handled via webhook or after frontend confirmation if using Snap Popup.
  // However, the requirement says "Simpan transaction_id, amount, method, provider".
  // Snap API returns token and redirect_url. Method/Provider is known AFTER payment.
  // So we will create a pending payment record here with minimal info.

  await db.insert(payments).values({
    checkout_id: checkoutId,
    provider: "midtrans",
    method: "unknown",
    amount: checkout.total_price.toString(),
    status: "pending",
    transaction_id: transaction.token,
  });

  return { token: transaction.token, redirect_url: transaction.redirect_url };
};

export const handleNotification = async (notification: any) => {
  const statusResponse = await (coreApi as any).transaction.notification(
    notification
  );
  const orderId = statusResponse.order_id;
  const transactionStatus = statusResponse.transaction_status;
  const fraudStatus = statusResponse.fraud_status;

  console.log(
    `Transaction notification received. Order ID: ${orderId}. Transaction Status: ${transactionStatus}. Fraud Status: ${fraudStatus}`
  );

  const checkoutId = parseInt(orderId.split("-")[1]);

  let paymentStatus = "pending";
  if (transactionStatus == "capture") {
    if (fraudStatus == "challenge") {
      paymentStatus = "challenge";
    } else if (fraudStatus == "accept") {
      paymentStatus = "paid";
    }
  } else if (transactionStatus == "settlement") {
    paymentStatus = "paid";
  } else if (
    transactionStatus == "cancel" ||
    transactionStatus == "deny" ||
    transactionStatus == "expire"
  ) {
    paymentStatus = "failed";
  } else if (transactionStatus == "pending") {
    paymentStatus = "pending";
  }
  await db
    .update(payments)
    .set({
      status: paymentStatus,
      method: statusResponse.payment_type,
      paid_at: paymentStatus === "paid" ? new Date() : null,
    })
    .where(eq(payments.checkout_id, checkoutId));
  return { status: "ok" };
};
