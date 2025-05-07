import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../utils/auth";
import { useToast } from "@/hooks/use-toast";

const Auth = () => {
  const [activeTab, setActiveTab] = useState("login");
  const [formData, setFormData] = useState({
    login: { username: "", password: "" },
    register: { username: "", email: "", password: "", confirmPassword: "", fullName: "", role: "buyer" }
  });
  
  const { user, login, register } = useAuth();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);
  
  const handleInputChange = (form, field, value) => {
    setFormData(prev => ({
      ...prev,
      [form]: {
        ...prev[form],
        [field]: value
      }
    }));
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    const { username, password } = formData.login;
    
    try {
      const user = await login(username, password);
      toast({
        title: "Login Successful",
        description: "Welcome back to ElectroMart!",
      });
      
      // Redirect based on role
      if (user.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/buyer/dashboard");
      }
    } catch (error) {
      toast({
        title: "Login Failed",
        description: error.message || "Invalid username or password",
        variant: "destructive",
      });
    }
  };
  
  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    const { username, email, password, confirmPassword, fullName, role } = formData.register;
    
    if (password !== confirmPassword) {
      toast({
        title: "Registration Failed",
        description: "Passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const user = await register(username, email, password, fullName, role);
      toast({
        title: "Registration Successful",
        description: "Welcome to ElectroMart!",
      });
      
      // Redirect based on role
      if (user.role === "seller") {
        navigate("/seller/dashboard");
      } else {
        navigate("/buyer/dashboard");
      }
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: error.message || "An error occurred during registration",
        variant: "destructive",
      });
    }
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container mx-auto px-4">
        <div className="bg-white rounded-xl shadow-md overflow-hidden max-w-5xl mx-auto">
          <div className="flex flex-col md:flex-row">
            {/* Left: Auth Form */}
            <div className="md:w-1/2 p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-heading font-bold text-gray-900 mb-2">
                  {activeTab === "login" ? "Welcome Back" : "Create Account"}
                </h2>
                <p className="text-gray-600">
                  {activeTab === "login" 
                    ? "Sign in to access your ElectroMart account" 
                    : "Join ElectroMart to start shopping or selling"
                  }
                </p>
              </div>
              
              {/* Tabs */}
              <div className="flex border-b border-gray-200 mb-6">
                <button 
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTab === "login" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("login")}
                >
                  Login
                </button>
                <button 
                  className={`py-2 px-4 font-medium text-sm ${
                    activeTab === "register" 
                      ? "text-primary border-b-2 border-primary" 
                      : "text-gray-500 hover:text-gray-700"
                  }`}
                  onClick={() => setActiveTab("register")}
                >
                  Register
                </button>
              </div>
              
              {/* Login Form */}
              {activeTab === "login" && (
                <form onSubmit={handleLoginSubmit}>
                  <div className="mb-4">
                    <label htmlFor="loginUsername" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input 
                      type="text" 
                      id="loginUsername" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={formData.login.username}
                      onChange={(e) => handleInputChange("login", "username", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="loginPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input 
                      type="password" 
                      id="loginPassword" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={formData.login.password}
                      onChange={(e) => handleInputChange("login", "password", e.target.value)}
                      required
                    />
                    <div className="flex justify-end mt-1">
                      <a href="#" className="text-xs text-primary hover:underline">Forgot password?</a>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" />
                      <span className="ml-2 text-sm text-gray-600">Remember me</span>
                    </label>
                  </div>
                  
                  <div>
                    <button 
                      type="submit" 
                      className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                    >
                      Login
                    </button>
                  </div>
                </form>
              )}
              
              {/* Register Form */}
              {activeTab === "register" && (
                <form onSubmit={handleRegisterSubmit}>
                  <div className="mb-4">
                    <label htmlFor="registerFullName" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name
                    </label>
                    <input 
                      type="text" 
                      id="registerFullName" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={formData.register.fullName}
                      onChange={(e) => handleInputChange("register", "fullName", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="registerUsername" className="block text-sm font-medium text-gray-700 mb-1">
                      Username
                    </label>
                    <input 
                      type="text" 
                      id="registerUsername" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={formData.register.username}
                      onChange={(e) => handleInputChange("register", "username", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="registerEmail" className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <input 
                      type="email" 
                      id="registerEmail" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={formData.register.email}
                      onChange={(e) => handleInputChange("register", "email", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="registerPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Password
                    </label>
                    <input 
                      type="password" 
                      id="registerPassword" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={formData.register.password}
                      onChange={(e) => handleInputChange("register", "password", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-6">
                    <label htmlFor="registerConfirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password
                    </label>
                    <input 
                      type="password" 
                      id="registerConfirmPassword" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={formData.register.confirmPassword}
                      onChange={(e) => handleInputChange("register", "confirmPassword", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Register as</label>
                    <div className="flex gap-4">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="userRole" 
                          value="buyer" 
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary" 
                          checked={formData.register.role === "buyer"}
                          onChange={() => handleInputChange("register", "role", "buyer")}
                        />
                        <span className="ml-2 text-sm text-gray-600">Buyer</span>
                      </label>
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="userRole" 
                          value="seller" 
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                          checked={formData.register.role === "seller"}
                          onChange={() => handleInputChange("register", "role", "seller")}
                        />
                        <span className="ml-2 text-sm text-gray-600">Seller</span>
                      </label>
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label className="flex items-center">
                      <input type="checkbox" className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" required />
                      <span className="ml-2 text-sm text-gray-600">
                        I agree to the <a href="#" className="text-primary hover:underline">Terms of Service</a> and{" "}
                        <a href="#" className="text-primary hover:underline">Privacy Policy</a>
                      </span>
                    </label>
                  </div>
                  
                  <div>
                    <button 
                      type="submit" 
                      className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-blue-600 transition"
                    >
                      Register
                    </button>
                  </div>
                </form>
              )}
            </div>
            
            {/* Right: Hero/About */}
            <div className="md:w-1/2 bg-gradient-to-br from-primary to-blue-700 p-8 text-white">
              <div className="h-full flex flex-col justify-center">
                <h1 className="text-3xl font-heading font-bold mb-4">ElectroMart</h1>
                <p className="text-blue-100 mb-6">
                  Your one-stop destination for premium electronics and tech gadgets.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                      <i className="fas fa-shopping-cart text-white"></i>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Wide Selection</h3>
                      <p className="text-sm text-blue-100">
                        Choose from thousands of high-quality electronics products.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                      <i className="fas fa-tag text-white"></i>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Best Prices</h3>
                      <p className="text-sm text-blue-100">
                        Get competitive prices and regular discounts on all products.
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-start">
                    <div className="bg-white bg-opacity-20 p-2 rounded-full mr-3">
                      <i className="fas fa-truck text-white"></i>
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Fast Delivery</h3>
                      <p className="text-sm text-blue-100">
                        Quick and reliable shipping to your doorstep.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
