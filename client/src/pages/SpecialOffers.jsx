import React from "react";

const SpecialOffers = () => (
  <div className="container mx-auto py-16 text-center">
    <h1 className="text-3xl font-bold mb-4">Special Offers</h1>
    <p className="text-gray-600 mb-8 max-w-2xl mx-auto">Take advantage of our exclusive deals and discounts on top electronics. Save big on your favorite gadgets for a limited time only!</p>
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 mb-8">
      <div className="bg-white rounded-lg shadow p-6 border-2 border-red-400">
        <img src="/assets/offer1.jpg" alt="Offer 1" className="w-full h-40 object-cover rounded mb-4" />
        <h2 className="text-lg font-semibold mb-2">Noise Cancelling Earbuds</h2>
        <p className="text-gray-500 mb-2">Now 30% off! Enjoy immersive sound anywhere.</p>
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Shop Now</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 border-2 border-red-400">
        <img src="/assets/offer2.jpg" alt="Offer 2" className="w-full h-40 object-cover rounded mb-4" />
        <h2 className="text-lg font-semibold mb-2">Fitness Tracker</h2>
        <p className="text-gray-500 mb-2">Buy one, get one 50% off. Track your health and fitness.</p>
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Shop Now</button>
      </div>
      <div className="bg-white rounded-lg shadow p-6 border-2 border-red-400">
        <img src="/assets/offer3.jpg" alt="Offer 3" className="w-full h-40 object-cover rounded mb-4" />
        <h2 className="text-lg font-semibold mb-2">Portable Charger</h2>
        <p className="text-gray-500 mb-2">Save 20% on all portable chargers. Stay powered up!</p>
        <button className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700">Shop Now</button>
      </div>
    </div>
    <p className="text-gray-700">Hurry! These offers are available for a limited time only.</p>
  </div>
);

export default SpecialOffers; 