import { createContext, useState, useContext, useEffect, useCallback, useRef } from "react";
import { useAuth } from "./auth";
import { apiRequest } from "./api";

// Create the cart context
const CartContext = createContext();

// Hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pendingRequests = useRef(new Set());
  
  // Calculate cart total with proper number handling
  const cartTotal = cart.reduce((total, item) => {
    const price = Number(item.product?.price || 0);
    const quantity = Number(item.quantity || 0);
    return total + (Number.isFinite(price * quantity) ? price * quantity : 0);
  }, 0);
  
  // Cancel pending requests when unmounting
  useEffect(() => {
    return () => {
      pendingRequests.current.clear();
    };
  }, []);
  
  // Fetch cart items when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCart([]);
      setError(null);
    }
  }, [user]);
  
  // Fetch cart items from the server
  const fetchCart = useCallback(async () => {
    if (!user) return;
    
    const requestId = Symbol();
    pendingRequests.current.add(requestId);
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest("GET", "/api/cart");
      const cartItems = await response.json();
      
      // Only update state if this is the most recent request
      if (pendingRequests.current.has(requestId)) {
        setCart(cartItems.map(item => ({
          ...item,
          quantity: Number(item.quantity),
          product: item.product ? {
            ...item.product,
            price: Number(item.product.price)
          } : null
        })));
      }
    } catch (err) {
      // Only update error if this is the most recent request
      if (pendingRequests.current.has(requestId)) {
        setError(err.message || "Failed to fetch cart items");
        console.error("Error fetching cart:", err);
      }
    } finally {
      if (pendingRequests.current.has(requestId)) {
        setLoading(false);
        pendingRequests.current.delete(requestId);
      }
    }
  }, [user]);
  
  // Add item to cart with debouncing
  const addToCart = useCallback(async (product, quantity = 1) => {
    if (!user) {
      setError("You must be logged in to add items to your cart");
      return;
    }
    
    const requestId = Symbol();
    pendingRequests.current.add(requestId);
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity: Number(quantity)
      });
      
      if (!response.ok) {
        throw new Error('Failed to add item to cart');
      }
      
      const newItem = await response.json();
      
      // Only update state if this is the most recent request
      if (pendingRequests.current.has(requestId)) {
        setCart(prevCart => {
          const existingItemIndex = prevCart.findIndex(item => item.productId === product.id);
          
          if (existingItemIndex >= 0) {
            // Update existing item
            const updatedCart = [...prevCart];
            updatedCart[existingItemIndex] = {
              ...newItem,
              quantity: Number(newItem.quantity),
              product: product // Use the original product data
            };
            return updatedCart;
          } else {
            // Add new item
            return [...prevCart, {
              ...newItem,
              quantity: Number(newItem.quantity),
              product: product // Use the original product data
            }];
          }
        });
      }
    } catch (err) {
      if (pendingRequests.current.has(requestId)) {
        setError(err.message || "Failed to add item to cart");
        console.error("Error adding to cart:", err);
      }
    } finally {
      if (pendingRequests.current.has(requestId)) {
        setLoading(false);
        pendingRequests.current.delete(requestId);
      }
    }
  }, [user]);
  
  // Update cart item quantity with debouncing
  const updateCartItemQuantity = useCallback(async (itemId, quantity) => {
    if (!user) return;
    
    const requestId = Symbol();
    pendingRequests.current.add(requestId);
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest("PUT", `/api/cart/${itemId}`, {
        quantity: Number(quantity)
      });
      
      const updatedItem = await response.json();
      
      if (pendingRequests.current.has(requestId)) {
        setCart(prevCart => 
          prevCart.map(item => 
            item.id === itemId ? {
              ...updatedItem,
              quantity: Number(updatedItem.quantity),
              product: updatedItem.product ? {
                ...updatedItem.product,
                price: Number(updatedItem.product.price)
              } : null
            } : item
          )
        );
      }
    } catch (err) {
      if (pendingRequests.current.has(requestId)) {
        setError(err.message || "Failed to update cart item");
        console.error("Error updating cart item:", err);
      }
    } finally {
      if (pendingRequests.current.has(requestId)) {
        setLoading(false);
        pendingRequests.current.delete(requestId);
      }
    }
  }, [user]);
  
  // Remove item from cart
  const removeFromCart = useCallback(async (itemId) => {
    if (!user) return;
    
    const requestId = Symbol();
    pendingRequests.current.add(requestId);
    
    try {
      setLoading(true);
      setError(null);
      
      await apiRequest("DELETE", `/api/cart/${itemId}`);
      
      if (pendingRequests.current.has(requestId)) {
        setCart(prevCart => prevCart.filter(item => item.id !== itemId));
      }
    } catch (err) {
      if (pendingRequests.current.has(requestId)) {
        setError(err.message || "Failed to remove item from cart");
        console.error("Error removing from cart:", err);
      }
    } finally {
      if (pendingRequests.current.has(requestId)) {
        setLoading(false);
        pendingRequests.current.delete(requestId);
      }
    }
  }, [user]);
  
  // Clear the entire cart
  const clearCart = useCallback(async () => {
    if (!user) return;
    
    const requestId = Symbol();
    pendingRequests.current.add(requestId);
    
    try {
      setLoading(true);
      setError(null);
      
      await apiRequest("DELETE", "/api/cart");
      
      if (pendingRequests.current.has(requestId)) {
        setCart([]);
      }
    } catch (err) {
      if (pendingRequests.current.has(requestId)) {
        setError(err.message || "Failed to clear cart");
        console.error("Error clearing cart:", err);
      }
    } finally {
      if (pendingRequests.current.has(requestId)) {
        setLoading(false);
        pendingRequests.current.delete(requestId);
      }
    }
  }, [user]);
  
  // Context value
  const value = {
    cart,
    loading,
    error,
    cartTotal,
    addToCart,
    updateCartItemQuantity,
    removeFromCart,
    clearCart,
    refreshCart: fetchCart
  };
  
  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};
