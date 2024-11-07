import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Logo from "../Assets/NewLogo3.png";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Provider Login/Signup", href: "/login" },
  {
    name: "Providers",
    dropdown: [
      { name: "Find Providers", href: "/providers" },
      { name: "Favorite Providers", href: "/favoriteproviders" },
    ],
  },
  {
    name: "Resources",
    dropdown: [
      { name: "Screening Tools", href: "/screening" },
      { name: "What is ASD?", href: "/information" },
      { name: "Useful Sites and Forms", href: "/resources" },
    ],
  },
  {
    name: "Contact",
    dropdown: [
      { name: "Message Us", href: "/contact" },
      { name: "About", href: "/about" },
    ],
  },
];

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [isTransitioning, setIsTransitioning] = useState(false);
  
    const handleMobileMenuToggle = () => {
      setIsTransitioning(true);
      setIsMobileMenuOpen(!isMobileMenuOpen);
      setTimeout(() => setIsTransitioning(false), 300);
    };
  
    return (
      <header className="fixed w-full top-0 z-50 max-w-[100vw]">
        <div className="bg-white border-b shadow-sm relative">
          <div className="max-w-7xl mx-auto px-4 w-full box-border">
            <div className="flex justify-between items-center h-22 w-full">
              <Link to="/" className="flex-shrink-0">
                <img
                  src={Logo}
                  alt="Utah ABA Locator"
                  className="h-[5.6rem] w-auto max-w-[200px] object-contain"
                />
              </Link>
  
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center">
                <ul className="flex space-x-8 list-none m-0">
                  {navigationItems.map((item) => (
                    <li key={item.name} className="group relative">
                      {item.dropdown ? (
                        <div className="inline-flex items-center cursor-pointer">
                          <span className="text-[#ff6a00] hover:text-[#d84315] xl:text-lg lg:text-base font-semibold">
                            {item.name}
                          </span>
                          <ChevronDown className="ml-1 h-5 w-5 text-[#ff6a00]" />
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          className="text-[#ff6a00] hover:text-[#d84315] xl:text-lg lg:text-base font-semibold no-underline"
                        >
                          {item.name}
                        </Link>
                      )}
  
                      {/* Dropdown Menu */}
                      {item.dropdown && (
                        <div
                          className={`absolute ${
                            item.name === "Contact" ? "right-0" : "left-0"
                          } 
                            mt-2 w-48 bg-white py-2 rounded-lg shadow-lg z-[60]
                            invisible group-hover:visible opacity-0 group-hover:opacity-100 
                            transition-all duration-200 ease-in-out`}
                        >
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.href}
                              className="block px-4 py-2 text-[#ff5722] hover:text-[#d84315] 
                                  hover:bg-gray-50 xl:text-base lg:text-sm font-medium whitespace-nowrap no-underline"
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </li>
                  ))}
                </ul>
              </nav>
  
              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-2 relative w-10 h-10 bg-transparent border-0"
                onClick={handleMobileMenuToggle}
                aria-label="Toggle menu"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <div
                    className={`w-6 h-6 relative transition-all duration-300 ${
                      isMobileMenuOpen ? "rotate-180" : "rotate-0"
                    }`}
                  >
                    <div
                      className={`absolute w-full h-0.5 bg-[#ff6a00] transition-all duration-300 
                      ${isMobileMenuOpen ? "rotate-45 top-1/2" : "rotate-0 top-0"}`}
                    />
                    <div
                      className={`absolute w-full h-0.5 bg-[#ff6a00] top-1/2 transition-all duration-300 
                      ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}
                    />
                    <div
                      className={`absolute w-full h-0.5 bg-[#ff6a00] transition-all duration-300 
                      ${isMobileMenuOpen ? "-rotate-45 top-1/2" : "rotate-0 top-full"}`}
                    />
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
        <div className="w-full h-[.2em] bg-[#ff6a00]" />
  
        {/* Mobile Menu */}
        <div
          className={`lg:hidden bg-white transition-all duration-300 ease-in-out w-full
              ${isMobileMenuOpen ? "max-h-[calc(100vh-6rem)] opacity-100" : "max-h-0 opacity-0"} 
              overflow-y-auto overflow-x-hidden`}
        >
          <nav className="py-4 max-w-full">
            {navigationItems.map((item) => (
              <div key={item.name} className="text-left w-full">
                {item.dropdown ? (
                  <div className="w-full">
                    <button
                      onClick={() =>
                        setExpandedItem(expandedItem === item.name ? null : item.name)
                      }
                      className="w-full flex items-center justify-between py-4 px-6
                          text-[#ff6a00] text-xl font-bold bg-transparent border-0"
                    >
                      <span>{item.name}</span>
                      <ChevronDown
                        className={`h-6 w-6 transform transition-transform duration-300
                            ${expandedItem === item.name ? "rotate-180" : ""}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300
                          ${expandedItem === item.name ? "max-h-96" : "max-h-0"}`}
                    >
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          to={dropdownItem.href}
                          className="block py-3 px-12 text-[#ff6a00] hover:text-[#d84315]
                              text-lg font-semibold no-underline"
                          onClick={() => setIsMobileMenuOpen(false)}
                        >
                          {dropdownItem.name}
                        </Link>
                      ))}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={item.href}
                    className="block py-4 px-6 text-[#ff6a00] hover:text-[#d84315] 
                        text-xl font-bold no-underline"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
            ))}
          </nav>
        </div>
      </header>
    );
};

export default Header;