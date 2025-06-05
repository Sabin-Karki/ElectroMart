import React from 'react';

const FAQ = () => {
  const faqs = [
    {
      question: "What payment methods do you accept?",
      answer: "We accept major credit cards (Visa, Mastercard, Amex) and PayPal."
    },
    {
      question: "How can I track my order?",
      answer: "Once your order ships, you will receive an email with a tracking number and a link to the carrier's website."
    },
    {
      question: "What is your return policy?",
      answer: "Please refer to our Returns & Refunds page for detailed information on our return policy and process."
    },
    {
      question: "Do you offer international shipping?",
      answer: "Currently, we only ship within the United States. We hope to offer international shipping in the future."
    },
    {
      question: "How do I contact customer support?",
      answer: "You can contact us via email at support@electromart.com or by filling out the contact form on our Contact Us page."
    }
  ];

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Frequently Asked Questions</h1>
      <div className="bg-white rounded-lg shadow p-8">
        <p className="text-gray-700 mb-6 text-center">Find answers to the most common questions about shopping with ElectroMart.</p>
        <div className="space-y-6">
          {faqs.map((faq, index) => (
            <div key={index} className="border-b pb-4 last:border-b-0 last:pb-0">
              <h2 className="text-xl font-semibold mb-2">{faq.question}</h2>
              <p className="text-gray-600">{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ; 