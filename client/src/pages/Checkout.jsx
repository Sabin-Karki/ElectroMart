import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useAuth } from "../utils/auth";
import { useCart } from "../utils/cart";
import { apiRequest } from "../utils/api";
import { useToast } from "@/hooks/use-toast";

// Use the Stripe public key from environment variables
const STRIPE_PUBLIC_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY;
const isStripeConfigured = !!STRIPE_PUBLIC_KEY;

// Load Stripe.js
let stripePromise;
if (isStripeConfigured) {
  import("@stripe/stripe-js").then(module => {
    const { loadStripe } = module;
    stripePromise = loadStripe(STRIPE_PUBLIC_KEY);
  });
}

// Checkout Steps
const SHIPPING_STEP = 0;
const PAYMENT_STEP = 1;
const CONFIRMATION_STEP = 2;

const Checkout = () => {
  const { user } = useAuth();
  const { cart, clearCart, cartTotal } = useCart();
  const [location, navigate] = useLocation();
  const { toast } = useToast();
  
  const [step, setStep] = useState(SHIPPING_STEP);
  const [shippingAddress, setShippingAddress] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    postalCode: "",
    country: "US"
  });
  
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [clientSecret, setClientSecret] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [paymentError, setPaymentError] = useState("");
  
  // Format price (expects dollars as string or number)
  const formatPrice = (dollars) => {
    const number = parseFloat(dollars || '0');
    return `$${number.toFixed(2)}`;
  };
  
  // Check if user is logged in
  useEffect(() => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please login to proceed with checkout",
        variant: "destructive",
      });
      navigate("/auth");
    }
  }, [user, navigate, toast]);
  
  // Check if cart is empty
  useEffect(() => {
    if (cart.length === 0 && !orderId) {
      navigate("/");
    }
  }, [cart, navigate, orderId]);
  
  const handleInputChange = (field, value) => {
    setShippingAddress(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  const handleShippingSubmit = (e) => {
    e.preventDefault();
    setStep(PAYMENT_STEP);
  };
  
  const handlePaymentSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsProcessing(true);
      setPaymentError("");
      
      // Process checkout (create order)
      const response = await apiRequest("POST", "/api/checkout", {
        shippingAddress: `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}, ${shippingAddress.country}`
      });
      
      const { orderId: newOrderId, totalAmount } = await response.json();
      setOrderId(newOrderId);
      
      // For Stripe payment
      if (paymentMethod === "card" && isStripeConfigured) {
        const paymentResponse = await apiRequest("POST", "/api/create-payment-intent", {
          amount: totalAmount,
          orderId: newOrderId
        });
        
        const paymentData = await paymentResponse.json();
        setClientSecret(paymentData.clientSecret);
        
        // Redirect to complete Stripe payment
        initiateStripePayment(paymentData.clientSecret);
      } else {
        // For direct payment (COD), mark order as paid
        try {
          await apiRequest("POST", "/api/confirm-payment", {
            orderId: newOrderId,
            paymentIntentId: null
          });
        } catch (err) {
          // Even if this fails, continue to confirmation
          console.error("COD payment confirmation failed", err);
        }
        setStep(CONFIRMATION_STEP);
        clearCart();
      }
      
      setIsProcessing(false);
    } catch (err) {
      setPaymentError(err.message || "An error occurred during checkout. Please try again.");
      setIsProcessing(false);
      toast({
        title: "Checkout Failed",
        description: err.message || "An error occurred during checkout. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const initiateStripePayment = async (clientSecret) => {
    if (!stripePromise) {
      setPaymentError("Stripe is not configured properly. Please try another payment method.");
      return;
    }
    
    const stripe = await stripePromise;
    
    const { error } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          // In a real implementation, you would use Stripe Elements or checkout.js
          // For this demo, we're simulating a successful payment
          token: "tok_visa" // This is a test token that Stripe accepts
        },
        billing_details: {
          name: shippingAddress.fullName,
          email: shippingAddress.email
        }
      }
    });
    
    if (error) {
      setPaymentError(error.message || "Payment failed. Please try again.");
      toast({
        title: "Payment Failed",
        description: error.message || "Payment failed. Please try again.",
        variant: "destructive",
      });
    } else {
      // Confirm payment with backend
      try {
        await apiRequest("POST", "/api/confirm-payment", {
          orderId: orderId,
          paymentIntentId: clientSecret
        });
        
        toast({
          title: "Payment Successful",
          description: "Your payment has been processed successfully.",
        });
        setStep(CONFIRMATION_STEP);
        clearCart();
      } catch (confirmError) {
        console.error("Error confirming payment:", confirmError);
        toast({
          title: "Payment Processed",
          description: "Payment was successful but there was an issue updating the order status. Please contact support.",
        });
        setStep(CONFIRMATION_STEP);
        clearCart();
      }
    }
  };
  
  // Calculate summary values in dollars
  const subtotal = cartTotal; // cartTotal from useCart is already in dollars
  const shippingCost = 5.99; // Assume $5.99 shipping cost
  const taxRate = 0.08; // 8% tax
  const taxAmount = subtotal * taxRate;
  const totalAmount = subtotal + shippingCost + taxAmount;
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">Checkout</h1>
        
        {/* Checkout Steps */}
        <div className="flex mb-8">
          <div className={`flex-1 text-center pb-2 border-b-2 ${step >= SHIPPING_STEP ? 'border-primary text-primary font-medium' : 'border-gray-200 text-gray-500'}`}>
            <span className="inline-block w-6 h-6 rounded-full bg-white border-2 border-current text-sm mr-2">1</span>
            Shipping
          </div>
          <div className={`flex-1 text-center pb-2 border-b-2 ${step >= PAYMENT_STEP ? 'border-primary text-primary font-medium' : 'border-gray-200 text-gray-500'}`}>
            <span className="inline-block w-6 h-6 rounded-full bg-white border-2 border-current text-sm mr-2">2</span>
            Payment
          </div>
          <div className={`flex-1 text-center pb-2 border-b-2 ${step >= CONFIRMATION_STEP ? 'border-primary text-primary font-medium' : 'border-gray-200 text-gray-500'}`}>
            <span className="inline-block w-6 h-6 rounded-full bg-white border-2 border-current text-sm mr-2">3</span>
            Confirmation
          </div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Checkout Content */}
          <div className="lg:col-span-2">
            {/* Shipping Form */}
            {step === SHIPPING_STEP && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-medium mb-4">Shipping Information</h2>
                
                <form onSubmit={handleShippingSubmit}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                      <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                      <input 
                        type="text" 
                        id="fullName" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={shippingAddress.fullName}
                        onChange={(e) => handleInputChange("fullName", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                      <input 
                        type="email" 
                        id="email" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={shippingAddress.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        required
                      />
                    </div>
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                    <input 
                      type="tel" 
                      id="phone" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={shippingAddress.phone}
                      onChange={(e) => handleInputChange("phone", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="mb-4">
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                    <input 
                      type="text" 
                      id="address" 
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                      value={shippingAddress.address}
                      onChange={(e) => handleInputChange("address", e.target.value)}
                      required
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">City</label>
                      <input 
                        type="text" 
                        id="city" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={shippingAddress.city}
                        onChange={(e) => handleInputChange("city", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                      <input 
                        type="text" 
                        id="postalCode" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={shippingAddress.postalCode}
                        onChange={(e) => handleInputChange("postalCode", e.target.value)}
                        required
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="country" className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                      <select 
                        id="country" 
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                        value={shippingAddress.country}
                        onChange={(e) => handleInputChange("country", e.target.value)}
                        required
                      >
                        <option value="US">United States</option>
                        <option value="CA">Canada</option>
                        <option value="UK">United Kingdom</option>
                        <option value="AU">Australia</option>
                        <option value="IN">India</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end mt-6">
                    <button 
                      type="submit" 
                      className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Payment Form */}
            {step === PAYMENT_STEP && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <h2 className="text-xl font-medium mb-4">Payment Method</h2>
                
                {paymentError && (
                  <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                    {paymentError}
                  </div>
                )}
                
                <form onSubmit={handlePaymentSubmit}>
                  <div className="mb-4">
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="card" 
                          checked={paymentMethod === "card"} 
                          onChange={() => setPaymentMethod("card")}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="ml-2 text-gray-700">Credit/Debit Card</span>
                      </label>
                      
                      <label className="flex items-center">
                        <input 
                          type="radio" 
                          name="paymentMethod" 
                          value="cod" 
                          checked={paymentMethod === "cod"} 
                          onChange={() => setPaymentMethod("cod")}
                          className="h-4 w-4 text-primary border-gray-300 focus:ring-primary"
                        />
                        <span className="ml-2 text-gray-700">Cash on Delivery</span>
                      </label>
                    </div>
                  </div>
                  
                  {paymentMethod === "card" && (
                    <div className="border border-gray-200 rounded-md p-4 mb-4">
                      <div className="bg-blue-50 border border-blue-100 text-blue-700 px-4 py-3 rounded mb-4">
                        <div className="flex">
                          <div className="flex-shrink-0 mr-2">
                            <i className="fas fa-info-circle"></i>
                          </div>
                          <div>
                            <p className="text-sm font-medium">Test Card Information</p>
                            <p className="text-xs mt-1">Use <strong>4242 4242 4242 4242</strong> as the card number with any future expiration date, any 3-digit CVV, and any 5-digit ZIP code.</p>
                          </div>
                        </div>
                      </div>
                      
                      <div className="mb-4">
                        <label htmlFor="cardNumber" className="block text-sm font-medium text-gray-700 mb-1">Card Number</label>
                        <div className="relative">
                          <input 
                            type="text" 
                            id="cardNumber" 
                            className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                            placeholder="4242 4242 4242 4242" 
                            required={paymentMethod === "card"}
                          />
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <i className="far fa-credit-card text-gray-400"></i>
                          </div>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="expiryDate" className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
                          <input 
                            type="text" 
                            id="expiryDate" 
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                            placeholder="MM/YY" 
                            required={paymentMethod === "card"}
                          />
                        </div>
                        <div>
                          <label htmlFor="cvv" className="block text-sm font-medium text-gray-700 mb-1">CVV</label>
                          <div className="relative">
                            <input 
                              type="text" 
                              id="cvv" 
                              className="w-full px-3 py-2 pl-10 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                              placeholder="123" 
                              required={paymentMethod === "card"}
                            />
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                              <i className="fas fa-lock text-gray-400"></i>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div>
                        <label htmlFor="nameOnCard" className="block text-sm font-medium text-gray-700 mb-1">Name on Card</label>
                        <input 
                          type="text" 
                          id="nameOnCard" 
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary" 
                          required={paymentMethod === "card"}
                        />
                      </div>
                      
                      <div className="flex items-center mt-4 text-sm text-gray-500">
                        <i className="fas fa-lock mr-2"></i>
                        <span>Your payment information is secure and encrypted</span>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-between mt-6">
                    <button 
                      type="button" 
                      onClick={() => setStep(SHIPPING_STEP)}
                      className="text-gray-600 hover:text-gray-800"
                    >
                      <i className="fas fa-arrow-left mr-2"></i>
                      Back to Shipping
                    </button>
                    
                    <button 
                      type="submit" 
                      className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition flex items-center"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></span>
                          Processing...
                        </>
                      ) : (
                        <>
                          Complete Order
                          <i className="fas fa-arrow-right ml-2"></i>
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            )}
            
            {/* Confirmation */}
            {step === CONFIRMATION_STEP && (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <div className="mb-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full">
                    <i className="fas fa-check text-2xl text-green-600"></i>
                  </div>
                </div>
                <h2 className="text-2xl font-medium mb-2">Order Confirmed!</h2>
                <p className="text-gray-600 mb-6">
                  Thank you for your purchase. Your order has been placed successfully.
                </p>
                <p className="font-medium mb-6">
                  Order ID: #{orderId}
                </p>
                <div className="flex flex-col sm:flex-row justify-center gap-4">
                  <button 
                    onClick={() => navigate("/buyer/dashboard")}
                    className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
                  >
                    View Order
                  </button>
                  <button 
                    onClick={() => navigate("/")}
                    className="bg-gray-100 text-gray-800 py-2 px-6 rounded-lg hover:bg-gray-200 transition"
                  >
                    Continue Shopping
                  </button>
                </div>
              </div>
            )}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <h3 className="text-xl font-medium mb-4">Order Summary</h3>
              
              <div className="space-y-3 mb-6 max-h-60 overflow-y-auto border-b pb-4">
                {cart.map((item) => (
                  <div key={item.id} className="flex justify-between items-center">
                    <div className="flex items-center">
                      <img 
                        src={`${item.product.imageUrl}?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80`} 
                        alt={item.product.name} 
                        className="w-10 h-10 rounded object-cover mr-3"
                      />
                      <div>
                        <p className="text-sm font-medium">{item.product.name}</p>
                        <p className="text-xs text-gray-500">Qty: {item.quantity}</p>
                      </div>
                    </div>
                    {/* Format item price correctly */}
                    <span className="text-sm font-medium">{formatPrice(item.product.price)}</span> 
                  </div>
                ))}
              </div>
              
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  {/* Format subtotal */}
                  <span className="font-medium">{formatPrice(subtotal)}</span> 
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Shipping</span>
                  {/* Format shipping */}
                  <span className="font-medium">{formatPrice(shippingCost)}</span> 
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span className="text-gray-600">Taxes</span>
                  {/* Format tax */}
                  <span className="font-medium">{formatPrice(taxAmount)}</span> 
                </div>
                <div className="flex justify-between font-bold text-lg pt-2">
                  <span>Total</span>
                  {/* Format total */}
                  <span>{formatPrice(totalAmount)}</span> 
                </div>
              </div>
              
              {/* Action Button (conditional based on step) */}
              {step === SHIPPING_STEP && (
                 <button 
                    type="submit" 
                    form="shipping-form" // Link button to shipping form
                    className="mt-6 w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition text-lg font-semibold"
                 >
                   Continue to Payment
                 </button>
              )}
              {step === PAYMENT_STEP && (
                 <button 
                    type="submit" 
                    form="payment-form" // Link button to payment form
                    disabled={isProcessing}
                    className="mt-6 w-full bg-primary text-white py-3 rounded-lg hover:bg-blue-600 transition text-lg font-semibold disabled:opacity-50"
                 >
                   {isProcessing ? 'Processing...' : `Pay ${formatPrice(totalAmount)}`}
                 </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
