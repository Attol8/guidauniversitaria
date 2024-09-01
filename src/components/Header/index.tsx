"use client";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import menuData from "./menuData";
import { getTopDisciplines } from "../getTopDisciplines";

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

// Custom hook to manage mobile menu state
const useMobileMenu = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return { mobileMenuOpen, toggleMobileMenu };
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
const MenuItem = ({ item, openIndex, handleSubmenu, index, pathname }) => {
  if (item.submenu) {
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
          className={`absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 ${openIndex === index ? "block" : "hidden"
            }`}
        >
          {item.submenu.map((subItem) => (
            <li key={subItem.id}>
              <Link href={subItem.path} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                {subItem.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <Link
      href={item.path}
      key={item.id}
      className={`text-lg font-medium ${pathname === item.path ? "text-primary" : "text-dark hover:text-primary"
        }`}
    >
      {item.title}
    </Link>
  );
};

// Main Header component
const Header = () => {
  const sticky = useStickyNavbar();
  const { mobileMenuOpen, toggleMobileMenu } = useMobileMenu();
  const pathname = usePathname();
  const [menu, setMenu] = useState(menuData);
  const [openIndex, setOpenIndex] = useState(-1);

  useEffect(() => {
    const fetchDisciplines = async () => {
      const topDisciplines = await getTopDisciplines();
      setMenu((prevMenu) => {
        return prevMenu.map((item) =>
          item.title === "Courses by Discipline"
            ? { ...item, submenu: topDisciplines }
            : item
        );
      });
    };

    fetchDisciplines();
  }, []);

  // Handle clicks outside of the dropdown to close the submenu
  const handleClickOutside = (e) => {
    if (!e.target.closest('.relative.group')) {
      setOpenIndex(-1);
    }
  };

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
    <header className={`fixed left-0 top-0 z-40 w-full bg-white ${sticky ? "shadow-md" : ""}`}>
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
              />
            ))}
          </nav>
          <div className="hidden md:flex items-center space-x-4">
            <AuthLinks />
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="block md:hidden mt-4">
            <nav>
              {menu.map((item, index) => (
                <div key={item.id}>
                  <MenuItem
                    item={item}
                    openIndex={openIndex}
                    handleSubmenu={handleSubmenu}
                    index={index}
                    pathname={pathname}
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
