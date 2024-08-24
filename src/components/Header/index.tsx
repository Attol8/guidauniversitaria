"use client"
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import ThemeToggler from "./ThemeToggler";
import menuData from "./menuData";

import { db } from "../../../firebaseConfig";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";

const getTopDisciplines = async (limitCount = 10) => {
  try {
    const disciplinesRef = collection(db, 'disciplines');
    const q = query(disciplinesRef, orderBy('coursesCounter', 'desc'), limit(limitCount));
    const snapshot = await getDocs(q);

    console.log(`Fetched ${snapshot.docs.length} disciplines`);

    return snapshot.docs.map((doc, index) => {
      const data = doc.data();
      console.log(`Discipline ${index + 1}:`, data);
      return {
        id: index + 1,
        title: doc.id,
        path: `/disciplines/${doc.id}`,
        newTab: false
      };
    });
  } catch (error) {
    console.error("Error fetching top disciplines:", error);
    return [];
  }
};

const Header = () => {
  const [navbarOpen, setNavbarOpen] = useState(false);
  const [sticky, setSticky] = useState(false);
  const [menu, setMenu] = useState(menuData);

  const navbarToggleHandler = () => {
    setNavbarOpen(!navbarOpen);
  };

  const handleStickyNavbar = () => {
    if (window.scrollY >= 80) {
      setSticky(true);
    } else {
      setSticky(false);
    }
  };

  useEffect(() => {
    window.addEventListener("scroll", handleStickyNavbar);
    return () => {
      window.removeEventListener("scroll", handleStickyNavbar);
    };
  }, []);

  const [openIndex, setOpenIndex] = useState(-1);
  const handleSubmenu = (index) => {
    if (openIndex === index) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(index);
    }
  };

  const usePathName = usePathname();

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

  return (
    <>
      <header
        className={`header left-0 top-0 z-40 flex w-full items-center mx-auto ${sticky
          ? "dark:bg-gray-dark dark:shadow-sticky-dark fixed z-[9999] bg-white !bg-opacity-80 shadow-sticky backdrop-blur-sm transition"
          : "absolute bg-transparent"
          }`}
      >
        <div className="container mx-auto flex justify-between items-center px-4">
          <div className="logo-container flex items-center flex-col py-4">
            <Link href="/" className="flex items-center flex-col text-center">
              <Image
                src="/images/logo/online-learning.png"
                alt="Logo"
                width={50}
                height={15}
                className="relative"
              />
              <span style={{ fontFamily: '"Manrope", sans-serif', fontWeight: 800, fontSize: '20px' }}>
                <span style={{ color: '#3e763d' }}>guida </span>
                <span style={{ color: '#1a3d1f' }}>universitaria</span>
              </span>
            </Link>
          </div>

          <div className="flex-grow flex justify-center px-4">
            <nav
              id="navbarCollapse"
              className={`navbar w-full lg:w-auto lg:flex lg:items-center lg:justify-center lg:space-x-12 ${navbarOpen ? "block" : "hidden lg:block"
                }`}
            >
              <ul className="flex flex-col lg:flex-row lg:space-x-12">
                {menu.map((menuItem, index) => (
                  <li key={index} className="group relative">
                    {menuItem.path ? (
                      <Link
                        href={menuItem.path}
                        className={`flex py-2 text-base lg:mr-0 lg:inline-flex lg:px-0 lg:py-6 ${usePathName === menuItem.path
                          ? "text-primary dark:text-white"
                          : "text-dark hover:text-primary dark:text-white/70 dark:hover:text-white"
                          }`}
                      >
                        {menuItem.title}
                      </Link>
                    ) : (
                      <>
                        <p
                          onClick={() => handleSubmenu(index)}
                          className="flex cursor-pointer items-center justify-between py-2 text-base text-dark group-hover:text-primary dark:text-white/70 dark:group-hover:text-white lg:mr-0 lg:inline-flex lg:px-0 lg:py-6"
                        >
                          {menuItem.title}
                          <span className="pl-3">
                            <svg width="25" height="24" viewBox="0 0 25 24">
                              <path
                                fillRule="evenodd"
                                clipRule="evenodd"
                                d="M6.29289 8.8427C6.68342 8.45217 7.31658 8.45217 7.70711 8.8427L12 13.1356L16.2929 8.8427C16.6834 8.45217 17.3166 8.45217 17.7071 8.8427C18.0976 9.23322 18.0976 9.86639 17.7071 10.2569L12 15.964L6.29289 10.2569C5.90237 9.86639 5.90237 9.23322 6.29289 8.8427Z"
                                fill="currentColor"
                              />
                            </svg>
                          </span>
                        </p>
                        <div
                          className={`submenu relative left-0 top-full rounded-sm bg-white transition-[top] duration-300 group-hover:opacity-100 dark:bg-dark lg:invisible lg:absolute lg:top-[110%] lg:block lg:w-[250px] lg:p-4 lg:opacity-0 lg:shadow-lg lg:group-hover:visible lg:group-hover:top-full ${openIndex === index ? "block" : "hidden"
                            }`}
                        >
                          {menuItem.submenu && menuItem.submenu.length > 0 ? (
                            menuItem.submenu.map((submenuItem, subIndex) => (
                              <Link
                                href={submenuItem.path}
                                key={subIndex}
                                className="block rounded py-2.5 text-sm text-dark hover:text-primary dark:text-white/70 dark:hover:text-white lg:px-3"
                              >
                                {submenuItem.title}
                              </Link>
                            ))
                          ) : (
                            <p className="block rounded py-2.5 text-sm text-dark dark:text-white/70 lg:px-3">
                              Loading disciplines...
                            </p>
                          )}
                        </div>
                      </>
                    )}
                  </li>
                ))}
              </ul>
            </nav>
          </div>
          <div className="w-auto pr-4 flex items-center justify-end">
            <Link
              href="/signin"
              className="hidden px-7 py-3 text-base font-medium text-dark hover:opacity-70 dark:text-white md:block"
            >
              Sign In
            </Link>
            <Link
              href="/signup"
              className="ease-in-up shadow-btn hover:shadow-btn-hover hidden rounded-sm bg-primary px-8 py-3 text-base font-medium text-white transition duration-300 hover:bg-opacity-90 md:block md:px-9 lg:px-6 xl:px-9"
            >
              Sign Up
            </Link>
            <div>
              <ThemeToggler />
            </div>
            <button
              onClick={navbarToggleHandler}
              id="navbarToggler"
              aria-label="Mobile Menu"
              className="ml-4 lg:hidden"
            >
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${navbarOpen ? " top-[7px] rotate-45" : ""
                  }`}
              />
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${navbarOpen ? "opacity-0" : ""
                  }`}
              />
              <span
                className={`relative my-1.5 block h-0.5 w-[30px] bg-black transition-all duration-300 dark:bg-white ${navbarOpen ? " top-[-8px] -rotate-45" : ""
                  }`}
              />
            </button>
          </div>
        </div>
      </header>
    </>
  );
};

export default Header;
