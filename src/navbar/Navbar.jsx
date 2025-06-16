import { useState, useEffect, useRef } from 'react';
import { Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';
import { useLocation, Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const headerRef = useRef(null);

  const navLinks = [
    { name: 'Home', href: '#home' },
    { name: 'About', href: '#about' },
    { name: 'Events', href: '#events' },
    { name: 'Gallery', href: '#gallery' },
    { name: 'Enquiry', href: '#contact' },
    { name: 'Payment', href: '/payment' },
    { name: 'Login', href: '/login' },
  ];

  // Handle navigation with proper scroll behavior
  const handleNavigation = (href, event) => {
    if (href.startsWith('#')) {
      event.preventDefault();
      const sectionId = href.substring(1);
      
      if (location.pathname !== '/') {
        navigate(`/${href}`);
      } else {
        window.history.pushState(null, null, href);
        // Define scrollToSection here or move it inside useEffect
        const element = document.getElementById(sectionId);
        if (element) {
          const headerHeight = headerRef.current ? headerRef.current.offsetHeight - 64 : 0;
          const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
          const offsetPosition = elementPosition - headerHeight;

          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
      }
    }
    setMobileMenuOpen(false);
  };

  // Handle hash links on page load
  useEffect(() => {
    const scrollToSection = (id) => {
      const element = document.getElementById(id);
      if (element) {
        const headerHeight = headerRef.current ? headerRef.current.offsetHeight - 64 : 0;
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - headerHeight;

        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    };

    if (location.hash) {
      const id = location.hash.substring(1);
      setTimeout(() => {
        scrollToSection(id);
      }, 100);
    }
  }, [location]);

  return (
    <header className="bg-black text-white sticky top-0 z-50" ref={headerRef}>
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          <span className="text-purple-500">DJ</span> Jeff Jackson
        </Link>
        
        {/* Desktop Navigation */}
        <div className="hidden md:flex space-x-8">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.href.startsWith('#') && location.pathname !== '/' ? `/${link.href}` : link.href}
              onClick={(e) => handleNavigation(link.href, e)}
              className="hover:text-purple-400 transition duration-300"
            >
              {link.name}
            </Link>
          ))}
        </div>
        
        {/* Mobile menu button */}
        <div className="md:hidden">
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="text-white focus:outline-none"
          >
            {mobileMenuOpen ? (
              <XMarkIcon className="h-6 w-6" />
            ) : (
              <Bars3Icon className="h-6 w-6" />
            )}
          </button>
        </div>
      </nav>
      
      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-gray-900 px-6 py-4">
          <div className="flex flex-col space-y-4">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.href.startsWith('#') && location.pathname !== '/' ? `/${link.href}` : link.href}
                onClick={(e) => handleNavigation(link.href, e)}
                className="text-white hover:text-purple-400 transition duration-300"
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}