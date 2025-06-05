import React from 'react';

const ShippingPolicy = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Shipping Policy</h1>
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <p className="text-gray-700 mb-6 text-center">Find out everything you need to know about our shipping options, costs, and delivery times.</p>

        <h2 className="text-2xl font-semibold mb-4">Shipping Options and Costs</h2>
        <p className="text-gray-700 mb-4">We offer several shipping options to meet your needs:</p>
        <ul className="list-disc list-inside text-left text-gray-700 mb-6">
          <li><strong>Standard Shipping:</strong> Estimated delivery within 5-7 business days. Cost is calculated at checkout based on weight and destination.</li>
          <li><strong>Expedited Shipping:</strong> Estimated delivery within 2-3 business days. Cost is higher than standard shipping and is calculated at checkout.</li>
          <li><strong>Overnight Shipping:</strong> Estimated delivery within 1 business day (if ordered before cut-off time). Highest cost, calculated at checkout.</li>
        </ul>

        <h2 className="text-2xl font-semibold mb-4">Processing Time</h2>
        <p className="text-gray-700 mb-6">Orders are typically processed within 1-2 business days after placement, excluding weekends and holidays. You will receive a confirmation email once your order has shipped.</p>

        <h2 className="text-2xl font-semibold mb-4">Shipping Destinations</h2>
        <p className="text-gray-700 mb-6">We currently ship to all addresses within the United States.</p>

        <h2 className="text-2xl font-semibold mb-4">Shipping Confirmation and Order Tracking</h2>
        <p className="text-gray-700 mb-6">Once your order has shipped, you will receive a shipping confirmation email containing your tracking number(s). The tracking number will become active within 24 hours.</p>

        <h2 className="text-2xl font-semibold mb-4">Shipping Damage or Loss</h2>
        <p className="text-gray-700">If your order arrives damaged or is lost in transit, please contact our customer support team immediately for assistance.</p>
      </div>
      <div className="text-center">
        <p className="text-gray-700">Have more questions about shipping? <a href="/contact-us" className="text-blue-600 hover:underline">Contact us</a>.</p>
      </div>
    </div>
  );
};

export default ShippingPolicy; 