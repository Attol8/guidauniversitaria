"use client"
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import menuData from "./menuData";
import { getTopDisciplines } from "../getTopDisciplines";

const Header = () => {
  const [sticky, setSticky] = useState(false);
  const [menu, setMenu] = useState(menuData);
  const [openIndex, setOpenIndex] = useState(-1);
  const pathname = usePathname();

  const handleStickyNavbar = () => {
    setSticky(window.scrollY >= 80);
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  useEffect(() => {
    const fetchDisciplines = async () => {
      const topDisciplines = await getTopDisciplines();
      setMenu((prevMenu) => {
        return prevMenu.map(item =>
          item.title === "Courses by Discipline"
            ? { ...item, submenu: topDisciplines }
            : item
        );
      });
    };

    fetchDisciplines();
  }, []);

  const handleSubmenu = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <header
      className={`fixed left-0 top-0 z-40 w-full bg-white ${sticky ? "shadow-md" : ""
        }`}
    >
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
                <span className="text-[#3e763d]">guida</span>{" "}
                <span className="text-[#1a3d1f]">universitaria</span>
              </span>
            </Link>
          </div>

          <nav className="hidden md:flex items-center space-x-8">
            {menu.map((item, index) => (
              <div key={item.id} className="relative group">
                {item.submenu ? (
                  <>
                    <button
                      onClick={() => handleSubmenu(index)}
                      className="flex items-center text-lg font-medium text-dark hover:text-primary"
                    >
                      {item.title}
                      <svg className="w-4 h-4 ml-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                    <ul className={`absolute left-0 mt-2 w-48 bg-white shadow-lg rounded-md py-2 ${openIndex === index ? 'block' : 'hidden'}`}>
                      {item.submenu.map((subItem) => (
                        <li key={subItem.id}>
                          <Link
                            href={subItem.path}
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            {subItem.title}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </>
                ) : (
                  <Link
                    href={item.path}
                    className={`text-lg font-medium ${pathname === item.path
                      ? "text-primary"
                      : "text-dark hover:text-primary"
                      }`}
                  >
                    {item.title}
                  </Link>
                )}
              </div>
            ))}
          </nav>

          <div className="flex items-center space-x-4">
            <Link
              href="/signin"
              className="text-lg font-medium text-dark hover:text-primary"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="px-4 py-2 text-lg font-medium text-white bg-primary rounded-md hover:bg-opacity-90"
            >
              Sign Up
            </Link>

          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;