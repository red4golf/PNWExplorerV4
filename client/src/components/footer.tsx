import { Link } from "wouter";
import { Landmark } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-heritage-brown text-white py-16">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center space-x-2 mb-6">
              <Landmark className="text-heritage-gold text-2xl" />
              <h3 className="text-xl font-bold">Historical Explorer</h3>
            </div>
            <p className="text-gray-300 mb-4">
              Preserving and sharing the rich history of Bainbridge Island for future generations.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-heritage-gold hover:text-white transition-colors">
                📘
              </a>
              <a href="#" className="text-heritage-gold hover:text-white transition-colors">
                🐦
              </a>
              <a href="#" className="text-heritage-gold hover:text-white transition-colors">
                📷
              </a>
            </div>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Explore</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Interactive Map
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Historical Timeline
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Photo Gallery
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Audio Tours
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">Contribute</h4>
            <ul className="space-y-2">
              <li>
                <Link href="/submit" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Submit Location
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Share Photos
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Tell Stories
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Volunteer
                </a>
              </li>
            </ul>
          </div>
          
          <div>
            <h4 className="text-lg font-semibold mb-4">About</h4>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Our Mission
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Partners
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Contact Us
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-heritage-gold transition-colors">
                  Privacy Policy
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-heritage-olive mt-12 pt-8 text-center">
          <p className="text-gray-300">
            &copy; 2024 Bainbridge Island Historical Places Explorer. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
