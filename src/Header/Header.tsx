import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import Logo from '../Assets/NewLogo3.png';

const navigationItems = [
  { name: 'Home', href: '/' },
  { name: 'Provider Login/Signup', href: '/login' },
  {
    name: 'Providers',
    dropdown: [
      { name: 'Find Providers', href: '/providers' },
      { name: 'Favorite Providers', href: '/favoriteproviders' }
    ]
  },
  {
    name: 'Resources',
    dropdown: [
      { name: 'Screening Tools', href: '/screening' },
      { name: 'What is ASD?', href: '/information' },
      { name: 'Useful Sites and Forms', href: '/resources' }
    ]
  },
  {
    name: 'Contact',
    dropdown: [
      { name: 'Message Us', href: '/contact' },
      { name: 'About', href: '/about' }
    ]
  }
];

const Header = () => {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
  
    return (
      <header className="fixed w-full top-0 z-50">
        <div className="w-full h-1.5 bg-[#ff6a00]" />
        
        <div className="bg-white border-b shadow-sm">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex justify-between items-center h-20">
              {/* Logo */}
              <Link to="/" className="flex-shrink-0">
                <img src={Logo} alt="Utah ABA Locator" className="h-14 w-auto" />
              </Link>
  
              {/* Desktop Navigation */}
              <nav className="hidden lg:flex items-center">
                <ul className="flex space-x-8 list-none m-0">
                  {navigationItems.map((item) => (
                    <li key={item.name} className="group relative">
                      {item.dropdown ? (
                        <div className="inline-flex items-center cursor-pointer">
                          <span className="text-[#ff6a00] hover:text-[#d84315] text-lg font-semibold">
                            {item.name}
                          </span>
                          <ChevronDown className="ml-1 h-5 w-5 text-[#ff5722]" />
                        </div>
                      ) : (
                        <Link
                          to={item.href}
                          className="text-[#ff6a00] hover:text-[#d84315] text-lg font-semibold no-underline"
                        >
                          {item.name}
                        </Link>
                      )}
  
                      {/* Dropdown Menu with rounded corners */}
                      {item.dropdown && (
                        <div className={`absolute ${item.name === 'Contact' ? 'right-0' : 'left-0'} 
                          mt-2 min-w-[200px] bg-white py-2 z-50 rounded-lg shadow-lg
                          invisible group-hover:visible opacity-0 group-hover:opacity-100 
                          transition-all duration-200 ease-in-out`}>
                          {item.dropdown.map((dropdownItem) => (
                            <Link
                              key={dropdownItem.name}
                              to={dropdownItem.href}
                              className="block px-4 py-2 text-[#ff6a00] hover:text-[#d84315] 
                                hover:bg-gray-50 text-base font-medium whitespace-nowrap
                                first:rounded-t-lg last:rounded-b-lg"
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
                className="lg:hidden p-2 relative w-10 h-10"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  {isMobileMenuOpen ? (
                    <div className="relative w-6 h-6">
                      <div className="absolute w-full h-0.5 bg-[#ff6a00] transform rotate-45 top-1/2"></div>
                      <div className="absolute w-full h-0.5 bg-[#ff6a00] transform -rotate-45 top-1/2"></div>
                    </div>
                  ) : (
                    <div className="w-6 space-y-1.5">
                      <div className="w-full h-0.5 bg-[#ff6a00]"></div>
                      <div className="w-full h-0.5 bg-[#ff6a00]"></div>
                      <div className="w-full h-0.5 bg-[#ff6a00]"></div>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>
        </div>
  
        {/* Mobile Menu */}
        <div 
          className={`lg:hidden bg-white transition-all duration-300 ease-in-out
            ${isMobileMenuOpen ? 'max-h-screen' : 'max-h-0'} overflow-hidden`}
        >
          <nav className="py-4">
            {navigationItems.map((item) => (
              <div key={item.name} className="text-left">
                {item.dropdown ? (
                  <div>
                    <button
                      onClick={() => setExpandedItem(expandedItem === item.name ? null : item.name)}
                      className="w-full flex items-center justify-between py-4 px-6
                        text-[#ff5722] text-xl font-bold hover:text-[#d84315]"
                    >
                      <span>{item.name}</span>
                      <ChevronDown 
                        className={`h-6 w-6 transform transition-transform duration-300
                          ${expandedItem === item.name ? 'rotate-180' : ''}`}
                      />
                    </button>
                    <div
                      className={`overflow-hidden transition-all duration-300 bg-gray-50
                        ${expandedItem === item.name ? 'max-h-96 py-2' : 'max-h-0'}`}
                    >
                      {item.dropdown.map((dropdownItem) => (
                        <Link
                          key={dropdownItem.name}
                          to={dropdownItem.href}
                          className="block py-3 px-12 text-[#ff5722] hover:text-[#d84315]
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
                    className="block py-4 px-6 text-[#ff5722] hover:text-[#d84315] 
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