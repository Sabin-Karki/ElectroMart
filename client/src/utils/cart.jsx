import { createContext, useState, useContext, useEffect } from "react";
import { useAuth } from "./auth";
import { apiRequest } from "./api";

// Create the cart context
const CartContext = createContext();

// Hook to use the cart context
export const useCart = () => {
  return useContext(CartContext);
};

// Cart provider component
export const CartProvider = ({ children }) => {
  const { user } = useAuth();
  const [cart, setCart] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // Calculate cart total
  const cartTotal = cart.reduce((total, item) => {
    // Ensure price is parsed as a float before multiplication
    const price = parseFloat(item.product?.price || '0');
    const quantity = item.quantity || 0;
    return total + (price * quantity);
  }, 0);
  
  // Fetch cart items when user logs in
  useEffect(() => {
    if (user) {
      fetchCart();
    } else {
      // Clear cart when user logs out
      setCart([]);
    }
  }, [user]);
  
  // Fetch cart items from the server
  const fetchCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest("GET", "/api/cart");
      const cartItems = await response.json();
      
      setCart(cartItems);
    } catch (err) {
      setError(err.message || "Failed to fetch cart items");
      console.error("Error fetching cart:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Add item to cart
  const addToCart = async (product, quantity = 1) => {
    if (!user) {
      setError("You must be logged in to add items to your cart");
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest("POST", "/api/cart", {
        productId: product.id,
        quantity
      });
      
      const newItem = await response.json();
      
      // Check if the item is already in the cart
      const existingItemIndex = cart.findIndex(item => item.productId === product.id);
      
      if (existingItemIndex >= 0) {
        // Update existing item
        const updatedCart = [...cart];
        updatedCart[existingItemIndex] = newItem;
        setCart(updatedCart);
      } else {
        // Add new item
        setCart(prevCart => [...prevCart, newItem]);
      }
    } catch (err) {
      setError(err.message || "Failed to add item to cart");
      console.error("Error adding to cart:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Update cart item quantity
  const updateCartItemQuantity = async (itemId, quantity) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      const response = await apiRequest("PUT", `/api/cart/${itemId}`, { quantity });
      const updatedItem = await response.json();
      
      setCart(prevCart => 
        prevCart.map(item => 
          item.id === itemId ? updatedItem : item
        )
      );
    } catch (err) {
      setError(err.message || "Failed to update cart item");
      console.error("Error updating cart item:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Remove item from cart
  const removeFromCart = async (itemId) => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await apiRequest("DELETE", `/api/cart/${itemId}`);
      
      setCart(prevCart => prevCart.filter(item => item.id !== itemId));
    } catch (err) {
      setError(err.message || "Failed to remove item from cart");
      console.error("Error removing from cart:", err);
    } finally {
      setLoading(false);
    }
  };
  
  // Clear the entire cart
  const clearCart = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError(null);
      
      await apiRequest("DELETE", "/api/cart");
      
      setCart([]);
    } catch (err) {
      setError(err.message || "Failed to clear cart");
      console.error("Error clearing cart:", err);
    } finally {
      setLoading(false);
    }
  };
  
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
