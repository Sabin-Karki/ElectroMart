import { pgTable, serial, text, varchar, integer, boolean, timestamp, decimal, foreignKey, jsonb } from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel, type InferInsertModel } from 'drizzle-orm';

// Users Table
export const users = pgTable('users', {
  id: serial('id').primaryKey(),
  username: varchar('username', { length: 255 }).unique().notNull(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  hashedPassword: text('hashed_password').notNull(),
  role: varchar('role', { length: 50 }).default('customer').notNull(), // 'customer' or 'seller'
  isActive: boolean('is_active').default(true).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export inferred types for User
export type User = InferSelectModel<typeof users>;
export type InsertUser = InferInsertModel<typeof users>;

export const usersRelations = relations(users, ({ one, many }) => ({
  products: many(products), // Seller relationship
  orders: many(orders),
  cartItems: many(cartItems),
}));

// Products Table
export const products = pgTable('products', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  description: text('description'),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  category: varchar('category', { length: 100 }),
  stock: integer('stock').default(0).notNull(),
  imageUrl: text('image_url'),
  sellerId: integer('seller_id').notNull().references(() => users.id), // Foreign key to users table
  rating: decimal('rating', { precision: 3, scale: 2 }).default('0').notNull(),
  reviewCount: integer('review_count').default(0).notNull(),
  isActive: boolean('is_active').default(true).notNull(), // For soft deletes
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export inferred types for Product
export type Product = InferSelectModel<typeof products>;
export type InsertProduct = InferInsertModel<typeof products>;

export const productsRelations = relations(products, ({ one, many }) => ({
  seller: one(users, {
    fields: [products.sellerId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
  cartItems: many(cartItems),
}));

// Orders Table
export const orders = pgTable('orders', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  orderDate: timestamp('order_date').defaultNow().notNull(),
  status: varchar('status', { length: 50 }).default('pending').notNull(), // e.g., pending, processing, shipped, delivered, cancelled
  totalAmount: decimal('total_amount', { precision: 10, scale: 2 }).notNull(),
  shippingAddress: text('shipping_address'), // Consider normalizing address later
  paymentIntent: varchar('payment_intent', { length: 255 }), // Stripe Payment Intent ID
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export inferred types for Order
export type Order = InferSelectModel<typeof orders>;
export type InsertOrder = InferInsertModel<typeof orders>;

export const ordersRelations = relations(orders, ({ one, many }) => ({
  user: one(users, {
    fields: [orders.userId],
    references: [users.id],
  }),
  orderItems: many(orderItems),
}));

// OrderItems Table (Junction table for Orders and Products)
export const orderItems = pgTable('order_items', {
  id: serial('id').primaryKey(),
  orderId: integer('order_id').notNull().references(() => orders.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  price: decimal('price', { precision: 10, scale: 2 }).notNull(), // Price at the time of order
});

// Export inferred types for OrderItem
export type OrderItem = InferSelectModel<typeof orderItems>;
export type InsertOrderItem = InferInsertModel<typeof orderItems>;

export const orderItemsRelations = relations(orderItems, ({ one }) => ({
  order: one(orders, {
    fields: [orderItems.orderId],
    references: [orders.id],
  }),
  product: one(products, {
    fields: [orderItems.productId],
    references: [products.id],
  }),
}));

// CartItems Table
export const cartItems = pgTable('cart_items', {
  id: serial('id').primaryKey(),
  userId: integer('user_id').notNull().references(() => users.id),
  productId: integer('product_id').notNull().references(() => products.id),
  quantity: integer('quantity').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Export inferred types for CartItem
export type CartItem = InferSelectModel<typeof cartItems>;
export type InsertCartItem = InferInsertModel<typeof cartItems>;

export const cartItemsRelations = relations(cartItems, ({ one }) => ({
  user: one(users, {
    fields: [cartItems.userId],
    references: [users.id],
  }),
  product: one(products, {
    fields: [cartItems.productId],
    references: [products.id],
  }),
}));

// User Sessions Table (for connect-pg-simple)
// Based on the standard table structure for connect-pg-simple
export const userSessions = pgTable('user_sessions', {
  sid: varchar('sid').primaryKey(), // Session ID
  sess: jsonb('sess').notNull(),        // Session data (use jsonb)
  expire: timestamp('expire', { precision: 6, withTimezone: false }).notNull(), // Expiry timestamp
}); 