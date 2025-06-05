import React from "react";

const ReturnsRefunds = () => (
  <div className="container mx-auto py-16 max-w-2xl">
    <h1 className="text-3xl font-bold mb-4 text-center">Returns & Refunds</h1>
    <p className="text-gray-600 mb-6 text-center">We want you to be completely satisfied with your purchase. Please review our returns and refunds policy below.</p>
    <div className="bg-white rounded-lg shadow p-6 mb-8">
      <h2 className="text-xl font-semibold mb-2">Return Policy</h2>
      <ul className="list-disc list-inside text-left text-gray-700 mb-4">
        <li>Returns are accepted within 30 days of delivery.</li>
        <li>Items must be unused and in original packaging.</li>
        <li>Proof of purchase is required for all returns.</li>
        <li>Certain items (e.g., opened software, gift cards) are non-returnable.</li>
      </ul>
      <h2 className="text-xl font-semibold mb-2">How to Return an Item</h2>
      <ol className="list-decimal list-inside text-left text-gray-700 mb-4">
        <li>Contact our support team to initiate a return.</li>
        <li>Pack the item securely and include your order details.</li>
        <li>Ship the item to the address provided by our team.</li>
        <li>Once received and inspected, we will process your refund.</li>
      </ol>
      <h2 className="text-xl font-semibold mb-2">Refunds</h2>
      <ul className="list-disc list-inside text-left text-gray-700">
        <li>Refunds are issued to the original payment method.</li>
        <li>Processing time is typically 5-7 business days after approval.</li>
        <li>If you have not received your refund, please contact your bank or card provider first.</li>
      </ul>
    </div>
    <div className="text-center">
      <p className="text-gray-700">Need help? <a href="/contact-us" className="text-blue-600 hover:underline">Contact our support team</a>.</p>
    </div>
  </div>
);

export default ReturnsRefunds; 