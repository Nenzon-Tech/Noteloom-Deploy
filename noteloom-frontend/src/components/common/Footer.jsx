import React from 'react';
import { Link } from "react-router-dom";
import { useTheme } from '@/context/ThemeContext.jsx';
import { Youtube, Facebook, Instagram, Twitter, Linkedin } from "lucide-react";

const Footer = () => {
  const { isDarkMode } = useTheme();
  
  const socialLinks = [
    { icon: Youtube, href: "#", label: "YouTube" },
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Linkedin, href: "#", label: "LinkedIn" }
  ];

  const companyLinks = ["About Us", "Contact Us", "Pricing", "Careers"];
  const ourServices = ["for Institutions", "for Students"];
  const administrators = ["IT Login", "Request IT Signup"];

  return (
    <footer className={`pt-12 pb-6 transition-colors duration-300 ${
      isDarkMode ? 'bg-gray-800' : 'bg-gray-200'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-8 mb-12">
          {/* Left Section - Company Info */}
          <div className="lg:col-span-2 flex flex-col justify-between">
            <div>
              <div className="flex items-center space-x-2 mb-6">
                <span className="text-xl font-bold">Note Loom</span>
              </div>
              <p className={`mb-6 leading-relaxed text-sm sm:text-base ${
                isDarkMode ? 'text-gray-300' : 'text-gray-600'
              }`}>
                We understand that every student has unique needs and abilities, that's why our curriculum is designed to adapt to your needs and help you grow!
                <br />
                Empowering educational institutions with comprehensive learning management solutions.
                <br /><br />
                <strong>Email:</strong> support@noteloom.in
              </p>
            </div>
            
            {/* Social Links */}
            <div>
              <h4 className="font-semibold mb-4">Let's get social ♡</h4>
              <div className="flex flex-wrap gap-3">
                {socialLinks.map((social) => (
                  <a
                    key={social.label}
                    href={social.href}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors ${
                      isDarkMode 
                        ? 'bg-gray-700 hover:bg-gray-600' 
                        : 'bg-gray-300 hover:bg-gray-400'
                    }`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Section - Links */}
          <div className="lg:col-span-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
              {/* Company Links */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Company</h4>
                <ul className="space-y-3">
                  {companyLinks.map((link) => (
                    <li key={link}>
                      <a href="#" className={`transition-colors text-sm sm:text-base ${
                        isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Our Services */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Our Services</h4>
                <ul className="space-y-3">
                  {ourServices.map((link) => (
                    <li key={link}>
                      <a href="#" className={`transition-colors text-sm sm:text-base ${
                        isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                      }`}>
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Administrators */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Administrators</h4>
                <ul className="space-y-3">
                  {administrators.map((link) => (
                    <li key={link}>
                      <Link 
                        to={link === "IT Login" ? "/it-login" : "#"}
                        className={`transition-colors text-sm sm:text-base ${
                          isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                        }`}
                      >
                        {link}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
              
              {/* Connect With Us */}
              <div>
                <h4 className="font-semibold mb-4 text-lg">Connect With Us</h4>
                <div className="space-y-2">
                  <a href="#" className={`block transition-colors text-sm sm:text-base ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}>
                    Email Us
                  </a>
                  <a href="#" className={`block transition-colors text-sm sm:text-base ${
                    isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'
                  }`}>
                    X (Twitter) Support
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Section */}
        <div className={`border-t pt-6 transition-colors duration-300 ${
          isDarkMode ? 'border-gray-700' : 'border-gray-300'
        }`}>
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className={`text-xs sm:text-sm flex items-center text-center md:text-left ${
              isDarkMode ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <span>© 2026 Note Loom. All rights reserved.</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 text-xs sm:text-sm">
              <a href="#" className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Terms & Conditions
              </a>
              <a href="#" className={`transition-colors ${isDarkMode ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}>
                Privacy Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;