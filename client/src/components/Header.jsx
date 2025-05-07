import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "../utils/auth.jsx";
import { useCart } from "../utils/cart.jsx";
import CartDropdown from "./CartDropdown";

const Header = () => {
  const { user, logout } = useAuth();
  const { cart } = useCart();
  const [location, navigate] = useLocation();
  
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.cart-dropdown') && !event.target.closest('.cart-button')) {
        setIsCartOpen(false);
      }
      
      if (!event.target.closest('.user-menu') && !event.target.closest('.user-button')) {
        setIsUserMenuOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Calculate cart total items
  const cartItemCount = cart.reduce((total, item) => total + item.quantity, 0);
  
  const handleLogout = () => {
    logout();
    navigate("/");
  };
  
  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-primary text-2xl font-heading font-bold">
              Electro<span className="text-secondary">Mart</span>
            </span>
          </Link>
          
          {/* Search Bar */}
          <div className="hidden md:flex flex-1 mx-10">
            <div className="w-full max-w-xl relative">
              <input 
                type="text" 
                className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" 
                placeholder="Search for products..."
              />
              <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                <i className="fas fa-search"></i>
              </button>
            </div>
          </div>
          
          {/* Nav Links & Actions */}
          <div className="flex items-center space-x-6">
            {/* Not logged in */}
            {!user && (
              <div className="flex items-center space-x-4">
                <Link href="/auth" className="font-medium text-gray-600 hover:text-primary">
                  Login
                </Link>
                <Link href="/auth" className="bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition">
                  Register
                </Link>
              </div>
            )}
            
            {/* Logged in */}
            {user && (
              <div className="relative user-menu">
                <button 
                  className="flex items-center space-x-2 focus:outline-none user-button"
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                >
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <span className="text-gray-700 font-medium text-sm">
                      {/* Use username if fullName is not available */}
                      {user.username ? user.username.charAt(0).toUpperCase() : '?'} 
                    </span>
                  </div>
                  <span className="text-gray-700 font-medium">{user.fullName}</span>
                  <i className="fas fa-chevron-down text-xs text-gray-500"></i>
                </button>
                
                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                    {user.role === "buyer" && (
                      <Link href="/buyer/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        My Orders
                      </Link>
                    )}
                    
                    {user.role === "seller" && (
                      <Link href="/seller/dashboard" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Seller Dashboard
                      </Link>
                    )}
                    
                    <div className="border-t border-gray-100"></div>
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
            
            {/* Cart Icon */}
            <div className="relative cart-dropdown">
              <button 
                className="relative focus:outline-none cart-button"
                onClick={() => setIsCartOpen(!isCartOpen)}
              >
                <i className="fas fa-shopping-cart text-xl text-gray-700 hover:text-primary"></i>
                {cartItemCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-secondary text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {cartItemCount}
                  </span>
                )}
              </button>
              
              {/* Cart Dropdown */}
              {isCartOpen && <CartDropdown cart={cart} />}
            </div>
          </div>
        </div>
        
        {/* Mobile Search */}
        <div className="md:hidden mt-3">
          <div className="relative">
            <input 
              type="text" 
              className="w-full border border-gray-300 rounded-lg py-2 px-4 focus:outline-none focus:ring-2 focus:ring-primary" 
              placeholder="Search for products..."
            />
            <button className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
              <i className="fas fa-search"></i>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
