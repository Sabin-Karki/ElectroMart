import React from "react";

const NewArrivals = () => (
  <div className="container mx-auto py-16 text-center">
    <h1 className="text-3xl font-bold mb-4">New Arrivals</h1>
    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Be the first to explore the latest electronics and gadgets added to our store. Stay ahead with cutting-edge technology and innovative products.</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
      <div className="bg-white rounded-lg shadow p-6">
        <img src="/assets/new1.jpg" alt="New Arrival 1" className="w-full h-40 object-cover rounded mb-4" />
        <h2 className="text-lg font-semibold mb-2">VR Headset</h2>
        <p className="text-gray-500 mb-2">Immerse yourself in virtual worlds with our latest VR headset.</p>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">View Product</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <img src="/assets/new2.jpg" alt="New Arrival 2" className="w-full h-40 object-cover rounded mb-4" />
        <h2 className="text-lg font-semibold mb-2">Smart Home Hub</h2>
        <p className="text-gray-500 mb-2">Control all your smart devices from one place.</p>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">View Product</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6">
        <img src="/assets/new3.jpg" alt="New Arrival 3" className="w-full h-40 object-cover rounded mb-4" />
        <h2 className="text-lg font-semibold mb-2">4K Action Camera</h2>
        <p className="text-gray-500 mb-2">Capture every adventure in stunning 4K resolution.</p>
        <button className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">View Product</button>
      </div>
    </div>
    <p className="text-gray-700">New products are added regularly. Don't miss out on the latest arrivals!</p>
  </div>
);

export default NewArrivals; 