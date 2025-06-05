import { useState, useEffect } from "react";
import { Switch, Route, useLocation, Redirect } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider, useAuth } from "./utils/auth.jsx";
import { CartProvider } from "./utils/cart.jsx";

// Components
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Toast from "./components/Toast.jsx";

// Pages
import Home from "./pages/Home.jsx";
import Auth from "./pages/Auth.jsx";
import BuyerDashboard from "./pages/BuyerDashboard.jsx";
import SellerDashboard from "./pages/SellerDashboard.jsx";
import ProductListing from "./pages/ProductListing.jsx";
import Checkout from "./pages/Checkout.jsx";
import NotFound from "@/pages/not-found";
import ProductDetail from "./pages/ProductDetail.jsx";
import FAQ from "./pages/FAQ.jsx";
import ContactUs from "./pages/ContactUs.jsx";
import ShippingPolicy from "./pages/ShippingPolicy.jsx";
import ReturnsRefunds from "./pages/ReturnsRefunds.jsx";
import AboutUs from "./pages/AboutUs.jsx";

// Protected Route Component that checks both authentication and role
const ProtectedRoute = ({ component: Component, roles, ...rest }: any) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="flex justify-center items-center h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>;
  }
  
  if (!user) {
    return <Redirect to="/auth" />;
  }
  
  if (roles && !roles.includes(user.role)) {
    return <Redirect to="/" />;
  }
  
  return <Component {...rest} />;
};

export function App() {
  const [toastConfig, setToastConfig] = useState({ visible: false, message: "", type: "success" });
  const [location] = useLocation();

  // Show toast notification
  const showToast = (message: any, type = "success") => {
    setToastConfig({ visible: true, message, type });
    
    // Auto hide after 3 seconds
    setTimeout(() => {
      setToastConfig(prev => ({ ...prev, visible: false }));
    }, 3000);
  };

  // Close toast
  const closeToast = () => {
    setToastConfig(prev => ({ ...prev, visible: false }));
  };

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />
            
            <main className="flex-grow">
              <Switch>
                <Route path="/" component={Home} />
                <Route path="/auth" component={Auth} />
                <Route path="/buyer/dashboard">
                  <ProtectedRoute component={BuyerDashboard} roles={["buyer"]} />
                </Route>
                <Route path="/seller/dashboard">
                  <ProtectedRoute component={SellerDashboard} roles={["seller"]} />
                </Route>
                <Route path="/products/:id" component={ProductDetail} />
                <Route path="/products" component={ProductListing} />
                <Route path="/about-us" component={AboutUs} />
                <Route path="/returns-refunds" component={ReturnsRefunds} />
                <Route path="/checkout">
                  <ProtectedRoute component={Checkout} roles={["buyer", "seller"]} />
                </Route>
                <Route path="/faq" component={FAQ} />
                <Route path="/contact-us" component={ContactUs} />
                <Route path="/shipping-policy" component={ShippingPolicy} />
                <Route component={NotFound} />
              </Switch>
            </main>
            
            <Footer />
            
            <Toast 
              visible={toastConfig.visible}
              message={toastConfig.message}
              type={toastConfig.type}
              onClose={closeToast}
            />
            
            <Toaster />
          </div>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
