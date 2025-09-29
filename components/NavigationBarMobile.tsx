"use client";
import { useEffect, useState } from "react";
import { MapPin, X } from "lucide-react";
import Link from "next/link";
import Image from 'next/image';

interface NavigationBarMobileProps {
  isOpen: boolean;
  onClose: () => void;
}

const NavigationBarMobile = ({ isOpen, onClose }: NavigationBarMobileProps) => {
  const [visible, setVisible] = useState(false);
  const [animateIn, setAnimateIn] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      const timeout = setTimeout(() => setAnimateIn(true), 20);
      return () => clearTimeout(timeout);
    } else {
      setAnimateIn(false);
      const timeout = setTimeout(() => setVisible(false), 800);
      return () => clearTimeout(timeout);
    }
  }, [isOpen]);

  if (!visible) return null;

  return (
    <div
      className="
        fixed top-0 left-0 w-full h-dvh z-50 md:hidden
        bg-[#1f1f1fcc]
      "
    >
      <div
        className={`
          w-[320px] bg-white h-full transform
          transition-transform duration-[800ms] ease-in-out
          ${animateIn ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        {/* Header */}
        <div className="flex py-2 px-3 items-center border-b border-gray-300">
          <div className="w-[70%]">
            <Link href="/">
            <img
              src="/logo/logo.png"
              alt="Urbanary Logo"
              className="w-[180px]"
            />
            </Link>
          </div>
          <div className="w-[30%] mx-auto flex justify-end h-full">
            <button
              onClick={onClose}
              className="p-2 rounded-full bg-[#93c6ef] inline-flex cursor-pointer"
            >
              <X strokeWidth={2} className="text-blue-950 w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Menu items */}
        <div className="font-montserrat font-semibold text-black">
          <p className="cursor-pointer py-2 border-b border-gray-300 px-5 hover:text-urbanary transition-colors">
            Home
          </p>
          <p className="cursor-pointer py-2 border-b border-gray-300 px-5 hover:text-urbanary transition-colors">
            Places
          </p>
          <p className="cursor-pointer py-2 border-b border-gray-300 px-5 hover:text-urbanary transition-colors">
            About
          </p>
          <p className="cursor-pointer py-2 border-b border-gray-300 px-5 hover:text-urbanary transition-colors">
            Contact
          </p>

          <div className="m-3">
            <button className="bg-[#93c6ef] text-blue-900 hover:bg-urbanary hover:text-white py-[15px] px-[25px] rounded-lg text-sm font-semibold text-center cursor-pointer w-full flex items-center justify-center transition-all duration-400 ease-in-out">
              <MapPin className="w-5 h-5 mr-1" />
              Add Your Business
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavigationBarMobile;
