import React from "react";
import { Building, Mail, Phone, MapPin } from "lucide-react";

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <Building className="h-8 w-8 text-blue-400" />
              <span className="text-2xl font-bold text-white">FlatFinder</span>
            </div>
            <p className="text-gray-300 mb-4 max-w-md">
              Find your perfect student accommodation near your university.
              Connect with trusted brokers and discover amazing flats at
              affordable prices.
            </p>
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2 text-gray-300">
                <Mail className="h-4 w-4" />
                <span>
                  <a href="mailto:8581priyanshu@gmail.com">
                    8581priyanshu@gmail.com
                  </a>
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/flats"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Find Flats
                </a>
              </li>
              <li>
                <a
                  href="/register"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Register
                </a>
              </li>
              <li>
                <a
                  href="/login"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Login
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-semibold mb-4">For Brokers</h3>
            <ul className="space-y-2">
              <li>
                <a
                  href="/register"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Become a Broker
                </a>
              </li>
              <li>
                <a
                  href="/add-property"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  List Property
                </a>
              </li>
              <li>
                <a
                  href="/broker-dashboard"
                  className="text-gray-300 hover:text-blue-400 transition-colors"
                >
                  Broker Dashboard
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center">
          {/* <p className="text-gray-400">© 2024 FlatFinder. All rights reserved.</p> */}
        </div>
      </div>
    </footer>
  );
};

export default Footer;
