"use client";
import { useEffect, useRef, useState } from "react";
import { Phone, MapPin, Heart, Star, BadgeCheck, CupSoda } from "lucide-react";
import Image from 'next/image';

const UrbanaryTestimonials = () => {
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const isDragging = useRef(false);
  const startX = useRef(0);
  const scrollStart = useRef(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const [isPaused, setIsPaused] = useState(false);

  const DIV_WIDTH_MOBILE = 350;
  const DIV_WIDTH_DESKTOP = 400;
  const GAP = 16;

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const handleStart = (x: number) => {
      isDragging.current = true;
      setIsPaused(true);
      startX.current = x - slider.offsetLeft;
      scrollStart.current = slider.scrollLeft;
    };

    const handleMove = (x: number) => {
      if (!isDragging.current) return;
      const walk = (x - startX.current) * 1.5;
      slider.scrollLeft = scrollStart.current - walk;
    };

    const handleEnd = () => {
      isDragging.current = false;
      setIsPaused(false);
    };

    slider.addEventListener("mousedown", (e) => handleStart(e.pageX));
    slider.addEventListener("mousemove", (e) => handleMove(e.pageX));
    slider.addEventListener("mouseup", handleEnd);
    slider.addEventListener("mouseleave", handleEnd);

    slider.addEventListener("touchstart", (e) =>
      handleStart(e.touches[0].pageX)
    );
    slider.addEventListener("touchmove", (e) => handleMove(e.touches[0].pageX));
    slider.addEventListener("touchend", handleEnd);

    return () => {
      slider.removeEventListener("mousedown", (e) => handleStart(e.pageX));
      slider.removeEventListener("mousemove", (e) => handleMove(e.pageX));
      slider.removeEventListener("mouseup", handleEnd);
      slider.removeEventListener("mouseleave", handleEnd);

      slider.removeEventListener("touchstart", (e) =>
        handleStart(e.touches[0].pageX)
      );
      slider.removeEventListener("touchmove", (e) =>
        handleMove(e.touches[0].pageX)
      );
      slider.removeEventListener("touchend", handleEnd);
    };
  }, []);

  useEffect(() => {
    const slider = scrollRef.current;
    if (!slider) return;

    const scrollNext = () => {
      if (isPaused) return;

      const maxScroll = slider.scrollWidth - slider.clientWidth;
      const scrollAmount =
        window.innerWidth < 768 ? DIV_WIDTH_MOBILE + GAP : DIV_WIDTH_DESKTOP + GAP;

      if (slider.scrollLeft + scrollAmount > maxScroll) {
        slider.scrollTo({ left: 0, behavior: "smooth" });
      } else {
        slider.scrollBy({ left: scrollAmount, behavior: "smooth" });
      }
    };

    intervalRef.current = setInterval(scrollNext, 3000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isPaused]);

  const cardClass =
    "flex-none min-h-[100px] rounded-lg flex flex-col items-center justify-center scroll-snap-start py-4 px-2 w-[350px] md:w-[400px]";

  const imageSrc = "https://netzoll.design/urbanary/assets/img/rest-3.jpg";
  const avatarSrc = "https://placehold.co/500x500";

  return (
    <div
      className="w-full max-w-6xl mx-auto overflow-hidden py-5"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div
        ref={scrollRef}
        className="flex overflow-x-auto scroll-smooth cursor-grab"
        style={{
          scrollSnapType: "x mandatory",
          scrollbarWidth: "none",
          msOverflowStyle: "none",
          userSelect: "none",
        }}
      >
        <style>
          {`
            div::-webkit-scrollbar {
              display: none;
            }
          `}
        </style>

        {[...Array(6)].map((_, idx) => (
          <div key={idx} className={`${cardClass} bg-white`}>
            <div className="bg-white rounded-xl shadow-md overflow-hidden relative w-full">
              <div className="relative">
                <img
                  src={imageSrc}
                  alt="Restaurant"
                  className="w-full h-56 object-cover"
                  draggable="false"
                />
                <div className="absolute top-3 left-3 flex items-center gap-2">
                  <span
                    className={`text-xs px-2 py-1 rounded uppercase ${
                      idx % 2 === 0 ? "bg-green-500 text-white" : "bg-red-500 text-white"
                    }`}
                  >
                    {idx % 2 === 0 ? "Open" : "Closed"}
                  </span>
                  <span className="bg-[#ffffff38] border-1 border-[#ffffff38] text-white hover:bg-white hover:text-urbanary font-semibold text-xs px-2 py-1 rounded">
                    £££
                  </span>
                  <span className="bg-[#ffffff38] border-1 border-[#ffffff38] text-white hover:bg-white hover:text-urbanary font-semibold text-xs px-2 py-1 rounded flex items-center gap-1">
                    <Star size={12} /> Featured
                  </span>
                </div>
                <div className="absolute bottom-3 right-3">
                  <button className="bg-[#ffffff1f] rounded-full p-2 shadow-md hover:bg-urbanary border-1 border-[#ffffff1f] cursor-pointer">
                    <Heart className="text-white" size={20} />
                  </button>
                </div>
                <div className="absolute -bottom-8 left-4 border-4 border-white rounded-full overflow-hidden w-[60px] h-[60px]">
                  <img src={avatarSrc} alt="Avatar" className="object-cover" draggable="false" />
                </div>
              </div>

              <div className="p-4 pt-8 mt-3">
                <h4 className="flex items-center gap-1 text-lg font-semibold">
                  The Restaurant
                  <BadgeCheck
                    className="text-white"
                    size={24}
                    stroke="#ffffff"
                    fill="#198754"
                  />
                </h4>
                <p className="text-gray-500 text-sm mt-1">
                  Cicero famously orated against his political.
                </p>
                <div className="flex gap-4 mt-3 text-black text-sm">
                  <div className="flex items-center gap-1">
                    <Phone size={16} /> <span>515 635 4758</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MapPin size={16} /> <span>2.4 miles</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between px-4 pb-4 pt-2">
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-2 py-1 text-sm">
                    <div className="bg-pink-100 rounded-full p-2">
                      <CupSoda size={20} className="text-pink-500" />
                    </div>
                    Restaurant
                  </div>
                  <span className="text-gray-500 text-sm border border-gray-200 p-2 rounded-full w-7 h-7 flex items-center justify-center">
                    +2
                  </span>
                </div>
                <div className="text-md font-semibold flex items-center gap-1">
                  <span className="bg-green-500 text-white px-2 py-1 rounded">4.5</span>{" "}
                  <span className="text-[#444c55] text-md font-normal">46 Reviews</span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default UrbanaryTestimonials;
