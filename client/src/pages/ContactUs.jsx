import React from 'react';

const ContactUs = () => {
  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      <h1 className="text-4xl font-bold mb-8 text-center">Get in Touch</h1>
      <div className="bg-white rounded-lg shadow p-8 mb-8">
        <p className="text-gray-700 mb-6 text-center">Have questions, feedback, or need support? Reach out to us through the methods below or fill out the contact form.</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-2xl font-semibold mb-4">Contact Information</h2>
            <p className="text-gray-700 mb-2"><strong>Email:</strong> support@electromart.com</p>
            <p className="text-gray-700 mb-2"><strong>Phone:</strong> +1 (123) 456-7890</p>
            <p className="text-gray-700 mb-2"><strong>Address:</strong> 123 Tech Avenue, Innovation City, CA 90210</p>
          </div>
          <div>
            <h2 className="text-2xl font-semibold mb-4">Business Hours</h2>
            <p className="text-gray-700 mb-2">Monday - Friday: 9:00 AM - 6:00 PM (PST)</p>
            <p className="text-gray-700 mb-2">Saturday: 10:00 AM - 4:00 PM (PST)</p>
            <p className="text-gray-700">Sunday: Closed</p>
          </div>
        </div>

        <h2 className="text-2xl font-semibold mb-4 text-center">Send Us a Message</h2>
        <form className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-gray-700 font-medium mb-1">Name</label>
            <input type="text" id="name" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Your Name" />
          </div>
          <div>
            <label htmlFor="email" className="block text-gray-700 font-medium mb-1">Email</label>
            <input type="email" id="email" className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Your Email" />
          </div>
          <div>
            <label htmlFor="message" className="block text-gray-700 font-medium mb-1">Message</label>
            <textarea id="message" rows={4} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500" placeholder="Your Message"></textarea>
          </div>
          <div className="text-center">
            <button type="submit" className="bg-blue-600 text-white px-6 py-2 rounded-md font-semibold hover:bg-blue-700 transition">Send Message</button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ContactUs; 