import { useState, useEffect } from "react";
import { Link } from "wouter";
import ProductCard from "../components/ProductCard";
import CategoryCard from "../components/CategoryCard";
import { apiRequest } from "../utils/api";

const Home = () => {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Categories with icons
  const categories = [
    { name: "Laptops", icon: "fas fa-laptop" },
    { name: "Phones", icon: "fas fa-mobile-alt" },
    { name: "Audio", icon: "fas fa-headphones" },
    { name: "Monitors", icon: "fas fa-desktop" },
    { name: "Storage", icon: "fas fa-hdd" },
    { name: "Accessories", icon: "fas fa-keyboard" },
    { name: "Wearables", icon: "fas fa-smartwatch" },
    { name: "Gaming", icon: "fas fa-gamepad" }
  ];
  
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await apiRequest("GET", "/api/products");
        const products = await response.json();
        
        // Get featured products (first 4)
        setFeaturedProducts(products.slice(0, 4));
        
        // Get new arrivals (next 4)
        setNewArrivals(products.slice(4, 8).map(p => ({ ...p, isNew: true })));
        
        // Get best sellers (last 4)
        setBestSellers(products.slice(8, 12));
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-500 to-blue-700 text-white">
        <div className="container mx-auto px-4 py-12 md:py-20">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-8 md:mb-0">
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-4">Welcome to ElectroMart</h1>
              <p className="text-lg md:text-xl mb-6 text-blue-100">Your One-Stop Destination for Premium Electronics and Tech Gadgets</p>
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/products" className="bg-white text-primary font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition text-center">
                  Shop Now
                </Link>
                <Link href="/about-us" className="bg-transparent border border-white text-white font-medium py-3 px-6 rounded-lg hover:bg-white hover:text-blue-700 transition text-center">Learn More</Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <img 
                src="https://images.unsplash.com/photo-1498049794561-7780e7231661?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&h=400&q=80" 
                alt="Electronics collection" 
                className="rounded-lg shadow-xl max-w-full h-auto"
              />
            </div>
          </div>
        </div>
      </section>
      
      {/* Categories Section */}
      <section className="py-10 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl font-heading font-semibold mb-8 text-center">Shop By Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {categories.map((category, index) => (
              <CategoryCard key={index} category={category} />
            ))}
          </div>
        </div>
      </section>
      
      {/* Featured Products Section */}
      <section id="featured-products" className="py-12 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-heading font-semibold">Featured Products</h2>
            <Link href="/products" className="text-primary hover:text-blue-700 flex items-center">
              <span>View all</span>
              <i className="fas fa-chevron-right ml-2 text-xs"></i>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {featuredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* New Arrivals Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-heading font-semibold">New Arrivals</h2>
            <Link href="/products" className="text-primary hover:text-blue-700 flex items-center">
              <span>View all</span>
              <i className="fas fa-chevron-right ml-2 text-xs"></i>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
      
      {/* Banner Section */}
      <section className="py-10 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="bg-gradient-to-r from-primary to-blue-700 rounded-xl overflow-hidden">
            <div className="flex flex-col md:flex-row items-center">
              <div className="md:w-1/2 p-8 md:p-12">
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white mb-4">Get 20% Off on Selected Items</h2>
                <p className="text-blue-100 mb-6">
                  Limited time offer. Use code <span className="font-bold bg-white bg-opacity-20 px-2 py-1 rounded">ELECTRO20</span> at checkout.
                </p>
                <a href="#featured-products" className="inline-block bg-white text-primary font-medium py-3 px-6 rounded-lg hover:bg-gray-100 transition">
                  Shop Now
                </a>
              </div>
              <div className="md:w-1/2 p-6 md:p-12 flex justify-center">
                <img 
                  src="https://images.unsplash.com/photo-1593642632823-8f785ba67e45?ixlib=rb-1.2.1&auto=format&fit=crop&w=600&q=80" 
                  alt="Discount electronics" 
                  className="rounded-lg shadow-lg max-w-full h-auto"
                />
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Best Sellers Section */}
      <section className="py-12 bg-white">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-heading font-semibold">Best Sellers</h2>
            <Link href="/products" className="text-primary hover:text-blue-700 flex items-center">
              <span>View all</span>
              <i className="fas fa-chevron-right ml-2 text-xs"></i>
            </Link>
          </div>
          
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-center py-8 text-red-500">{error}</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {bestSellers.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;
