import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Logo from "../Assets/FinalLogo.png";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Provider Login",
    dropdown: [
      { name: "Provider Login", href: "/login" },
      { name: "Provider Signup", href: "/signup" },
    ],
  },
  {
    name: "Providers",
    dropdown: [
      { name: "Find Providers", href: "/providers" },
      { name: "Favorite Providers", href: "/favoriteproviders" },
    ],
  },
  { 
    name: "Help Us Grow", 
    href: "/donate",
    isSpecial: true
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

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <header className="fixed w-full top-0 z-50 max-w-[100vw]">
      <div className="bg-white border-b shadow-sm relative px-1">
        <div className="w-full box-border justify-evenly">
          <div className="flex justify-between items-center h-24 w-full">
            <Link to="/" className="flex-shrink-0">
              <img
                src={Logo}
                alt="Autism Services Locator Logo"
                className="h-[8rem] lg:h-[12rem] w-[200px] max-w-[280px] lg:max-w-[200px]  object-contain"
              />
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center">
              <ul className="flex space-x-8 list-none m-0">
                {navigationItems.map((item) => (
                  <li key={item.name} className="group relative">
                    {item.dropdown ? (
                      <div className="inline-flex items-center cursor-pointer">
                        <span className="text-[#332d29] hover:text-[#4A6FA5] xl:text-lg lg:text-base font-semibold">
                          {item.name}
                        </span>
                        <ChevronDown className="ml-1 h-5 w-5 text-[#332d29]" />
                      </div>
                    ) : (
                      <Link
                        to={item.href}
                        className={`xl:text-lg lg:text-base font-semibold no-underline ${
                          item.isSpecial 
                            ? 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 transform hover:scale-105' 
                            : 'text-[#332d29] hover:text-[#4A6FA5]'
                        }`}
                      >
                        {item.name}
                      </Link>
                    )}

                    {/* Dropdown Menu */}
                    {item.dropdown && (
                      <div
                        className={`absolute ${item.name === "Contact" ? "right-0" : "left-0"
                          } 
                            mt-2 w-48 bg-white py-2 rounded-lg shadow-lg z-[60]
                            invisible group-hover:visible opacity-0 group-hover:opacity-100 
                            transition-all duration-200 ease-in-out`}
                      >
                        {item.dropdown.map((dropdownItem) => (
                          <Link
                            key={dropdownItem.name}
                            to={dropdownItem.href}
                            className="block px-4 py-2 text-[#332d29] hover:text-[#4A6FA5] 
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
                  className={`w-6 h-6 relative transition-all duration-300 ${isMobileMenuOpen ? "rotate-180" : "rotate-0"
                    }`}
                >
                  <div
                    className={`absolute w-full h-0.5 bg-[#332d29] transition-all duration-300 
                      ${isMobileMenuOpen ? "rotate-45 top-1/2" : "rotate-0 top-0"}`}
                  />
                  <div
                    className={`absolute w-full h-0.5 bg-[#332d29] top-1/2 transition-all duration-300 
                      ${isMobileMenuOpen ? "opacity-0" : "opacity-100"}`}
                  />
                  <div
                    className={`absolute w-full h-0.5 bg-[#332d29] transition-all duration-300 
                      ${isMobileMenuOpen ? "-rotate-45 top-1/2" : "rotate-0 top-full"}`}
                  />
                </div>
              </div>
            </button>
          </div>
        </div>
      </div>
      {/* <div className="w-full h-[.2em] bg-[#544d49]" /> */}

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
                          text-[#332d29] text-xl font-bold bg-transparent border-0"
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
                        className="block py-3 px-12 text-[#332d29] hover:text-[#4A6FA5]
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
                  className={`block py-4 px-6 text-xl font-bold no-underline ${
                    item.isSpecial 
                      ? 'bg-gradient-to-r from-green-500 to-green-600 text-white mx-4 rounded-lg shadow-md text-center' 
                      : 'text-[#332d29] hover:text-[#4A6FA5]'
                  }`}
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