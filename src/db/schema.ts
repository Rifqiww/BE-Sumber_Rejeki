import {
  mysqlTable,
  bigint,
  varchar,
  int,
  text,
  timestamp,
  decimal,
  mysqlEnum,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";

// 1. User Table
export const users = mysqlTable("user", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  password: varchar("password", { length: 255 }).notNull(),
  role: mysqlEnum("role", ["admin", "user"]).default("user").notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  addresses: many(addresses),
  likes: many(userLikes),
  reviews: many(reviews),
  checkouts: many(checkouts),
}));

// 2. Address Table
export const addresses = mysqlTable("address", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  address: varchar("address", { length: 255 }).notNull(),
  zip_code: int("zip_code").notNull(),
  user_id: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
});

export const addressesRelations = relations(addresses, ({ one, many }) => ({
  user: one(users, {
    fields: [addresses.user_id],
    references: [users.id],
  }),
  checkouts: many(checkouts),
}));

// 3. Category Table
export const categories = mysqlTable("category", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
});

export const categoriesRelations = relations(categories, ({ many }) => ({
  products: many(products),
}));

// 4. Product Table
export const products = mysqlTable("product", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  name: varchar("name", { length: 255 }).notNull(),
  slug: varchar("slug", { length: 255 }).notNull().unique(),
  description: text("description"),
  price: int("price").notNull(),
  stock: int("stock").notNull(), // Changed from enum to int as requested
  category_id: bigint("category_id", { mode: "number" })
    .notNull()
    .references(() => categories.id),
});

export const productsRelations = relations(products, ({ one, many }) => ({
  category: one(categories, {
    fields: [products.category_id],
    references: [categories.id],
  }),
  images: many(productsImages),
  likes: many(userLikes),
  reviews: many(reviews),
  productCheckouts: many(productCheckout),
}));

// 5. Product Images Table
export const productsImages = mysqlTable("products_images", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  product_id: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id),
  image_url: varchar("image_url", { length: 255 }).notNull(),
  alt_image: varchar("alt_image", { length: 255 }),
});

export const productsImagesRelations = relations(productsImages, ({ one }) => ({
  product: one(products, {
    fields: [productsImages.product_id],
    references: [products.id],
  }),
}));

// 6. User Likes Table
export const userLikes = mysqlTable("user_likes", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  user_id: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  product_id: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id),
});

export const userLikesRelations = relations(userLikes, ({ one }) => ({
  user: one(users, {
    fields: [userLikes.user_id],
    references: [users.id],
  }),
  product: one(products, {
    fields: [userLikes.product_id],
    references: [products.id],
  }),
}));

// 7. Reviews Table
export const reviews = mysqlTable("reviews", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  product_id: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id),
  user_id: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  review: varchar("review", { length: 255 }),
  created_at: timestamp("created_at").defaultNow(),
});

export const reviewsRelations = relations(reviews, ({ one }) => ({
  product: one(products, {
    fields: [reviews.product_id],
    references: [products.id],
  }),
  user: one(users, {
    fields: [reviews.user_id],
    references: [users.id],
  }),
}));

// 8. Checkouts Table
export const checkouts = mysqlTable("checkouts", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  address_id: bigint("address_id", { mode: "number" })
    .notNull()
    .references(() => addresses.id),
  user_id: bigint("user_id", { mode: "number" })
    .notNull()
    .references(() => users.id),
  total_price: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  created_at: timestamp("created_at").defaultNow(),
  status: varchar("status", { length: 155 }).notNull().default("Belum dibayar"),
});

export const checkoutsRelations = relations(checkouts, ({ one, many }) => ({
  address: one(addresses, {
    fields: [checkouts.address_id],
    references: [addresses.id],
  }),
  user: one(users, {
    fields: [checkouts.user_id],
    references: [users.id],
  }),
  productCheckouts: many(productCheckout),
  payment: one(payments), // 1-to-1 relationship with payment usually, or 1-to-many if retries allowed. Assuming 1-to-1 for simplicity or latest.
}));

// 9. Product Checkout Table (Pivot)
export const productCheckout = mysqlTable("product_checkout", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  product_id: bigint("product_id", { mode: "number" })
    .notNull()
    .references(() => products.id),
  checkouts_id: bigint("checkouts_id", { mode: "number" })
    .notNull()
    .references(() => checkouts.id),
  quantity: int("quantity").notNull(),
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
});

export const productCheckoutRelations = relations(
  productCheckout,
  ({ one }) => ({
    product: one(products, {
      fields: [productCheckout.product_id],
      references: [products.id],
    }),
    checkout: one(checkouts, {
      fields: [productCheckout.checkouts_id],
      references: [checkouts.id],
    }),
  })
);

// 10. Payments Table
export const payments = mysqlTable("payments", {
  id: bigint("id", { mode: "number" }).primaryKey().autoincrement(),
  checkout_id: bigint("checkout_id", { mode: "number" })
    .notNull()
    .references(() => checkouts.id),
  provider: varchar("provider", { length: 50 }).notNull(),
  method: varchar("method", { length: 50 }).notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  transaction_id: varchar("transaction_id", { length: 100 }).notNull(),
  paid_at: timestamp("paid_at"),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  checkout: one(checkouts, {
    fields: [payments.checkout_id],
    references: [checkouts.id],
  }),
}));
