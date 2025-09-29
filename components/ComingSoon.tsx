"use client";
import { useEffect, useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { Loader } from "lucide-react";
import Image from 'next/image';

const ComingSoon = () => {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [popupClosed, setPopupClosed] = useState(false);

  useEffect(() => {
    if (!popupClosed) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [popupClosed]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/coming-soon", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json();

      if (data.closePopup) {
        setPopupClosed(true);
      } else if (data.success) {
        toast.success("Thank you! Your email has been registered.");
      } else {
        setError(data.error || "Something went wrong.");
      }
      setEmail("");
    } catch (err) {
      console.error(err);
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (popupClosed) return null;

  return (
    <div className="fixed inset-0 bg-[url('/assets/slider.jpg')] bg-cover bg-center z-[9999] flex items-center justify-center">
      <div className="absolute inset-0 bg-[#020d16] opacity-80"></div>
      <Toaster position="bottom-center" reverseOrder={false} />
      <div className="relative z-10 text-center text-white">
        <div className="px-3">
          <img
            src="/logo/49962.png"
            alt="Urbanary Logo"
            className="w-[180px] mx-auto"
          />
          <h1 className="lg:text-5xl max-w-xl text-2xl font-semibold mt-4 mx-auto">
            Be the first to experience Urbanary.
          </h1>
          <p className="text-lg mt-4 max-w-xl mx-auto font-light">
            Join our waiting list today and get priority access to the website
            one day before the official launch.
          </p>
        </div>

        <div className="flex items-center justify-center mt-10 p-2">
          <form
            onSubmit={handleSubmit}
            className="flex flex-col md:flex-row items-stretch max-w-4xl w-full relative bg-white text-[#2b2b2b] rounded-lg md:rounded-full p-2"
          >
            <input
              type="text"
              placeholder="youremail@address.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`md:w-[70%] w-full outline-none px-5 py-4 rounded-lg md:rounded-full ${
                error ? "border border-red-500" : ""
              }`}
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading}
              className="w-full md:w-[30%] md:ml-2 px-5 py-4 mt-2 md:mt-0 rounded-lg md:rounded-full bg-urbanary text-white font-semibold flex items-center justify-center cursor-pointer"
            >
              {loading ? (
                <Loader className="w-5 h-5 animate-spin" />
              ) : (
                "Join Now"
              )}
            </button>
          </form>
        </div>

        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
        <p className="text-lg mt-4 max-w-xl mx-3 font-light">
          Everyone who signs up will receive early access. Your email will only
          be used for launch updates and kept strictly confidential.
        </p>
      </div>
    </div>
  );
};

export default ComingSoon;
