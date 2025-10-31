"use client";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import Footer from "@/components/Footer";
import NavigationBarMobile from "@/components/NavigationBarMobile";
import NavigationHeader from "@/components/NavigationHeader";
import Image from "next/image";
import { useAuth } from "@/app/hooks/useAuth";
import {
  Search,
  MapPin,
  Phone,
  Heart,
  Star,
  BadgeCheck,
  CupSoda,
} from "lucide-react";
import ComingSoon from "@/components/ComingSoon";

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

const SearchPage = () => {
  const imageSrc = "./assets/default.jpg";
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
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const searchParams = useSearchParams();
  const queryParam = searchParams.get("query") || "";

  const [searchQuery, setSearchQuery] = useState(queryParam);
  const [autoSearchDone, setAutoSearchDone] = useState(false);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [loadingSearch, setLoadingSearch] = useState(false);
  const [intro, setIntro] = useState("");
  const [history, setHistory] = useState<string[]>([]);

  const hasRunRef = useRef(false);

  const [randomLine, setRandomLine] = useState<string | null>(null);

  const lines = [
    "Step into the flavor of your city — from cozy cafés and lively eateries to hidden gems waiting to be discovered. Find new spots to eat, unwind, and make every outing special.",
    "Looking for something different? Discover restaurants, venues, and experiences that match your vibe. Whether it’s brunch with friends or dinner for two, your next favorite place is just around the corner.",
    "Taste, explore, and connect with your city like never before. Find local favorites, trending hangouts, and unique venues that turn everyday moments into memorable experiences.",
    "Explore your city effortlessly — uncover handpicked restaurants, buzzing venues, and hidden gems made for food lovers, explorers, and everyone in between.",
    "From coffee runs to dinner dates — explore the heart of your city one bite, one place, and one memory at a time.",
    "Discover where locals love to eat, relax, and celebrate. Your next favorite restaurant or hidden spot might be closer than you think.",
    "Craving something new? Explore trending eateries, charming spots, and local favorites that bring your city’s flavor to life.",
    "Find the perfect place for every mood — from quiet brunch corners to vibrant night-out destinations, your city has it all.",
    "Uncover the spirit of your city through food, culture, and connection. Every search leads to a new experience worth sharing.",
    "Eat, explore, and enjoy — discover the restaurants, venues, and spaces that make your city truly unforgettable.",
  ];

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * lines.length);
    setRandomLine(lines[randomIndex]);
  }, []);

  useEffect(() => {
    if (user) return;
    const storedRaw = localStorage.getItem("urbanary_free_searches");
    const stored = storedRaw ? JSON.parse(storedRaw) : null;
    const now = Date.now();
    const sixMonths = 1000 * 60 * 60 * 24 * 182;

    if (stored && stored.count >= 5 && now - stored.timestamp < sixMonths) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (!queryParam || autoSearchDone || hasRunRef.current) return;

    hasRunRef.current = true;

    const runSearch = async () => {
      await handleSearch(undefined, queryParam);
      setAutoSearchDone(true);
    };

    runSearch();
  }, [queryParam]);

  const handleSearch = async (e?: React.FormEvent, queryText?: string) => {
    if (e) e.preventDefault();

    const query = queryText || searchQuery;
    if (!query.trim()) return;
    if (loadingSearch) return;

    if (!user) {
      try {
        const storedRaw = localStorage.getItem("urbanary_free_searches");
        const stored = storedRaw ? JSON.parse(storedRaw) : null;

        const now = Date.now();
        const sixMonths = 1000 * 60 * 60 * 24 * 182;

        if (
          !stored ||
          !stored.timestamp ||
          now - stored.timestamp > sixMonths
        ) {
          localStorage.setItem(
            "urbanary_free_searches",
            JSON.stringify({ count: 1, timestamp: now })
          );
          console.log("Started new 6-month free search counter: 1");
        } else {
          const currentCount = stored.count || 0;

          if (currentCount >= 5) {
            setVenues([]);
            setIntro("");
            router.replace("/login");
            return;
          }

          localStorage.setItem(
            "urbanary_free_searches",
            JSON.stringify({
              count: currentCount + 1,
              timestamp: stored.timestamp,
            })
          );

          console.log(`Free search #${currentCount + 1} recorded`);
        }
      } catch (err) {
        console.error("Error managing free searches:", err);
        localStorage.setItem(
          "urbanary_free_searches",
          JSON.stringify({ count: 1, timestamp: Date.now() })
        );
      }
    }
    setIntro("");
    setLoadingSearch(true);
    setHistory((prev) => [query, ...prev.filter((h) => h !== query)]);

    try {
      const res = await fetch("/api/urbanary-ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: query }),
      });

      const data = await res.json();

      setIntro(data.reply || "");

      const venuesWithDesc: Venue[] = (data.venues || []).map((v: any) => ({
        name: v.name || "",
        description: v.description || "No description available",
        image: v.image || "",
        logo: v.logo || "",
        pricing: v.pricing || "",
        openStatus: v.openStatus || "",
        category: v.category || "",
        phone: v.phone || "",
        rating: v.rating || 0,
        reviews: v.reviews || 0,
        map: v.map || "",
      }));

      setVenues(venuesWithDesc);
    } catch (err) {
      console.error("Error fetching venues:", err);
      setVenues([]);
      setIntro("");
    } finally {
      setLoadingSearch(false);
    }
  };

  return (
    <>
      {/* Header */}
      <ComingSoon />
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
              disabled={loadingSearch}
              className={`w-full md:w-auto mt-2 md:mt-0 md:ml-2 px-5 py-4 rounded-lg cursor-pointer bg-urbanary font-semibold text-white flex items-center justify-center whitespace-nowrap ${
                loadingSearch ? "opacity-50 cursor-not-allowed" : ""
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
            <div className="hidden lg:block w-full md:w-[30%]">
              <div className="border border-gray-300 rounded-xl p-4 m-2 h-[320px] flex flex-col">
                <div className="flex items-center justify-between px-4 py-3 text-sm bg-urbanary text-white rounded w-full mb-3">
                  <p className="font-semibold">Search History</p>
                  <button
                    className={`text-xs cursor-pointer px-2 py-1 rounded transition 
    ${
      user
        ? "text-white hover:text-gray-200"
        : "text-gray-300 cursor-not-allowed opacity-60"
    }`}
                    onClick={() => user && router.push("/search-history")}
                    disabled={!user}
                  >
                    View All
                  </button>
                </div>

                <div
                  className={`relative flex-1 space-y-2 pr-1 custom-scrollbar text-left ${
                    user ? "overflow-y-auto" : "overflow-hidden"
                  }`}
                >
                  <span className="block px-4 py-3 text-sm bg-[#f7f7f7] text-black hover:bg-[#93c6ef] hover:text-urbanary rounded w-full cursor-pointer">
                    Best coffee shops near me
                  </span>
                  <span className="block px-4 py-3 text-sm bg-[#f7f7f7] text-black hover:bg-[#93c6ef] hover:text-urbanary rounded w-full cursor-pointer">
                    Live music venues in Leeds
                  </span>
                  <span className="block px-4 py-3 text-sm bg-[#f7f7f7] text-black hover:bg-[#93c6ef] hover:text-urbanary rounded w-full cursor-pointer">
                    Family-friendly restaurants nearby
                  </span>
                  <span className="block px-4 py-3 text-sm bg-[#f7f7f7] text-black hover:bg-[#93c6ef] hover:text-urbanary rounded w-full cursor-pointer">
                    Rooftop bars in Leeds
                  </span>
                  <span className="block px-4 py-3 text-sm bg-[#f7f7f7] text-black hover:bg-[#93c6ef] hover:text-urbanary rounded w-full cursor-pointer">
                    Vegan spots around Leeds
                  </span>
                  {!user && (
                    <motion.div
                      className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex flex-col items-center justify-center text-center p-6"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.4 }}
                    >
                      <p className="text-gray-800 font-semibold mb-4">
                        Login / Signup to view your Search History
                      </p>
                      <div className="flex gap-3">
                        <button
                          onClick={() => router.push("/login")}
                          className="px-4 py-2 bg-urbanary text-white text-sm rounded-lg hover:bg-urbanary/90 transition cursor-pointer"
                        >
                          Login
                        </button>
                        <button
                          onClick={() => router.push("/signup")}
                          className="px-4 py-2 bg-white text-urbanary border cursor-pointer border-urbanary text-sm rounded-lg hover:bg-urbanary/10 transition"
                        >
                          Signup
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>
            </div>

            {/* Right 70% */}
            <div className="w-full md:w-[70%] mx-auto rounded px-4 mt-5">
              {intro && <p className="text-black mb-5">{intro}</p>}

              {loadingSearch ? (
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
                <motion.p
                  className="text-center text-black mt-5 max-w-2xl mx-auto leading-relaxed text-base md:text-lg"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                >
                  {randomLine || ""}
                </motion.p>
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

export default SearchPage;
