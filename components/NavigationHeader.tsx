"use client";
import { useEffect, useState } from "react";
import { MapPin, CircleUserRound, Search, Menu, X, Power } from "lucide-react";
import NavigationBarMobile from "./NavigationBarMobile";
import Link from "next/link";
import { useAuth } from "@/app/hooks/useAuth";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Image from "next/image";

const NavigationHeader = () => {
  const router = useRouter();
  const { user, refreshUser, loading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);
  const closeMenu = () => setIsMenuOpen(false);

  const handleLogout = async () => {
    await fetch("/api/logout", { method: "POST", credentials: "include" });
    await refreshUser();
    router.push("/login");
    //onClose();
  };


  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="relative">
      {/* Header */}
      <div
        key={isScrolled ? 1 : 0}
        className={`flex w-full bg-white md:px-5 px-0 sticky top-0 z-40 slide-down-shadow ${
          isScrolled ? "slide-down" : ""
        }`}
      >
        <div className="w-1/2 md:p-4 p-2 flex items-center space-x-10">
          <Link href="/">
            <img
              src="/logo/logo.png"
              alt="Urbanary Logo"
              className="w-[180px]"
            />
          </Link>

          <div className="hidden md:flex space-x-5 font-semibold text-sm font-montserrat text-black">
            <span className="hover:text-urbanary cursor-pointer">Home</span>
            <span className="hover:text-urbanary cursor-pointer">Places</span>
            <span className="hover:text-urbanary cursor-pointer">About</span>
            <span className="hover:text-urbanary cursor-pointer">Contact</span>
          </div>
        </div>

        <div className="w-1/2 p-4 flex items-end justify-end mx-auto">
          {loading ? (
            <div className="hidden md:flex items-center text-sm text-gray-500 px-[25px] py-[15px]">
              <Loader2 className="animate-spin h-5 w-5" />
            </div>
          ) : user ? (
            <>
              <Link
                href="/dashboard"
                className="text-black py-[15px] px-[25px] rounded-lg text-sm font-semibold hidden md:flex items-center hover:text-urbanary"
              >
                <img
                  src={user.avatar || "/avatars/default.svg"}
                  alt={user.name}
                  className="w-5 h-5 mr-1 rounded-full"
                />
                {user.name}
              </Link>
              <button className="bg-urbanary text-white py-[15px] px-[25px] rounded-lg text-sm font-semibold cursor-pointer hidden md:flex items-center" onClick={handleLogout}>
                <Power className="w-5 h-5 mr-1" />
                Logout
              </button>
            </>
          ) : (
            <Link
              href="/login"
              className="text-black py-[15px] pl-[25px] rounded-lg text-sm font-semibold hidden md:flex items-center hover:text-urbanary"
            >
              <CircleUserRound className="w-5 h-5 mr-1" />
              Login / Sign Up
            </Link>
          )}

          <div className="flex md:hidden space-x-5">
            {user ? (
              <Link href="/dashboard">
                <img
                  src={user.avatar || "/avatars/default.svg"}
                  alt={user.name}
                  className="w-6 h-6 rounded-full cursor-pointer"
                />
              </Link>
            ) : (
              <Link href="/login">
                <CircleUserRound className="w-6 h-6 cursor-pointer text-black" />
              </Link>
            )}
            <Link href="/search">
              <Search className="w-6 h-6 cursor-pointer text-black" />
            </Link>

            <div onClick={toggleMenu}>
              {isMenuOpen ? (
                <X className="transform rotate-180 cursor-pointer text-black" />
              ) : (
                <Menu className="transform rotate-0 cursor-pointer text-black" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile */}
      <NavigationBarMobile isOpen={isMenuOpen} onClose={closeMenu} />
    </div>
  );
};

export default NavigationHeader;
