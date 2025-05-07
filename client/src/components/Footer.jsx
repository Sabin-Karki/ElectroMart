import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">ElectroMart</h3>
            <p className="text-gray-400 mb-4">Your one-stop destination for premium electronics and tech gadgets.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Shop</h4>
            <ul className="space-y-2">
              <li><Link href="/products" className="text-gray-400 hover:text-white transition">All Products</Link></li>
              <li><a href="#featured-products" className="text-gray-400 hover:text-white transition">Featured</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">New Arrivals</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Special Offers</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link href="/contact-us" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition">FAQs</Link></li>
              <li><Link href="/shipping-policy" className="text-gray-400 hover:text-white transition">Shipping Policy</Link></li>
              <li><a href="#" className="text-gray-400 hover:text-white transition">Returns & Refunds</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Newsletter</h4>
            <p className="text-gray-400 mb-4">Subscribe to receive updates on new arrivals and special offers.</p>
            <form className="flex">
              <input 
                type="email" 
                placeholder="Your email" 
                className="px-4 py-2 w-full rounded-l-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-800"
              />
              <button 
                type="submit" 
                className="bg-primary hover:bg-blue-600 px-4 py-2 rounded-r-lg transition"
              >
                <i className="fas fa-paper-plane"></i>
              </button>
            </form>
          </div>
        </div>
        
        <div className="border-t border-gray-700 mt-10 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400">© {new Date().getFullYear()} ElectroMart. All rights reserved.</p>
            <div className="mt-4 md:mt-0 flex items-center space-x-2">
              <i className="fab fa-cc-visa text-2xl text-gray-300"></i>
              <i className="fab fa-cc-mastercard text-2xl text-gray-300"></i>
              <i className="fab fa-cc-amex text-2xl text-gray-300"></i>
              <i className="fab fa-cc-paypal text-2xl text-gray-300"></i>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
