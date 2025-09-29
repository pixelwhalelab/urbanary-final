"use client";
import { useEffect, useState } from "react";
import {
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  MapPin,
  PhoneOutgoing,
  Send,
} from "lucide-react";
import Image from 'next/image';

const Footer = () => {
  return (
    <>
      <div className="bg-[#f5d236] bg-[url('/assets/brand-section.png')] bg-cover bg-center py-12 px-1 md:px-10">
        <div className="flex flex-col lg:flex-row w-full">
          <div className="lg:w-1/2 items-center justify-start px-4 w-full">
            <h4 className="text-white font-semibold text-2xl">
              Subscribe Our Newsletter!
            </h4>
            <p className="text-white test-sm py-1">
              Subscribe our marketing platforms for latest updates
            </p>
          </div>

          <div className="lg:w-1/2 items-center justify-start lg:justify-end px-4 w-full lg:mt-0 mt-5">
            <form className="lg:w-[80%] w-full relative border-2 border-[#fff3] bg-[#ffffff1a] text-white transition-all rounded-full">
              <input
                type="email"
                placeholder="Your Email Here..."
                className="w-full resize-none outline-none bg-transparent text-base px-5 py-5 pr-16 transition-all scrollbar-none"
              />

              <button
                type="submit"
                className="absolute flex cursor-pointer bottom-2 right-2 px-4 py-3 rounded-full bg-white font-semibold text-black"
              >
                <Send className="w-5 h-5 mr-2" /> Subscribe
              </button>
            </form>
          </div>
        </div>
      </div>

      <footer className="bg-[#212529] py-20 px-1 md:px-10">
        <div className="container mx-auto p-4">
          <div className="flex flex-wrap lg:flex-nowrap gap-4">
            <div className="w-full lg:w-[40%]">
              <img
                src="/logo/49962.png"
                alt="Urbanary Logo"
                className="max-w-[180px]"
              />
              <p className="text-[#fafafab3] my-5 font-montserrat font-light">
                &copy; Urbanary{" "}
                {new Date().toLocaleString("en-GB", {
                  timeZone: "Europe/London",
                  year: "numeric",
                })}{" "}
                • Discover Your City
              </p>
              <div className="flex space-x-3">
                <button
                  onClick={() =>
                    window.open(
                      "https://www.facebook.com/profile.php?id=61579643593745",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="p-2 rounded-full bg-[#383b3f] hover:bg-white transition-colors duration-400 inline-flex cursor-pointer"
                >
                  <Facebook
                    strokeWidth={2}
                    className="text-white hover:text-urbanary transition-colors duration-400 w-5 h-5"
                  />
                </button>

                <button
                  onClick={() =>
                    window.open(
                      "https://www.instagram.com/urbanaryleeds/",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="p-2 rounded-full bg-[#383b3f] hover:bg-white transition-colors duration-400 inline-flex cursor-pointer"
                >
                  <Instagram
                    strokeWidth={2}
                    className="text-white hover:text-urbanary transition-colors duration-400 w-5 h-5"
                  />
                </button>

                <button
                  onClick={() =>
                    window.open(
                      "https://www.tiktok.com/@urbanaryleeds",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="p-2 rounded-full bg-[#383b3f] hover:bg-white transition-colors duration-400 inline-flex cursor-pointer"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 448 512"
                    className="text-white hover:text-urbanary transition-colors duration-400 w-5 h-5"
                    fill="currentColor"
                  >
                    <path d="M448,209.9a210,210,0,0,1-122.77-39.28v130.4a115.63,115.63,0,1,1-99-114.25v84.43a30.31,30.31,0,1,0,24,29.74V0h90.46a121.41,121.41,0,0,0,2.1,22.17A121,121,0,0,0,448,122.41Z" />
                  </svg>
                </button>

                <button
                  onClick={() =>
                    window.open(
                      "https://www.linkedin.com/company/urbanary/",
                      "_blank",
                      "noopener,noreferrer"
                    )
                  }
                  className="p-2 rounded-full bg-[#383b3f] hover:bg-white transition-colors duration-400 inline-flex cursor-pointer"
                >
                  <Linkedin
                    strokeWidth={2}
                    className="text-white hover:text-urbanary transition-colors duration-400 w-5 h-5"
                  />
                </button>
              </div>
            </div>

            <div className="w-full lg:w-[60%] grid grid-cols-2 mt-5 lg:mt-0 gap-4 lg:grid-cols-4 text-white">
              <div>
                <p className="uppercase text-white pb-2">Community</p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  About Urbanary
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Join the Community
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Urbanary Report
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Careers
                </p>
              </div>
              <div>
                <p className="uppercase text-white pb-2">Getting Started</p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Trust & Safety
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Partnerships
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Community Guidelines
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Terms of Service
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Advertising Options
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Urbanary Blog
                </p>
              </div>
              <div>
                <p className="uppercase text-white pb-2">For Businesses</p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Urbanary for Business
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Advertise with Us
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Business Login
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Claim Your Page
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Support for Partners
                </p>
                <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer py-1">
                  Venue Management
                </p>
              </div>
              <div>
                <p className="uppercase text-white pb-2">Get In Touch</p>
                <div className="flex w-full pb-2">
                  <div className="w-1/4 pb-2">
                    <button className="p-2 rounded-full bg-[#383b3f] inline-flex cursor-pointer">
                      <MapPin
                        strokeWidth={2}
                        className="text-urbanary w-5 h-5"
                      />
                    </button>
                  </div>
                  <div className="w-3/4">
                    <p className="text-white">
                      Urbanary HQ, Leeds United Kingdom
                    </p>
                    <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer text-sm py-1">
                      Visit Us
                    </p>
                  </div>
                </div>

                <div className="flex w-full">
                  <div className="w-1/4 pb-2">
                    <button className="p-2 rounded-full bg-[#383b3f] inline-flex">
                      <PhoneOutgoing
                        strokeWidth={2}
                        className="text-urbanary w-5 h-5"
                      />
                    </button>
                  </div>
                  <div className="w-3/4">
                    <p className="text-white">+44 (0)113 123 4567</p>
                    <p className="text-[#fafafab3] focus:text-white hover:text-white cursor-pointer text-sm py-1">
                      Mon - Fri 9am - 6PM
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
};

export default Footer;
