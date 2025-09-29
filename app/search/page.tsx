"use client";
import { useEffect, useState } from "react";
import Footer from "@/components/Footer";
import NavigationBarMobile from "@/components/NavigationBarMobile";
import NavigationHeader from "@/components/NavigationHeader";
import Image from "next/image";
import {
  Search,
  MapPin,
  Phone,
  Heart,
  Star,
  BadgeCheck,
  CupSoda,
} from "lucide-react";

interface Venue {
  name: string;
  description: string;
  image: string;
  logo?: string;
  pricing?: string;
  openStatus?: string;
  category?: string;
  phone?: string;
  rating?: number;
  reviews?: number;
  map?: string;
}

const page = () => {
  const imageSrc = "https://netzoll.design/urbanary/assets/img/rest-3.jpg";
  const avatarSrc = "https://placehold.co/500x500";
  const placeholders = [
    "Best places to eat in Leeds",
    "Top bars and pubs near you",
    "Hidden gems in Leeds city centre",
    "Things to do this weekend",
  ];
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % placeholders.length);
    }, 3000);

    return () => clearInterval(interval);
  }, []);
  const [searchQuery, setSearchQuery] = useState("");
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loading, setLoading] = useState(false);
  const [intro, setIntro] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIntro("");

    setLoading(true);
    setHistory((prev) => [
      searchQuery,
      ...prev.filter((h) => h !== searchQuery),
    ]);
    try {
      const res = await fetch("/api/urbanary-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: searchQuery }),
      });
      const data = await res.json();

      setIntro(data.reply || "");

      const flattenedVenues: Venue[] = Object.values(data.venues)
        .flat()
        .map((v) => v as Venue);

      setVenues(flattenedVenues);
    } catch (err) {
      console.error("Error fetching venues:", err);
      setVenues([]);
      setIntro("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Header */}
      <NavigationHeader />

      {/* Body */}
      <div>
        {/* Section */}
        <div className="relative bg-[url('/assets/slider.jpg')] bg-cover bg-center py-[120px]">
          <div className="absolute inset-0 bg-[#020d16] opacity-70"></div>
          <div className="relative z-10 text-white max-w-6xl mx-auto">
            <div className="px-3">
              <h1 className="lg:text-5xl text-2xl font-semibold font-montserrat">
                Find Your Urbanary Space
              </h1>
              <p className="text-lg text-white mt-3 font-montserrat font-light">
                Discover the best places in the city.
              </p>
            </div>
          </div>
        </div>

        {/* Search Engine */}
        <div className="absolute left-1/2 -translate-x-1/2 mt-[-50px] z-10 flex items-center justify-center w-full px-2">
          <form
            onSubmit={handleSearch}
            className="flex flex-col md:flex-row items-stretch max-w-4xl w-full relative border-2 border-[#efefef] bg-white text-[#2b2b2b] transition-all rounded-lg p-2 shadow-[0_0px_0px_10px_rgba(255,255,255,0.2)]"
          >
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find Best Restaurants"
              className="md:w-[70%] w-full resize-none outline-none bg-transparent text-base px-5 py-4 transition-all scrollbar-none border-1 border-[#efefef] rounded-lg"
            />

            <div className="relative md:w-[30%] w-full mt-2 md:mt-0 md:ml-2">
              <select
                className="appearance-none w-full px-5 py-4 pr-12 border border-[#efefef] rounded-lg outline-none cursor-pointer bg-white"
                defaultValue="Leeds"
              >
                <option value="Leeds">Leeds</option>
                <option
                  disabled
                  value="Manchester"
                  className="bg-gray-200 text-black"
                >
                  Manchester (Coming Soon)
                </option>
                <option
                  disabled
                  value="Newcastle"
                  className="bg-gray-200 text-black"
                >
                  Newcastle (Coming Soon)
                </option>
                <option
                  disabled
                  value="Liverpool"
                  className="bg-gray-200 text-black"
                >
                  Liverpool (Coming Soon)
                </option>
                <option
                  disabled
                  value="Sheffield"
                  className="bg-gray-200 text-black"
                >
                  Sheffield (Coming Soon)
                </option>
              </select>
              <MapPin className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500 pointer-events-none" />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full md:w-auto mt-2 md:mt-0 md:ml-2 px-5 py-4 rounded-lg cursor-pointer bg-urbanary font-semibold text-white flex items-center justify-center whitespace-nowrap ${
                loading ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              <Search className="w-5 h-5 mr-2" /> Ask Urbanary
            </button>
          </form>
        </div>

        {/* SERP Area */}
        <div className="bg-white max-w-6xl mx-auto py-20 mt-25 md:mt-0">
          <div className="flex flex-col md:flex-row w-full gap-4">
            {/* Left 30% */}
            <div className="w-full md:w-[30%] ">
              <div className="block border-1 border-gray-400 rounded p-4 m-2">
                <p className="uppercase text-black font-montserrat font-bold mb-3 text-sm">
                  Search History
                </p>
                <span className="block px-4 py-3 text-sm bg-urbanary text-white rounded w-full text-center cursor-pointer">
                  Best pizza place in Leeds
                </span>
                <div className="space-y-2 mt-3">
                  <span className="block px-4 py-3 text-sm bg-[#f7f7f7] text-black hover:bg-[#93c6ef] hover:text-urbanary rounded w-full text-center cursor-pointer">
                    Best pizza place in Leeds
                  </span>
                  <span className="block px-4 py-3 text-sm bg-[#f7f7f7] text-black hover:bg-[#93c6ef] hover:text-urbanary rounded w-full text-center cursor-pointer">
                    Best pizza place in Leeds
                  </span>
                  <span className="block px-4 py-3 text-sm bg-[#f7f7f7] text-black hover:bg-[#93c6ef] hover:text-urbanary rounded w-full text-center cursor-pointer">
                    Best pizza place in Leeds
                  </span>
                  <span className="block px-4 py-3 text-sm bg-[#f7f7f7] text-black hover:bg-[#93c6ef] hover:text-urbanary rounded w-full text-center cursor-pointer">
                    Best pizza place in Leeds
                  </span>
                </div>
              </div>
            </div>

            {/* Right 70% */}
            <div className="w-full md:w-[70%] mx-auto rounded px-4 mt-5">
              {/* Intro paragraph always shows if intro has content */}
              {intro && <p className="text-black mb-5">{intro}</p>}

              {loading ? (
                <p className="text-center text-black">Loading venues...</p>
              ) : venues.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {venues.map((venue, idx) => (
                    <div
                      key={idx}
                      className="bg-white rounded-xl shadow-md overflow-hidden relative"
                    >
                      <div className="relative">
                        <img
                          src={venue.image || imageSrc}
                          alt={venue.name}
                          className="w-full h-56 object-cover"
                          draggable="false"
                        />
                        <div className="absolute top-3 left-3 flex items-center gap-2">
                          <span
                            className={`text-xs px-2 py-1 rounded uppercase ${
                              venue.openStatus === "Open"
                                ? "bg-green-500 text-white"
                                : venue.openStatus === "Closing soon"
                                ? "bg-yellow-500 text-white"
                                : "bg-red-500 text-white"
                            }`}
                          >
                            {venue.openStatus || "Unknown"}
                          </span>
                          {venue.pricing && (
                            <span className="bg-[#ffffff38] border-1 border-[#ffffff38] text-white font-semibold text-xs px-2 py-1 rounded">
                              {venue.pricing}
                            </span>
                          )}
                          {venue.category && (
                            <span className="bg-[#ffffff38] border-1 border-[#ffffff38] text-white font-semibold text-xs px-2 py-1 rounded flex items-center gap-1">
                              <Star size={12} /> {venue.category}
                            </span>
                          )}
                        </div>
                        <div className="absolute bottom-3 right-3">
                          <button className="bg-[#ffffff1f] rounded-full p-2 shadow-md hover:bg-urbanary cursor-pointer">
                            <Heart className="text-white" size={20} />
                          </button>
                        </div>
                        <div className="absolute -bottom-8 left-4 border-4 border-white rounded-full overflow-hidden w-[60px] h-[60px]">
                          <img
                            src={venue.logo || avatarSrc}
                            alt={venue.name + " logo"}
                            className="object-cover bg-indigo-300 p-4"
                            draggable="false"
                          />
                        </div>
                      </div>

                      <div className="p-4 pt-8 mt-3">
                        <h4 className="flex items-center gap-1 text-lg font-semibold">
                          {venue.name}
                          <BadgeCheck
                            className="text-white"
                            size={24}
                            stroke="#ffffff"
                            fill="#198754"
                          />
                        </h4>
                        <p className="text-gray-500 text-sm mt-1">
                          {venue.description}
                        </p>
                        <div className="flex gap-4 mt-3 text-black text-sm">
                          {venue.phone && (
                            <div className="flex items-center gap-1">
                              <Phone size={16} /> <span>{venue.phone}</span>
                            </div>
                          )}
                          {venue.map && (
                            <div className="flex items-center gap-1">
                              <MapPin size={16} />{" "}
                              <a
                                href={venue.map}
                                target="_blank"
                                rel="noreferrer"
                              >
                                Map
                              </a>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between px-4 pb-4 pt-2">
                        <div className="flex items-center gap-2">
                          <div className="flex items-center gap-2 py-1 text-sm">
                            <div className="bg-pink-100 rounded-full p-2">
                              <CupSoda size={20} className="text-pink-500" />
                            </div>
                            {venue.category || "Other"}
                          </div>
                        </div>
                        <div className="text-md font-semibold flex items-center gap-1">
                          <span className="bg-green-500 text-white px-2 py-1 rounded">
                            {venue.rating || "-"}
                          </span>{" "}
                          <span className="text-[#444c55] text-md font-normal">
                            {venue.reviews || 0} Reviews
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                // Show this only if not loading and no venues
                <p className="text-center text-black"></p>
              )}
            </div>
          </div>
        </div>
      </div>
      {/* Footer */}
      <Footer />
    </>
  );
};

export default page;
