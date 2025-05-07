import React from 'react';
import { useRoute, Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../utils/api';
import { useCart } from '../utils/cart';
import { useToast } from '@/hooks/use-toast';

// Fetch product details by ID
const fetchProductById = async (id) => {
  // Ensure ID is valid before fetching
  if (!id || isNaN(parseInt(id))) {
    throw new Error('Invalid product ID');
  }
  const response = await apiRequest('GET', `/api/products/${id}`);
  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Product not found');
    }
    throw new Error('Network response was not ok when fetching product details');
  }
  return response.json();
};

const ProductDetail = () => {
  const { toast } = useToast();
  const { addToCart } = useCart();
  const [match, params] = useRoute("/products/:id");
  const productId = params?.id;

  const { 
    data: product, 
    isLoading, 
    error 
  } = useQuery({ 
    queryKey: ['product', productId], 
    queryFn: () => fetchProductById(productId),
    enabled: !!productId, // Only run query if productId is available
  });

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, 1);
    toast({
      title: "Added to Cart",
      description: `${product.name} has been added to your cart.`,
    });
  };
  
  // Basic check for image URL validity
  const isValidImageUrl = (url) => {
    return url && (url.startsWith('http://') || url.startsWith('https://'));
  };

  if (isLoading) {
    return <div className="container mx-auto p-8 text-center">Loading product details...</div>;
  }

  if (error) {
    return <div className="container mx-auto p-8 text-center text-red-500">Error: {error.message}</div>;
  }

  if (!product) {
    return <div className="container mx-auto p-8 text-center">Product not found.</div>;
  }
  
  const displayImage = isValidImageUrl(product.imageUrl) 
    ? product.imageUrl 
    : 'https://via.placeholder.com/400/cccccc/000000?text=No+Image';

  return (
    <div className="container mx-auto p-4 md:p-8">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden md:flex">
        <div className="md:w-1/2 p-4">
          <img 
            src={displayImage} 
            alt={product.name} 
            className="w-full h-auto max-h-[500px] object-contain rounded"
            onError={(e) => { 
              e.target.onerror = null; 
              e.target.src='https://via.placeholder.com/400/cccccc/000000?text=Load+Error'; 
            }}
          />
        </div>
        <div className="md:w-1/2 p-6 flex flex-col justify-between">
          <div>
            <span className="text-sm text-gray-500 uppercase tracking-wide">{product.category || 'Uncategorized'}</span>
            <h1 className="text-3xl font-bold text-gray-800 mt-1 mb-3">{product.name}</h1>
            <p className="text-gray-600 mb-4">{product.description || 'No description available.'}</p>
             {/* TODO: Add rating display if needed */}
             <p className="text-gray-500 mb-4">Stock: {product.stock > 0 ? `${product.stock} units available` : 'Out of Stock'}</p>
          </div>
          <div className="mt-4">
             <p className="text-primary font-bold text-4xl mb-6">${parseFloat(product.price).toFixed(2)}</p>
            <button 
              onClick={handleAddToCart}
              className="w-full bg-primary text-white py-3 px-6 rounded-lg hover:bg-blue-600 transition duration-200 text-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={product.stock === 0}
            >
               {product.stock > 0 ? 'Add to Cart' : 'Out of Stock'}
            </button>
          </div>
        </div>
      </div>
      {/* TODO: Add related products or reviews section? */}
    </div>
  );
};

export default ProductDetail; 