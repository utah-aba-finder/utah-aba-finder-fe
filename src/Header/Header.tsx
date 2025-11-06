import React, { useState } from "react";
import { Link } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import Logo from "../Assets/FinalLogo.png";
import "./Header.css";

const navigationItems = [
  { name: "Home", href: "/" },
  { name: "Provider Login",
    dropdown: [
      { name: "Provider Login", href: "/login" },
      { name: "Provider Signup", href: "/provider-signup" },
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
    name: "Become a Sponsor", 
    href: "/sponsor",
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
  const [hoverTimeout, setHoverTimeout] = useState<NodeJS.Timeout | null>(null);

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleMouseEnter = (itemName: string) => {
    if (hoverTimeout) {
      clearTimeout(hoverTimeout);
      setHoverTimeout(null);
    }
    setExpandedItem(itemName);
  };

  const handleMouseLeave = () => {
    const timeout = setTimeout(() => {
      setExpandedItem(null);
    }, 300); // Increased to 300ms delay before closing
    setHoverTimeout(timeout);
  };

  // Get navigation items (no authentication logic needed)
  const currentNavigationItems = navigationItems;

  return (
    <header className="fixed w-full top-0 z-50 max-w-[100vw]">
      <div className="bg-white border-b shadow-sm relative px-2">
        <div className="w-full box-border">
          <div className="flex justify-between items-center h-24 w-full px-6 pr-12 max-w-7xl mx-auto">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="block">
                <img
                  src={Logo}
                  alt="Autism Services Locator Logo"
                  className="h-24 w-auto object-contain max-w-[320px] lg:h-28"
                />
              </Link>
            </div>

            {/* Desktop Navigation - Hidden on mobile */}
            <nav className="hidden lg:flex items-center space-x-5 header-nav">
              {currentNavigationItems.map((item) => (
                <div key={item.name} className="relative group flex items-center">
                  {item.dropdown ? (
                    <div 
                      className="relative"
                      onMouseEnter={() => handleMouseEnter(item.name)}
                      onMouseLeave={handleMouseLeave}
                    >
                      <button
                        className="dropdown-button text-[#332d29] hover:text-[#4A6FA5] px-3 py-3 text-lg font-bold transition-colors duration-200 bg-transparent border-0 hover:bg-gray-50 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-300 flex items-center"
                        style={{ 
                          border: 'none', 
                          outline: 'none', 
                          backgroundColor: 'transparent',
                          boxShadow: 'none',
                          borderRadius: '6px',
                          cursor: 'pointer'
                        }}
                      >
                        {item.name}
                        <ChevronDown className="inline-block ml-2 h-4 w-4" />
                      </button>
                      {expandedItem === item.name && (
                        <div 
                          className={`absolute mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200 ${
                            item.name === "Contact" ? "right-0" : "left-0"
                          }`}
                        >
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.href}
                              className="block px-4 py-2 text-[#332d29] hover:text-[#4A6FA5] hover:bg-gray-50 text-base font-semibold no-underline transition-colors duration-150"
                            >
                              {dropdownItem.name}
                            </Link>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={item.href}
                      className={`text-lg font-bold no-underline transition-all duration-200 flex items-center ${
                        item.isSpecial 
                          ? 'bg-gradient-to-r from-green-500 to-green-600 text-white px-3 py-3 rounded-lg shadow-md hover:from-green-600 hover:to-green-700 hover:shadow-lg transform hover:scale-105' 
                          : 'text-[#332d29] hover:text-[#4A6FA5] px-3 py-3 hover:bg-gray-50 rounded-md'
                      }`}
                      style={{ 
                        textDecoration: 'none',
                        border: 'none',
                        outline: 'none',
                        backgroundColor: 'transparent',
                        boxShadow: 'none'
                      }}
                    >
                      {item.name}
                    </Link>
                  )}
                </div>
              ))}
            </nav>

            {/* Mobile Menu Button - Visible only on mobile */}
            <button
              className="lg:hidden p-6 relative w-12 h-12 bg-transparent border-0 hover:bg-gray-100 rounded-md transition-colors duration-200 z-10 mr-2"
              onClick={handleMobileMenuToggle}
              aria-label="Toggle menu"
            >
              <div className="absolute inset-0 flex items-center justify-center">
                <div
                  className={`w-6 h-6 relative transition-all duration-300 ${isMobileMenuOpen ? "rotate-180" : "rotate-0"}`}
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

       {/* Mobile Menu */}
       <div
         className={`lg:hidden bg-white transition-all duration-300 ease-in-out w-full absolute top-24 left-0 z-40
               ${isMobileMenuOpen ? "max-h-[calc(100vh-6rem)] opacity-100" : "max-h-0 opacity-0"} 
               overflow-y-auto overflow-x-hidden shadow-lg`}
       >
         <nav className="py-4 max-w-full">
           {currentNavigationItems.map((item) => (
             <div key={item.name} className="text-left w-full">
               {item.dropdown ? (
                 <div className="w-full">
                   <button
                     onClick={() =>
                       setExpandedItem(expandedItem === item.name ? null : item.name)
                     }
                     className="dropdown-button w-full flex items-center justify-between py-4 px-6
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