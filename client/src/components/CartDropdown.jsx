import { Link } from "wouter";
import { useCart } from "../utils/cart.jsx";

const CartDropdown = () => {
  const { cart, removeFromCart, cartTotal } = useCart();
  
  // Format price (expects dollars as string or number)
  const formatPrice = (dollars) => {
    const number = parseFloat(dollars || '0');
    return `$${number.toFixed(2)}`;
  };
  
  return (
    <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg py-4 z-50">
      <div className="px-4 py-2 border-b border-gray-100">
        <h3 className="font-medium">Your Cart</h3>
      </div>
      
      <div className="py-2 px-4 max-h-60 overflow-y-auto">
        {cart.length === 0 ? (
          <p className="text-gray-500 text-center py-4">Your cart is empty</p>
        ) : (
          cart.map((item) => (
            <div key={item.id} className="flex items-center py-2 border-b border-gray-100">
              <img 
                src={`${item.product.image}?ixlib=rb-1.2.1&auto=format&fit=crop&w=50&h=50&q=80`} 
                alt={item.product.name} 
                className="w-12 h-12 rounded object-cover"
              />
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium">{item.product.name}</p>
                <p className="text-xs text-gray-500">
                  {formatPrice(item.product.price)} x {item.quantity}
                </p>
              </div>
              <button 
                className="text-gray-400 hover:text-red-500"
                onClick={() => removeFromCart(item.id)}
                aria-label={`Remove ${item.product.name} from cart`}
              >
                <i className="fas fa-times"></i>
              </button>
            </div>
          ))
        )}
      </div>
      
      <div className="px-4 py-3 border-t border-gray-100">
        <div className="flex justify-between font-medium">
          <span>Total:</span>
          <span>{formatPrice(cartTotal)}</span>
        </div>
        <Link 
          href="/checkout"
          className="mt-3 w-full bg-primary text-white py-2 rounded-lg hover:bg-blue-600 transition text-center block"
        >
          Checkout
        </Link>
      </div>
    </div>
  );
};

export default CartDropdown;
