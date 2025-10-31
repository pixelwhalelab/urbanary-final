"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import NavigationBarMobile from "@/components/NavigationBarMobile";
import NavigationHeader from "@/components/NavigationHeader";
import { Search, MapPin, CalendarCheck, Eye } from "lucide-react";
import Image from "next/image";
import UrbanaryTestimonials from "@/components/UrbanaryTestimonials";
import FeaturedVenuesHome from "@/components/FeaturedVenuesHome";
import ComingSoon from "@/components/ComingSoon";
import { useAuth } from "@/app/hooks/useAuth";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState("");
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

  const handleHomeSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    if (loading) return;

    router.push(`/search?query=${encodeURIComponent(searchQuery)}`);
  };

  return (
    <>
    <ComingSoon />
      {/* Header */}
      <NavigationHeader />

      {/* Body */}

      <div className="relative bg-[url('/assets/slider.jpg')] bg-cover bg-center py-[120px]">
        <div className="absolute inset-0 bg-[#020d16] opacity-70"></div>
        <div className="relative z-10 text-center text-white">
          <div className="px-3">
            <h1 className="lg:text-5xl text-2xl font-semibold font-montserrat ">
              Discover Your City
            </h1>
            <p className="text-lg text-white mt-3 font-montserrat font-light">
              Find the best places to eat, drink, and explore around you.
            </p>
          </div>

          <div className="flex  items-center justify-center mt-10 p-2">
            <form
              onSubmit={handleHomeSearch}
              className="flex flex-col md:flex-row items-stretch max-w-4xl w-full relative border-2 border-[#efefef] bg-white text-[#2b2b2b] transition-all rounded-lg p-2 shadow-[0_0px_0px_10px_rgba(255,255,255,0.2)]"
            >
              <input
                type="text"
                placeholder={placeholders[index]}
                onChange={(e) => setSearchQuery(e.target.value)}
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
                className="w-full md:w-auto mt-2 md:mt-0 md:ml-2 px-5 py-4 rounded-lg cursor-pointer bg-urbanary font-semibold text-white flex items-center justify-center whitespace-nowrap"
              >
                <Search className="w-5 h-5 mr-2" /> Ask Urbanary
              </button>
            </form>
          </div>

          <p className="text-white text-lg font-semibold mt-10">
            Explore Popular Categories
          </p>
          <div className="flex space-x-3 items-center justify-center mt-5">
            <button className="px-3 py-1 rounded-full inline-flex cursor-pointer bg-white/15 border hover:bg-white hover:text-urbanary border-white/20 text-white">
              Bars
            </button>
            <button className="px-3 py-1 rounded-full inline-flex cursor-pointer bg-white/15 border hover:bg-white hover:text-urbanary border-white/20 text-white">
              Restaurants
            </button>
            <button className="px-3 py-1 rounded-full inline-flex cursor-pointer bg-white/15 border hover:bg-white hover:text-urbanary border-white/20 text-white">
              Pubs
            </button>
            <button className="px-3 py-1 rounded-full inline-flex cursor-pointer bg-white/15 border hover:bg-white hover:text-urbanary border-white/20 text-white">
              Nightlife
            </button>
          </div>
        </div>
      </div>

      {/* Featured Listings */}
      <div className="bg-white py-[80px] px-3 text-black">
        <h1 className="text-center lg:text-3xl text-2xl font-semibold">
          Feature <span className="text-urbanary">Listings</span>
        </h1>

        <p className="text-lg font-light flex items-center text-center justify-center mt-2">
          Find the best places
        </p>
        <FeaturedVenuesHome />
      </div>

      {/* Urbanary Testimonials */}

      <div className="bg-[#f7f7f7] py-[80px] px-3 text-black">
        <h1 className="text-center lg:text-3xl text-2xl font-semibold">
          What People <span className="text-urbanary">Say About Urbanary</span>
        </h1>

        <p className="text-lg font-light flex items-center text-center justify-center mt-2">
          Our community loves discovering the best of the city with Urbanary
        </p>
        <UrbanaryTestimonials />
      </div>

      {/* Urbanary Blogs */}
      <div className="bg-white py-[80px] px-3 text-black">
        <h1 className="text-center lg:text-3xl text-2xl font-semibold">
          Latest from <span className="text-urbanary">Urbanary</span>
        </h1>

        <p className="text-lg font-light flex items-center text-center justify-center mt-2">
          Discover stories, guides and updates about the best of city life
        </p>

        {/* Blog Section */}
        <div className="w-full max-w-6xl mx-auto grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-6 mt-10">
          {/* Blog Card 1 */}
          <div className="rounded-2xl shadow-md overflow-hidden bg-white flex flex-col">
            <img
              src="https://netzoll.design/urbanary/assets/img/blog-1.jpg"
              alt="Hidden Bars in Leeds"
              className="h-56 w-full object-cover"
            />
            <div className="p-5 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold">
                Top 10 Hidden Bars You Need to Try in Leeds
              </h2>
              <p className="text-gray-600 mt-2 flex-grow">
                From secret speakeasies to rooftop gems, here are the spots
                you’ll want to add to your weekend plans.
              </p>
              <button className="bg-[#93c6ef] text-urbanary mb-10 font-semibold px-4 py-2 rounded-full mt-5 w-fit hover:bg-urbanary hover:text-white transition cursor-pointer">
                Continue Reading
              </button>
              <div className="border-b-1 border-[#efefef]" />
              <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
                <span className="flex items-center gap-2 text-black">
                  <CalendarCheck className="w-5 h-5" /> 01 Mar 2025
                </span>
                <span className="flex items-center gap-2 ">
                  <Eye className="w-5 h-5" /> 2.1k Views
                </span>
              </div>
            </div>
          </div>

          {/* Blog Card 2 */}
          <div className="rounded-2xl shadow-md overflow-hidden bg-white flex flex-col">
            <img
              src="https://netzoll.design/urbanary/assets/img/blog-2.jpg"
              alt="Upcoming Events"
              className="h-56 w-full object-cover"
            />
            <div className="p-5 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold">
                Upcoming Events You Can’t Miss This Month
              </h2>
              <p className="text-gray-600 mt-2 flex-grow">
                Concerts, markets, art shows and more — here’s your roundup of
                what’s happening across the city.
              </p>
              <button className="bg-[#93c6ef] text-urbanary mb-10 font-semibold px-4 py-2 rounded-full mt-5 w-fit hover:bg-urbanary hover:text-white transition cursor-pointer">
                Continue Reading
              </button>
              <div className="border-b-1 border-[#efefef]" />
              <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
                <span className="flex items-center gap-2 text-black">
                  <CalendarCheck className="w-5 h-5" /> 01 Mar 2025
                </span>
                <span className="flex items-center gap-2 ">
                  <Eye className="w-5 h-5" /> 2.1k Views
                </span>
              </div>
            </div>
          </div>

          {/* Blog Card 3 */}
          <div className="rounded-2xl shadow-md overflow-hidden bg-white flex flex-col">
            <img
              src="https://netzoll.design/urbanary/assets/img/blog-3.jpg"
              alt="Urbanary Community"
              className="h-56 w-full object-cover"
            />
            <div className="p-5 flex flex-col flex-grow">
              <h2 className="text-xl font-semibold">
                Why Locals Love Using Urbanary
              </h2>
              <p className="text-gray-600 mt-2 flex-grow">
                Hear from our community about how Urbanary helps them discover,
                connect and make the most of city living.
              </p>
              <button className="bg-[#93c6ef] text-urbanary mb-10 font-semibold px-4 py-2 rounded-full mt-5 w-fit hover:bg-urbanary hover:text-white transition cursor-pointer">
                Continue Reading
              </button>
              <div className="border-b-1 border-[#efefef]" />
              <div className="flex justify-between items-center text-sm text-gray-600 mt-4">
                <span className="flex items-center gap-2 text-black">
                  <CalendarCheck className="w-5 h-5" /> 01 Mar 2025
                </span>
                <span className="flex items-center gap-2 ">
                  <Eye className="w-5 h-5" /> 2.1k Views
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
}
