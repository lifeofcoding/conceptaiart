import Link from "next/link";
import Image from "next/image";
import { useState, useRef } from "react";
import { useRouter } from "next/router";

const Navbar = () => {
  const router = useRouter();
  const path = router.asPath;
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const toggleMenu = () => {
    setMenuOpen((curr) => !curr);
    if (menuRef.current) {
      menuRef.current.focus();
    }
  };

  const onBlur = () => {
    if (menuOpen) {
      // Work around: If we close menu too soon link click action is not triggered
      setTimeout(() => setMenuOpen(false), 0);
    }
  };

  return (
    <nav className="navbar sticky top-0 z-20">
      <div className="container mx-auto flex flex-wrap items-center justify-between">
        <div className="m-2 flex items-center text-white">
          <div className="mr-2">
            <Image
              src="/binary-code.png"
              alt="LifeTheCode.Life Logo"
              width={15}
              height={15}
            />
          </div>
          <span className="text-md font-semibold tracking-tight">
            LivingTheCode<span className="text-hot-pink">.</span>Life
          </span>
        </div>

        <div className="inline-flex justify-end md:hidden">
          <button
            className="m-2 rounded bg-indigo-500 p-1"
            onClick={toggleMenu}
          >
            <svg
              className="h-6 w-6"
              aria-hidden="true"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              ></path>
            </svg>
          </button>
        </div>

        <div className="w-full flex-grow md:w-auto">
          <input
            type="radio"
            value="home"
            id="home"
            name="nav-link"
            checked={path === "/"}
            readOnly
          />
          <input
            type="radio"
            value="projects"
            id="projects"
            name="nav-link"
            checked={path === "/projects"}
            readOnly
          />
          <input
            type="radio"
            value="projects"
            id="about"
            name="nav-link"
            checked={path === "/about"}
            readOnly
          />

          <div
            className={menuOpen ? "nav-wrapper open" : "nav-wrapper"}
            onBlur={onBlur}
            ref={menuRef}
            tabIndex={-1}
          >
            <Link href="/" className="nav-item">
              <label htmlFor="home">Home</label>
            </Link>
            <Link href="/projects" className="nav-item">
              <label htmlFor="projects">Projects</label>
            </Link>
            <Link href="/about" className="nav-item">
              <label htmlFor="about">About</label>
            </Link>
            <div className="nav-slider"></div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
