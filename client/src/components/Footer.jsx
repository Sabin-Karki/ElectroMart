import { Link } from "wouter";

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8 mt-auto">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4 font-heading">ElectroMart</h3>
            <p className="text-gray-400 mb-4">Your one-stop destination for premium electronics and tech gadgets.</p>
            <div className="flex space-x-4">
              <a href="https://www.facebook.com/" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-facebook-f"></i>
              </a>
              <a href="https://twitter.com/" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-twitter"></i>
              </a>
              <a href="https://www.instagram.com/" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-instagram"></i>
              </a>
              <a href="https://www.youtube.com/" className="text-gray-400 hover:text-white transition">
                <i className="fab fa-youtube"></i>
              </a>
            </div>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Customer Service</h4>
            <ul className="space-y-2">
              <li><Link href="/about-us" className="text-gray-400 hover:text-white transition">About Us</Link></li>
              <li><Link href="/contact-us" className="text-gray-400 hover:text-white transition">Contact Us</Link></li>
              <li><Link href="/faq" className="text-gray-400 hover:text-white transition">FAQs</Link></li>
              <li><Link href="/shipping-policy" className="text-gray-400 hover:text-white transition">Shipping Policy</Link></li>
              <li><Link href="/returns-refunds" className="text-gray-400 hover:text-white transition">Returns & Refunds</Link></li>
            </ul>
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
