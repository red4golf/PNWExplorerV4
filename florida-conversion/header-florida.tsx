import { MapPin, Menu, X, Home, Upload, Settings } from "lucide-react";
import { useState } from "react";
import { Link, useLocation } from "wouter";

export function Header() {
  const [location] = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    if (path !== "/" && location.startsWith(path)) return true;
    return false;
  };

  const navItems = [
    { path: "/", label: "Map", icon: Home },
    { path: "/learn-more", label: "Learn More", icon: MapPin },
    { path: "/submit", label: "Submit Location", icon: Upload },
    { path: "/admin", label: "Admin", icon: Settings },
  ];

  return (
    <header className="bg-gradient-to-r from-orange-800 to-orange-600 text-white shadow-lg sticky top-0 z-50">
      {/* Beta Version Ribbon */}
      <div className="absolute top-0 right-0 bg-gradient-to-r from-yellow-400 to-orange-400 text-orange-900 px-3 py-1 text-xs font-bold transform rotate-12 translate-x-2 translate-y-2 shadow-md z-10">
        BETA VERSION
      </div>
      
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo/Title */}
          <Link href="/">
            <div className="flex items-center space-x-3 hover:opacity-80 transition-opacity cursor-pointer">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Florida Historical Explorer</h1>
                <p className="text-orange-100 text-xs hidden sm:block">
                  Discover the Sunshine State's Rich Heritage
                </p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-1">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link key={path} href={path}>
                <div
                  className={`px-4 py-2 rounded-md transition-colors duration-200 flex items-center space-x-2 ${
                    isActive(path)
                      ? "bg-orange-700 text-white"
                      : "text-orange-100 hover:bg-orange-700 hover:text-white"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{label}</span>
                </div>
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md hover:bg-orange-700 transition-colors"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-orange-500 py-4">
            <nav className="space-y-2">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link key={path} href={path}>
                  <div
                    className={`px-4 py-3 rounded-md transition-colors duration-200 flex items-center space-x-3 ${
                      isActive(path)
                        ? "bg-orange-700 text-white"
                        : "text-orange-100 hover:bg-orange-700 hover:text-white"
                    }`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="font-medium">{label}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}