import React, { useState } from 'react';
import { Link } from 'wouter';
import { useCart } from '../utils/cart';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '../utils/auth';

const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user } = useAuth();
  const [isAdding, setIsAdding] = useState(false);

  const handleAddToCart = async () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please log in to add items to your cart.",
        variant: "destructive", 
      });
      return; 
    }
    
    try {
      setIsAdding(true);
      await addToCart(product, 1);
      toast({
        title: "Added to Cart",
        description: `${product.name} has been added to your cart.`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: error.message || "Failed to add item to cart",
        variant: "destructive",
      });
    } finally {
      setIsAdding(false);
    }
  };

  // Basic check for image URL validity (can be improved)
  const isValidImageUrl = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  const displayImage = isValidImageUrl(product.imageUrl) 
    ? product.imageUrl 
    : 'https://via.placeholder.com/300/cccccc/000000?text=No+Image';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden transition-transform duration-300 hover:scale-105 flex flex-col">
      <Link href={`/products/${product.id}`}>
        <img 
          src={displayImage} 
          alt={product.name} 
          className="w-full h-48 object-cover cursor-pointer"
          onError={(e) => { 
            // Fallback if image fails to load
            e.target.onerror = null; // prevents looping
            e.target.src='https://via.placeholder.com/300/cccccc/000000?text=Load+Error'; 
          }}
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold text-gray-800 mb-1 truncate" title={product.name}>{product.name}</h3>
        <p className="text-sm text-gray-500 mb-2 capitalize">{product.category || 'Uncategorized'}</p>
        <p className="text-indigo-600 font-bold text-xl mb-3">${parseFloat(product.price).toFixed(2)}</p>
        <div className="mt-auto">
          <button 
            onClick={handleAddToCart}
            className="w-full bg-primary text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={product.stock === 0 || isAdding}
          >
            {isAdding ? 'Adding...' : product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
