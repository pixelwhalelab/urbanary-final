"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Footer from "@/components/Footer";
import NavigationHeader from "@/components/NavigationHeader";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/app/hooks/useAuth";
import ComingSoon from "@/components/ComingSoon";

const VenueCategoryPage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [message, setMessage] = useState<string | null>(null);
  const [messageType, setMessageType] = useState<"success" | "error" | null>(
    null
  );
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  if (loading || (!user && !loading)) {
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f7f7]">
        <Loader2 className="w-8 h-8 animate-spin text-urbanary" />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    setMessage(null);
    setMessageType(null);

    try {
      const res = await fetch("/api/venue-category", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage("✅ Category added successfully!");
        setMessageType("success");
        setCategory("");
      } else {
        setMessage(`${data.message || "Failed to add category."}`);
        setMessageType("error");
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong!");
      setMessageType("error");
    }
  };

  return (
    <>
      {/* Header */}
      <NavigationHeader />

      <div className="bg-[#f7f7f7] bg-[url('/assets/slider.jpg')] bg-cover bg-center px-4 py-15 flex items-center justify-center text-black">
        <div className="w-lg px-4 py-10 bg-white rounded-lg shadow-md">
          <p className="text-center text-2xl sm:text-2xl md:text-4xl font-semibold font-montserrat">
            Venue Category
          </p>

          <form className="space-y-4 mt-3 px-4" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Category
              </label>
              <input
                name="category"
                type="text"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Enter category name"
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded focus:border-urbanary focus:ring-urbanary outline-none transition"
              />
            </div>

            {message && (
              <p
                className={`text-sm font-medium ${
                  messageType === "success" ? "text-green-600" : "text-red-600"
                }`}
              >
                {message}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-urbanary text-white font-semibold py-3 px-4 rounded transition hover:bg-urbanary/90 cursor-pointer"
            >
              Add Category
            </button>
          </form>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </>
  );
};

export default VenueCategoryPage;
