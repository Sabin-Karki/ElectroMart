import {
  // Import table definitions for use in queries
  users, 
  products, 
  orders, 
  orderItems, 
  cartItems,
  // Import *types* for type checking
  type User, 
  type InsertUser, 
  type Product, 
  type InsertProduct,
  type Order,
  type InsertOrder,
  type OrderItem,
  type InsertOrderItem,
  type CartItem,
  type InsertCartItem
} from './db/schema'; // Correct relative path
import { db, sessionPool } from './db'; // Correct relative path
import { eq, and, ilike } from 'drizzle-orm'; // Import Drizzle helpers
import session, { Store } from "express-session"; // Import Store type
import connectPgSimple from 'connect-pg-simple'; // Import PG session store

const PgSessionStore = connectPgSimple(session);

// Interface for storage operations
export interface IStorage {
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Product operations
  getProduct(id: number): Promise<Product | undefined>;
  getProducts(): Promise<Product[]>;
  getProductsByCategory(category: string): Promise<Product[]>;
  getProductsBySeller(sellerId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<Omit<Product, 'id'>>): Promise<Product | undefined>;
  deleteProduct(id: number): Promise<boolean>;
  
  // Order operations
  getOrder(id: number): Promise<Order | undefined>;
  getOrdersByUser(userId: number): Promise<Order[]>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  updateOrder(id: number, orderData: Partial<Omit<Order, 'id'>>): Promise<Order | undefined>;
  
  // Order item operations
  getOrderItems(orderId: number): Promise<OrderItem[]>;
  createOrderItem(orderItem: InsertOrderItem): Promise<OrderItem>;
  
  // Cart operations
  getCartItems(userId: number): Promise<CartItem[]>;
  addToCart(cartItem: InsertCartItem): Promise<CartItem>;
  updateCartItem(id: number, quantity: number): Promise<CartItem | undefined>;
  removeFromCart(id: number): Promise<boolean>;
  clearCart(userId: number): Promise<boolean>;
  
  // Session store
  sessionStore: Store; // Use Store type
}

// PostgreSQL implementation of storage using Drizzle
export class DbStorage implements IStorage {
  sessionStore: Store; // Use Store type

  constructor() {
    this.sessionStore = new PgSessionStore({
      pool: sessionPool, // Use the exported pool
      tableName: 'user_sessions', // Standard table name for sessions
    });
    
    // Note: Seeding is now handled by database migrations or separate scripts
  }

  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(ilike(users.username, username)).limit(1); 
    return result[0];
  }
  
  async getUserByEmail(email: string): Promise<User | undefined> {
    // Use ilike for email as well, often desired
    const result = await db.select().from(users).where(ilike(users.email, email)).limit(1);
    return result[0];
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  // Product operations
  async getProduct(id: number): Promise<Product | undefined> {
    const result = await db.select().from(products)
      .where(and(eq(products.id, id), eq(products.isActive, true)))
      .limit(1);
    return result[0];
  }

  async getProducts(): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.isActive, true));
  }

  async getProductsByCategory(category: string): Promise<Product[]> {
    return await db.select().from(products)
      .where(and(eq(products.category, category), eq(products.isActive, true)));
  }

  async getProductsBySeller(sellerId: number): Promise<Product[]> {
    // isActive check might not be needed here if sellers see inactive products
    return await db.select().from(products).where(eq(products.sellerId, sellerId)); 
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const result = await db.insert(products).values(insertProduct).returning();
    return result[0];
  }

  async updateProduct(id: number, productUpdate: Partial<Omit<Product, 'id'>>): Promise<Product | undefined> {
    // Ensure seller owns the product before updating (handled in routes.ts already)
    const result = await db.update(products)
      .set(productUpdate)
      .where(eq(products.id, id))
      .returning();
    return result[0];
  }

  async deleteProduct(id: number): Promise<boolean> {
    // Soft delete: Set isActive to false
    const result = await db.update(products)
      .set({ isActive: false })
      .where(eq(products.id, id))
      .returning({ id: products.id });
    return result.length > 0;
  }

  // Order operations
  async getOrder(id: number): Promise<Order | undefined> {
    const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
    return result[0];
  }

  async getOrdersByUser(userId: number): Promise<Order[]> {
    return await db.select().from(orders).where(eq(orders.userId, userId));
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const result = await db.insert(orders).values(insertOrder).returning();
    return result[0];
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set({ status })
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  async updateOrder(id: number, orderData: Partial<Omit<Order, 'id'>>): Promise<Order | undefined> {
    const result = await db.update(orders)
      .set(orderData)
      .where(eq(orders.id, id))
      .returning();
    return result[0];
  }

  // Order item operations
  async getOrderItems(orderId: number): Promise<OrderItem[]> {
    return await db.select().from(orderItems).where(eq(orderItems.orderId, orderId));
  }

  async createOrderItem(insertOrderItem: InsertOrderItem): Promise<OrderItem> {
    const result = await db.insert(orderItems).values(insertOrderItem).returning();
    return result[0];
  }

  // Cart operations
  async getCartItems(userId: number): Promise<CartItem[]> {
    return await db.select().from(cartItems).where(eq(cartItems.userId, userId));
  }

  async addToCart(insertCartItem: InsertCartItem): Promise<CartItem> {
    // Check if item already exists for this user and product
    const existingItem = await db.select().from(cartItems)
      .where(and(eq(cartItems.userId, insertCartItem.userId), eq(cartItems.productId, insertCartItem.productId)))
      .limit(1);
      
    if (existingItem[0]) {
      // Update quantity if exists
      const updatedQuantity = existingItem[0].quantity + insertCartItem.quantity;
      const result = await db.update(cartItems)
        .set({ quantity: updatedQuantity })
        .where(eq(cartItems.id, existingItem[0].id))
        .returning();
      return result[0];
    } else {
      // Insert new item if not exists
      const result = await db.insert(cartItems).values(insertCartItem).returning();
      return result[0];
    }
  }

  async updateCartItem(id: number, quantity: number): Promise<CartItem | undefined> {
    // Ensure quantity is valid (usually > 0)
    if (quantity < 1) { 
       // Or handle deletion if quantity is 0, depending on desired logic 
       await this.removeFromCart(id);
       return undefined;
    }
    const result = await db.update(cartItems)
      .set({ quantity })
      .where(eq(cartItems.id, id))
      .returning();
    return result[0];
  }

  async removeFromCart(id: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.id, id)).returning({id: cartItems.id});
    return result.length > 0;
  }

  async clearCart(userId: number): Promise<boolean> {
    const result = await db.delete(cartItems).where(eq(cartItems.userId, userId)).returning({id: cartItems.id});
    return result.length > 0; // Returns true if any items were deleted
  }
}

// Export an instance (can be used similarly to the old MemStorage instance)
export const storage = new DbStorage();
