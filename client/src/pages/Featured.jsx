import React from "react";

const Featured = () => (
  <div className="container mx-auto py-16 text-center">
    <h1 className="text-3xl font-bold mb-4">Featured Products</h1>
    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Discover our handpicked selection of top-rated electronics and tech gadgets. These products are highly recommended by our customers and our team for their quality, innovation, and value.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <img src="/assets/featured1.jpg" alt="Featured Product 1" className="w-full h-40 object-cover rounded mb-4" />
        <h2 className="text-lg font-semibold mb-2">Wireless Headphones</h2>
        <p className="text-gray-500 mb-2">Experience high-fidelity sound and noise cancellation.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View Product</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <img src="/assets/featured2.jpg" alt="Featured Product 2" className="w-full h-40 object-cover rounded mb-4" />
        <h2 className="text-lg font-semibold mb-2">Smart Watch</h2>
        <p className="text-gray-500 mb-2">Track your fitness and stay connected on the go.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View Product</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <img src="/assets/featured3.jpg" alt="Featured Product 3" className="w-full h-40 object-cover rounded mb-4" />
        <h2 className="text-lg font-semibold mb-2">Bluetooth Speaker</h2>
        <p className="text-gray-500 mb-2">Portable, powerful sound for any occasion.</p>
        <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">View Product</button>
      </div>
    </div>
    <p className="text-gray-700">Check back often for new featured products and exclusive deals!</p>
  </div>
);

export default Featured; 