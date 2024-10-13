"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import menuData from "./menuData";
import { getTopDisciplines } from "../getTopDisciplines";
import { getTopLocations } from "../getTopLocations";
import { getTopUniversities } from "../getTopUniversities";


// Custom hook to handle sticky navbar logic
const useStickyNavbar = () => {
  const [sticky, setSticky] = useState(false);

  useEffect(() => {
    const handleStickyNavbar = () => {
      setSticky(window.scrollY >= 80);
    };

    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  return sticky;
};

// Reusable AuthLinks component
const AuthLinks = () => (
  <>
    <Link href="/signin" className="text-lg font-medium text-dark hover:text-primary">
      Sign In
    </Link>
    <Link href="/signup" className="px-4 py-2 text-lg font-medium text-white bg-primary rounded-md hover:bg-opacity-90">
      Sign Up
    </Link>
  </>
);
// Reusable MenuItem component
const MenuItem = ({ item, openIndex, handleSubmenu, index, pathname, isMobile, onLinkClick }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleCollapse = () => {
    setIsOpen(!isOpen);
  };

  const handleClick = (e, path) => {
    if (path === pathname) {
      e.preventDefault(); // Prevent navigation if already on the page
    }
    onLinkClick(); // Close the mobile menu or submenu
  };

  if (item.submenu) {
    if (isMobile) {
      return (
        <div key={item.id} className="collapse collapse-plus border-base-300 bg-base-200 border mb-2">
          <input type="checkbox" checked={isOpen} onChange={toggleCollapse} className="peer" />
          <div className="collapse-title text-lg font-medium text-dark peer-checked:bg-primary peer-checked:text-white">
            {item.title}
          </div>
          <div className="collapse-content bg-white">
            <ul>
              {item.submenu.map((subItem) => (
                <li key={subItem.id}>
                  <Link href={subItem.path} className="block py-2 text-sm text-gray-700 hover:bg-gray-100" onClick={(e) => handleClick(e, subItem.path)}>
                    {subItem.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div >
      );
    } else {
      // Desktop dropdown behavior (keep existing code)
      return (
        <div key={item.id} className="relative group">
          <button
            onClick={() => handleSubmenu(index)}
            className="flex items-center text-lg font-medium text-dark hover:text-primary"
          >
            {item.title}
            <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
          <ul
            className={`absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 ${openIndex === index ? "block" : "hidden"}`}
          >
            {item.submenu.map((subItem) => (
              <li key={subItem.id}>
                <Link
                  href={subItem.path}
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={(e) => handleClick(e, subItem.path)} // Ensure this function is called
                >
                  {subItem.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      );
    }
  }
  const isCercaCorsi = item.title === "Cerca Corsi" && isMobile;
  const linkClasses = isCercaCorsi
    ? "flex items-center justify-between px-4 py-2 btn-lg text-lg font-medium text-white bg-primary rounded-xl hover:bg-opacity-90"
    : `text-lg font-medium ${pathname === item.path ? "text-primary" : "text-dark hover:text-primary"}`;

  return (
    <Link
      href={item.path}
      key={item.id}
      className={linkClasses}
      onClick={(e) => handleClick(e, item.path)}
    >
      {item.title}
      {isCercaCorsi && (
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-4.35-4.35m1.66-3.65a7 7 0
            11-14 0 7 7 0 0114 0z"
          />
        </svg>
      )}
    </Link>
  );
};

// Main Header component
const Header = ({ mobileMenuOpen, toggleMobileMenu }) => {
  const sticky = useStickyNavbar();
  const pathname = usePathname();
  const [menu, setMenu] = useState(menuData);
  const [openIndex, setOpenIndex] = useState(-1);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768); // Adjust breakpoint as needed
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    const fetchMenuData = async () => {
      const [topDisciplines, topLocations, topUniversities] = await Promise.all([
        getTopDisciplines(),
        getTopLocations(),
        getTopUniversities(),
      ]);

      setMenu((prevMenu) => {
        return prevMenu.map((item) => {
          if (item.title === "Discipline") {
            return { ...item, submenu: topDisciplines };
          } else if (item.title === "Città") {
            return { ...item, submenu: topLocations };
          } else if (item.title === "Università") {
            return { ...item, submenu: topUniversities };
          } else {
            return item;
          }
        });
      });
    };

    fetchMenuData();
  }, []);

  // Handle clicks outside of the dropdown to close the submenu
  const handleClickOutside = (e) => {
    if (!e.target.closest('.relative.group')) {
      setOpenIndex(-1);
    }
  };

  const handleLinkClick = () => {
    if (mobileMenuOpen) {
      toggleMobileMenu(); // Close the mobile menu
    }

    setOpenIndex(-1);
  }// Close the submenu
    ;


  useEffect(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  const handleSubmenu = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <header className={`w-full bg-white ${sticky ? "shadow-md" : ""} ${mobileMenuOpen ? "" : "fixed top-0 left-0 z-40"}`}>
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-20">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <Image
                src="/images/logo/online-learning.png"
                alt="Logo"
                width={40}
                height={40}
                className="mr-2"
              />
              <span className="font-extrabold text-xl">
                <span className="text-[#3e763d]">guida</span> <span className="text-[#1a3d1f]">universitaria</span>
              </span>
            </Link>
          </div>

          <div className="md:hidden flex items-center space-x-4">
            <AuthLinks />
            <button onClick={toggleMobileMenu} className="text-dark focus:outline-none">
              {mobileMenuOpen ? (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Menu */}
          <nav className={`hidden md:flex items-center space-x-8`}>
            {menu.map((item, index) => (
              <MenuItem
                key={item.id}
                item={item}
                openIndex={openIndex}
                handleSubmenu={handleSubmenu}
                index={index}
                pathname={pathname}
                isMobile={isMobile}
                onLinkClick={handleLinkClick}
              />
            ))}
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <AuthLinks />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="block md:hidden mt-4 transition-all duration-300 ease-in-out">
            <nav className="relative">
              {menu.map((item, index) => (
                <div key={item.id} className="py-2">
                  <MenuItem
                    item={item}
                    openIndex={openIndex}
                    handleSubmenu={handleSubmenu}
                    index={index}
                    pathname={pathname}
                    isMobile={isMobile}
                    onLinkClick={handleLinkClick}
                  />
                </div>
              ))}
            </nav>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;