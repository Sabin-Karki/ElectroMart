import { Express, Request, Response } from 'express';
import { createServer, type Server } from 'http';
import { storage } from "./storage";
import { setupAuth } from "./auth";
import Stripe from "stripe";
import { z } from "zod";
import { type Product, type User } from "./db/schema"; // Import Product and User types
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Set up Stripe with the secret key from environment variables
const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe with the key
const stripe = new Stripe(STRIPE_SECRET_KEY);

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// Default products to show if the database is empty
const defaultProducts: Product[] = [
  {
    id: -1, // Use negative IDs to distinguish from real DB entries
    sellerId: 0, // System seller
    name: "Sample Wireless Mouse",
    description: "High-precision wireless gaming mouse with RGB lighting and customizable buttons.",
    price: "29.99",
    imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60", // Unsplash Mouse
    category: "Accessories",
    stock: 50,
    rating: "4.5", 
    reviewCount: 150, 
    isActive: true, 
    createdAt: new Date()
  },
  {
    id: -2,
    sellerId: 0,
    name: "Sample Mechanical Keyboard",
    description: "RGB mechanical keyboard with customizable key switches for gaming and typing.",
    price: "79.99",
    imageUrl: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60", // Unsplash Keyboard
    category: "Accessories",
    stock: 30,
    rating: "4.7", 
    reviewCount: 210, 
    isActive: true, 
    createdAt: new Date()
  },
  {
    id: -3,
    sellerId: 0,
    name: "Sample Gaming Monitor",
    description: "Ultra-wide curved monitor with high refresh rate for immersive gaming.",
    price: "249.99",
    imageUrl: "https://images.unsplash.com/photo-1593640495253-23196b27a87f?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60", // Unsplash Monitor
    category: "Monitors",
    stock: 20,
    rating: "4.8", 
    reviewCount: 180, 
    isActive: true, 
    createdAt: new Date()
  },
  {
    id: -4,
    sellerId: 0,
    name: "Sample Wireless Headphones",
    description: "Premium wireless headphones with noise cancellation and long battery life.",
    price: "149.99",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60", // Unsplash Headphones
    category: "Audio",
    stock: 25,
    rating: "4.6", 
    reviewCount: 190, 
    isActive: true, 
    createdAt: new Date()
  }
];

// Helper to get user ID safely
const getUserId = (req: Request): number => {
  if (!req.user) throw new Error("User not found in request");
  return req.user.id;
};

// Check if user is authenticated
const isAuthenticated = (req: Request, res: Response, next: Function) => {
  if (req.isAuthenticated() && req.user) {
    return next();
  }
  res.status(401).json({ message: "Unauthorized - Please login" });
};

// Check if user is a seller
const isSeller = (req: Request, res: Response, next: Function) => {
  if (!req.isAuthenticated() || !req.user) {
    return res.status(401).json({ message: "Unauthorized - Please login" });
  }
  
  if (req.user.role === "seller") {
    return next();
  }
  res.status(403).json({ message: "Forbidden - Seller access required" });
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Sets up auth routes
  setupAuth(app);

  // Product routes
  app.get("/api/products", async (_req, res) => {
    try {
      let products = await storage.getProducts();
      // If no products found in DB, return the default list
      if (products.length === 0) {
        products = defaultProducts;
      }
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error); // Log the actual error
      res.status(500).json({ message: "Error fetching products" });
    }
  });

  app.get("/api/products/category/:category", async (req, res) => {
    try {
      const products = await storage.getProductsByCategory(req.params.category);
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Error fetching products by category" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Error fetching product" });
    }
  });

  // Seller routes
  app.get("/api/seller/products", isAuthenticated, isSeller, async (req, res) => {
    // Check added by middleware, but add explicit check for type safety
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    try {
      const products = await storage.getProductsBySeller(req.user.id);
      res.json(products);
    } catch (error) {
      console.error("Error fetching seller products:", error);
      res.status(500).json({ message: "Error fetching seller products" });
    }
  });

  app.post("/api/seller/products", isAuthenticated, isSeller, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    try {
      // Basic validation (consider Zod for production)
      const { name, description, price, category, stock, imageUrl } = req.body;
      if (!name || price == null || stock == null || !req.user.id) {
         return res.status(400).json({ message: "Missing required product fields (name, price, stock)" });
      }
      const productData = {
        name,
        description: description || null,
        price: String(price),
        category: category || null,
        stock: parseInt(stock) || 0,
        imageUrl: imageUrl || null,
        sellerId: req.user.id
      };
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      res.status(500).json({ message: "Error creating product" });
    }
  });

  app.put("/api/seller/products/:id", isAuthenticated, isSeller, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    try {
      const id = parseInt(req.params.id);
      // Basic validation (consider Zod)
      const { name, description, price, category, stock, imageUrl } = req.body;
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.sellerId !== req.user.id) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      // Prepare update data, only include fields that are provided
      const updateData: Partial<typeof product> = {};
      if (name !== undefined) updateData.name = name;
      if (description !== undefined) updateData.description = description;
      if (price !== undefined) updateData.price = String(price);
      if (category !== undefined) updateData.category = category;
      if (stock !== undefined) updateData.stock = parseInt(stock) || 0;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;

      if (Object.keys(updateData).length === 0) {
        return res.status(400).json({ message: "No update fields provided" });
      }

      const updatedProduct = await storage.updateProduct(id, updateData);
      res.json(updatedProduct);
    } catch (error) {
      console.error("Error updating product:", error);
      res.status(500).json({ message: "Error updating product" });
    }
  });

  app.delete("/api/seller/products/:id", isAuthenticated, isSeller, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      if (product.sellerId !== req.user.id) { 
        return res.status(403).json({ message: "Permission denied" });
      }
      
      await storage.deleteProduct(id); // This is soft delete
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Error deleting product" });
    }
  });

  // Cart routes
  app.get("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      const cartItems = await storage.getCartItems(userId);
      
      // Get full product details for each cart item
      const cartWithProducts = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return {
            id: item.id,
            productId: item.productId,
            quantity: item.quantity,
            product: product
          };
        })
      );
      
      res.json(cartWithProducts);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Error fetching cart" });
    }
  });

  app.post("/api/cart", isAuthenticated, async (req, res) => {
    try {
      const userId = getUserId(req);
      // Basic validation
      const { productId, quantity } = req.body;
      if (!productId || !quantity || quantity < 1) {
        return res.status(400).json({ message: "Missing or invalid productId/quantity"});
      }

      const cartItemData = {
        productId: parseInt(productId),
        quantity: parseInt(quantity),
        userId: userId 
      };
      
      // Check if product exists and has enough stock
      const product = await storage.getProduct(cartItemData.productId);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      if (product.stock < cartItemData.quantity) {
        return res.status(400).json({ message: "Not enough stock available" });
      }
      
      const cartItem = await storage.addToCart(cartItemData);
      
      // Get the product details to return with the cart item
      const cartItemWithProduct = {
        id: cartItem.id,
        productId: cartItem.productId,
        quantity: cartItem.quantity,
        product: product
      };
      
      res.status(201).json(cartItemWithProduct);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Error adding to cart" });
    }
  });

  app.put("/api/cart/:id", isAuthenticated, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    try {
      const id = parseInt(req.params.id);
      const { quantity } = req.body;
      const userId = getUserId(req);
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Quantity must be at least 1" });
      }
      
      // Get the cart item first to verify ownership
      const cartItems = await storage.getCartItems(userId);
      const cartItem = cartItems.find(item => item.id === id);
      
      if (!cartItem) {
        return res.status(404).json({ message: "Cart item not found" });
      }
      
      const updatedCartItem = await storage.updateCartItem(id, quantity);
      
      if (!updatedCartItem) {
        return res.status(404).json({ message: "Failed to update cart item" });
      }
      
      const product = await storage.getProduct(updatedCartItem.productId);
      
      const cartItemWithProduct = {
        id: updatedCartItem.id,
        productId: updatedCartItem.productId,
        quantity: updatedCartItem.quantity,
        product: product
      };
      
      res.json(cartItemWithProduct);
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Error updating cart item" });
    }
  });

  app.delete("/api/cart/:id", isAuthenticated, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    try {
      // TODO: Verify cart item belongs to req.user before deleting?
      // Current logic allows deleting any cart item by ID if logged in.
      const id = parseInt(req.params.id);
      await storage.removeFromCart(id);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error removing from cart" });
    }
  });

  app.delete("/api/cart", isAuthenticated, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    try {
      await storage.clearCart(getUserId(req));
      res.status(204).send();
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Error clearing cart" });
    }
  });

  // Order routes
  app.get("/api/orders", isAuthenticated, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    try {
      const orders = await storage.getOrdersByUser(getUserId(req));
      
      // Get order items for each order
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          const items = await storage.getOrderItems(order.id);
          return {
            ...order,
            items
          };
        })
      );
      
      res.json(ordersWithItems);
    } catch (error) {
      console.error("Error fetching orders:", error);
      res.status(500).json({ message: "Error fetching orders" });
    }
  });

  app.get("/api/orders/:id", isAuthenticated, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Order not found" });
      }
      if (order.userId !== getUserId(req)) {
        return res.status(403).json({ message: "Permission denied" });
      }
      
      const items = await storage.getOrderItems(order.id);
      res.json({ ...order, items });
    } catch (error) {
      console.error("Error fetching order:", error);
      res.status(500).json({ message: "Error fetching order" });
    }
  });

  // Stripe payment routes
  app.post("/api/create-payment-intent", isAuthenticated, async (req, res) => {
    if (!req.user) return res.status(401).json({ message: "User not found in request" });
    
    try {
      const { amount, orderId } = req.body;
      
      // Ensure amount is a valid number
      const numericAmount = parseFloat(amount);
      if (isNaN(numericAmount) || numericAmount <= 0) {
        return res.status(400).json({ message: "Invalid amount" });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(numericAmount * 100), // Convert to cents
        currency: "usd",
        metadata: {
          userId: getUserId(req).toString(),
          orderId: orderId ? orderId.toString() : undefined
        }
      });
      
      // If there's an order ID, update the order with the payment intent ID
      if (orderId) {
        await storage.updateOrder(parseInt(orderId), { 
          paymentIntent: paymentIntent.id 
        });
      }
      
      res.json({ clientSecret: paymentIntent.client_secret });
    } catch (error) {
       console.error("Error creating payment intent:", error);
      res.status(500).json({ 
        message: "Error creating payment intent", 
        error: error instanceof Error ? error.message : "Unknown error" 
      });
    }
  });

  // POST /api/checkout uses isAuthenticated
  app.post("/api/checkout", isAuthenticated, async (req, res) => {
    if (!req.user) { 
      return res.status(401).json({ message: "User not authenticated for checkout" });
    }
    // We know req.user exists now
    
    try {
      const { shippingAddress } = req.body;
      
      if (!shippingAddress) {
        return res.status(400).json({ message: "Shipping address is required" });
      }
      
      // Get cart items for the specific user 
      const userId = getUserId(req);
      const cartItems = await storage.getCartItems(userId); 
      
      if (cartItems.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }
      
      // Calculate total amount and prepare line items
      let totalAmount = 0;
      const lineItems = await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          if (!product) {
            throw new Error(`Product with ID ${item.productId} not found during checkout`);
          }
          if (product.stock < item.quantity) {
            throw new Error(`Not enough stock for ${product.name}`);
          }
          const itemTotal = parseFloat(product.price) * item.quantity;
          totalAmount += itemTotal;
          
          return {
            price_data: {
              currency: 'usd',
              product_data: {
                name: product.name,
                description: product.description || undefined,
                images: product.imageUrl ? [product.imageUrl] : undefined,
              },
              unit_amount: Math.round(parseFloat(product.price) * 100), 
            },
            quantity: item.quantity,
          };
        })
      );
        
      // Create order in DB
      const order = await storage.createOrder({
        userId: getUserId(req), // Use the checked userId
        totalAmount: totalAmount.toFixed(2), 
        shippingAddress,
        status: 'processing',
        orderDate: new Date()
      });
      
      // Create order items in DB
      await Promise.all(
        cartItems.map(async (item) => {
          const product = await storage.getProduct(item.productId);
          return storage.createOrderItem({
            orderId: order.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product!.price
          });
        })
      );
        
      // Clear cart for the specific user
      await storage.clearCart(userId); 
      
      res.status(201).json({ 
        message: "Order created successfully (payment not implemented)", 
        orderId: order.id, 
        totalAmount: order.totalAmount 
      });
      
    } catch (error) {
      console.error("Checkout error:", error);
      const message = error instanceof Error ? error.message : "Checkout failed";
      res.status(500).json({ message });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
