import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import ProductCard from "../components/ProductCard";
import { apiRequest } from "../utils/api";

const ProductListing = () => {
  const [location] = useLocation();
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filters
  const [selectedCategory, setSelectedCategory] = useState("");
  const [priceRange, setPriceRange] = useState({ min: "", max: "" });
  const [sortBy, setSortBy] = useState("featured");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Parse query parameters
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const category = searchParams.get("category");
    
    if (category) {
      setSelectedCategory(category);
    }
  }, [location]);
  
  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        
        const response = await apiRequest("GET", "/api/products");
        const data = await response.json();
        
        setProducts(data);
        
        // Extract unique categories
        const uniqueCategories = [...new Set(data.map(product => product.category))];
        setCategories(uniqueCategories);
        
        setLoading(false);
      } catch (err) {
        setError("Failed to fetch products. Please try again later.");
        setLoading(false);
      }
    };
    
    fetchProducts();
  }, []);
  
  // Apply filters
  useEffect(() => {
    let result = [...products];
    
    // Filter by category
    if (selectedCategory) {
      result = result.filter(product => product.category === selectedCategory);
    }
    
    // Filter by price range
    if (priceRange.min !== "") {
      result = result.filter(product => product.price >= parseInt(priceRange.min) * 100);
    }
    
    if (priceRange.max !== "") {
      result = result.filter(product => product.price <= parseInt(priceRange.max) * 100);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        product => 
          product.name.toLowerCase().includes(query) || 
          product.description.toLowerCase().includes(query)
      );
    }
    
    // Apply sorting
    switch(sortBy) {
      case "price-low-high":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price-high-low":
        result.sort((a, b) => b.price - a.price);
        break;
      case "name-a-z":
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "name-z-a":
        result.sort((a, b) => b.name.localeCompare(a.name));
        break;
      case "newest":
        // Sort by newest (in this case we just assume product ID is somewhat chronological)
        result.sort((a, b) => b.id - a.id);
        break;
      case "rating":
        result.sort((a, b) => b.rating - a.rating);
        break;
      // Default is "featured" which is the original order
      default:
        break;
    }
    
    setFilteredProducts(result);
  }, [products, selectedCategory, priceRange, sortBy, searchQuery]);
  
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    // Search is already handled by the useEffect above
  };
  
  const handleCategoryChange = (category) => {
    setSelectedCategory(category === selectedCategory ? "" : category);
  };
  
  const handlePriceRangeChange = (e, field) => {
    setPriceRange(prev => ({
      ...prev,
      [field]: e.target.value
    }));
  };
  
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };
  
  const handleClearFilters = () => {
    setSelectedCategory("");
    setPriceRange({ min: "", max: "" });
    setSortBy("featured");
    setSearchQuery("");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        <h1 className="text-2xl font-bold mb-6">All Products</h1>
        
        <div className="flex flex-col md:flex-row gap-6">
          {/* Sidebar Filters */}
          <div className="w-full md:w-1/4">
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <h2 className="font-medium text-lg mb-4">Search</h2>
              <form onSubmit={handleSearchSubmit}>
                <div className="relative">
                  <input 
                    type="text" 
                    className="w-full border border-gray-300 rounded-lg py-2 px-4 pr-10 focus:outline-none focus:ring-2 focus:ring-primary" 
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <button type="submit" className="absolute right-2 top-2 text-gray-400 hover:text-gray-600">
                    <i className="fas fa-search"></i>
                  </button>
                </div>
              </form>
            </div>
            
            <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-medium text-lg">Filters</h2>
                <button 
                  onClick={handleClearFilters}
                  className="text-sm text-primary hover:underline"
                >
                  Clear All
                </button>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Categories</h3>
                <div className="space-y-2">
                  {categories.map((category) => (
                    <label key={category} className="flex items-center">
                      <input 
                        type="checkbox" 
                        className="h-4 w-4 text-primary border-gray-300 rounded focus:ring-primary" 
                        checked={selectedCategory === category}
                        onChange={() => handleCategoryChange(category)}
                      />
                      <span className="ml-2 text-gray-700">{category}</span>
                    </label>
                  ))}
                </div>
              </div>
              
              <div className="mb-4">
                <h3 className="font-medium mb-2">Price Range</h3>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="sr-only">Minimum Price</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                      placeholder="Min"
                      min="0"
                      value={priceRange.min}
                      onChange={(e) => handlePriceRangeChange(e, "min")}
                    />
                  </div>
                  <div>
                    <label className="sr-only">Maximum Price</label>
                    <input 
                      type="number" 
                      className="w-full border border-gray-300 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-primary" 
                      placeholder="Max"
                      min="0"
                      value={priceRange.max}
                      onChange={(e) => handlePriceRangeChange(e, "max")}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="font-medium mb-2">Sort By</h3>
                <select 
                  className="w-full border border-gray-300 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  value={sortBy}
                  onChange={handleSortChange}
                >
                  <option value="featured">Featured</option>
                  <option value="price-low-high">Price: Low to High</option>
                  <option value="price-high-low">Price: High to Low</option>
                  <option value="name-a-z">Name: A to Z</option>
                  <option value="name-z-a">Name: Z to A</option>
                  <option value="newest">Newest</option>
                  <option value="rating">Highest Rated</option>
                </select>
              </div>
            </div>
          </div>
          
          {/* Product Grid */}
          <div className="w-full md:w-3/4">
            {loading ? (
              <div className="flex justify-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            ) : error ? (
              <div className="bg-white rounded-lg shadow-sm p-6 text-center">
                <p className="text-red-500">{error}</p>
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                <div className="mb-4">
                  <i className="fas fa-search text-gray-300 text-5xl"></i>
                </div>
                <h2 className="text-xl font-medium mb-2">No Products Found</h2>
                <p className="text-gray-500 mb-4">Try adjusting your search or filter criteria.</p>
                <button 
                  onClick={handleClearFilters}
                  className="bg-primary text-white py-2 px-6 rounded-lg hover:bg-blue-600 transition"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-lg shadow-sm p-4 mb-4">
                  <p className="text-gray-600">
                    Showing <span className="font-medium">{filteredProducts.length}</span> products
                    {selectedCategory && ` in ${selectedCategory}`}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductListing;
