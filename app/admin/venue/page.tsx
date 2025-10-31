"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import Footer from "@/components/Footer";
import NavigationHeader from "@/components/NavigationHeader";
import { useAuth } from "@/app/hooks/useAuth";
import ComingSoon from "@/components/ComingSoon";

const daysOfWeek = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
];

function to24Hour(timeStr: string): string {
  if (!timeStr) return "";
  const match = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i);
  if (!match) return "";
  let hours = parseInt(match[1]);
  const minutes = match[2] ? parseInt(match[2]) : 0;
  const period = match[3].toUpperCase();
  if (period === "PM" && hours < 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
}

function normalizeDayName(dayStr: string) {
  const map: Record<string, string> = {
    mon: "monday",
    monday: "monday",
    tue: "tuesday",
    tues: "tuesday",
    tuesday: "tuesday",
    wed: "wednesday",
    wednesday: "wednesday",
    thu: "thursday",
    thur: "thursday",
    thurs: "thursday",
    thursday: "thursday",
    fri: "friday",
    friday: "friday",
    sat: "saturday",
    saturday: "saturday",
    sun: "sunday",
    sunday: "sunday",
  };
  const lower = dayStr.toLowerCase().trim();
  return map[lower] || lower;
}

const VenuePage = () => {
  const { user, loading } = useAuth();
  const router = useRouter();

  const [formData, setFormData] = useState<Record<string, any>>({});
  const [categories, setCategories] = useState<string[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [places, setPlaces] = useState<any[]>([]);
  const [loadingPlaces, setLoadingPlaces] = useState(false);
  const [categorySearch, setCategorySearch] = useState("");
  const filteredCategories = categories.filter((cat) =>
    cat.toLowerCase().includes(categorySearch.toLowerCase())
  );

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  useEffect(() => {
    const fetchCategories = async () => {
      setLoadingCategories(true);
      try {
        const res = await fetch("/api/venue-category");
        const data = await res.json();
        if (data.success) {
          setCategories(data.data.map((c: any) => c.category));
        }
      } catch (error) {
        console.error("Failed to fetch categories:", error);
      } finally {
        setLoadingCategories(false);
      }
    };
    fetchCategories();
  }, []);

  const handlePlaceSearch = async (text: string) => {
    setSearchText(text);
    if (text.trim().length < 3) {
      setPlaces([]);
      return;
    }
    setLoadingPlaces(true);
    try {
      const res = await fetch(`/api/places?query=${encodeURIComponent(text)}`);
      const data = await res.json();
      if (data.success) setPlaces(data.places);
      else setPlaces([]);
    } catch (err) {
      console.error("Google search error:", err);
    } finally {
      setLoadingPlaces(false);
    }
  };

  const handleImport = async (place: any) => {
    try {
      setMessage("Importing from Google Places...");
      const res = await fetch(`/api/places/details?place_id=${place.place_id}`);
      const data = await res.json();
      if (data.success && data.place) {
        const p = data.place;
        const newFormData: Record<string, any> = {};
        if (p.opening_hours?.weekday_text) {
          p.opening_hours.weekday_text.forEach((line: string) => {
            const parts = line.split(":");
            const dayRaw = parts[0] || "";
            const hoursRaw = parts.slice(1).join(":").trim();
            const day = normalizeDayName(dayRaw);
            if (hoursRaw.toLowerCase().includes("closed")) {
              newFormData[`${day}Closed`] = true;
              newFormData[`${day}Open`] = "";
              newFormData[`${day}Close`] = "";
            } else {
              const match = hoursRaw.match(
                /(\d{1,2}(:\d{2})?\s*[APap][Mm])\s*[–-]\s*(\d{1,2}(:\d{2})?\s*[APap][Mm])/
              );
              if (match) {
                newFormData[`${day}Closed`] = false;
                newFormData[`${day}Open`] = to24Hour(match[1]);
                newFormData[`${day}Close`] = to24Hour(match[3]);
              }
            }
          });
        }
        daysOfWeek.forEach((day) => {
          const d = day.toLowerCase();
          if (!(d + "Open" in newFormData) && !(d + "Closed" in newFormData)) {
            newFormData[`${d}Closed`] = false;
            newFormData[`${d}Open`] = "09:00";
            newFormData[`${d}Close`] = "17:00";
          }
        });
        setFormData({
          ...formData,
          ...newFormData,
          name: p.name,
          image: place.imageUrl || "/assets/default.jpg",
          phone: p.formatted_phone_number || "",
          mapLink: `https://www.google.com/maps/place/?q=place_id:${
            p.place_id || place.place_id
          }`,
          rating: p.rating || "",
          reviews: p.user_ratings_total || "",
        });
        setMessage("Imported details successfully! Verify before saving.");
      } else {
        setMessage(
          "Failed to fetch full details. Try manually filling the info."
        );
      }
    } catch (err) {
      console.error(err);
      setMessage("Error importing place details.");
    } finally {
      setPlaces([]);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formEl = e.currentTarget;
    setSubmitting(true);
    setMessage(null);
    const form = new FormData(e.currentTarget);
    const ratingValue = parseFloat(form.get("rating") as string);
    const reviewsValue = parseInt(form.get("reviews") as string, 10);
    const hours = daysOfWeek.map((day) => ({
      day,
      open: formData[`${day.toLowerCase()}Closed`]
        ? "Closed"
        : form.get(`${day.toLowerCase()}Open`),
      close: formData[`${day.toLowerCase()}Closed`]
        ? "Closed"
        : form.get(`${day.toLowerCase()}Close`),
    }));
    const body = {
      image: form.get("image"),
      name: form.get("name"),
      description: form.get("description"),
      phone: form.get("phone"),
      mapLink: form.get("mapLink"),
      categories: form.getAll("categories"),
      rating: ratingValue,
      reviews: reviewsValue,
      hours,
    };
    try {
      const res = await fetch("/api/venue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage("Venue added successfully!");
        formEl.reset();
        setFormData({});
        setSearchText("");
        setPlaces([]);
      } else setMessage(data.message || "Failed to add venue.");
    } catch (error) {
      console.error("Error:", error);
      setMessage("Something went wrong!");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading || (!user && !loading))
    return (
      <div className="flex items-center justify-center h-screen bg-[#f7f7f7]">
        <Loader2 className="w-8 h-8 animate-spin text-urbanary" />
      </div>
    );

  return (
    <>
      <ComingSoon />
      <NavigationHeader />
      <div className="bg-[#f7f7f7] bg-[url('/assets/slider.jpg')] bg-cover bg-center px-4 py-15 flex justify-center text-black">
        <div className="w-full max-w-2xl bg-white rounded-lg p-8 shadow-lg">
          <h2 className="text-center text-3xl font-semibold font-montserrat mb-6">
            Add New Venue
          </h2>

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Search Google Places
              </label>
              <input
                type="text"
                value={searchText}
                onChange={(e) => handlePlaceSearch(e.target.value)}
                placeholder="Type venue name..."
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
              />
              {loadingPlaces && (
                <p className="text-sm text-gray-500 mt-1">Searching...</p>
              )}
              {!loadingPlaces && places.length > 0 && (
                <div className="border mt-2 rounded-lg max-h-64 overflow-y-auto bg-white shadow">
                  {places.map((p) => {
                    const imageUrl = p.imageUrl || "/assets/default.jpg";
                    return (
                      <div
                        key={p.place_id}
                        className="p-3 flex items-center justify-between border-b hover:bg-gray-50"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={imageUrl}
                            alt={p.name}
                            className="w-16 h-16 rounded object-cover border"
                          />
                          <div
                            className="cursor-pointer"
                            onClick={() => handleImport(p)}
                          >
                            <p className="font-medium">{p.name}</p>
                            <p className="text-sm text-gray-500">{p.address}</p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleImport(p)}
                          className="text-urbanary text-sm font-semibold hover:underline cursor-pointer"
                        >
                          Import
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Image URL (Thumbnail)
              </label>
              <input
                name="image"
                type="url"
                placeholder="https://example.com/venue.jpg"
                value={formData.image || ""}
                onChange={(e) =>
                  setFormData({ ...formData, image: e.target.value })
                }
                className="w-full px-3 py-2 border border-gray-300 rounded"
                required
              />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="Venue Thumbnail"
                  className="w-full h-48 object-cover mt-3 rounded-lg border"
                />
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                name="name"
                type="text"
                value={formData.name || ""}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Description
              </label>
              <textarea
                name="description"
                rows={3}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
                required
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Phone
                </label>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, phone: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Map Link
                </label>
                <input
                  name="mapLink"
                  type="url"
                  value={formData.mapLink || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, mapLink: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Categories
              </label>
              {loadingCategories ? (
                <p className="text-gray-500 text-sm mt-1">Loading...</p>
              ) : (
                <div>
                  <input
                    type="text"
                    value={categorySearch}
                    onChange={(e) => setCategorySearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full mt-2 px-3 py-2 border border-gray-300 rounded"
                  />
                  <div className="grid grid-cols-2 gap-2 mt-2 max-h-40 overflow-y-auto border rounded p-2">
                    {filteredCategories.map((category) => (
                      <label
                        key={category}
                        className="flex items-center gap-2 text-sm"
                      >
                        <input
                          type="checkbox"
                          name="categories"
                          value={category}
                          defaultChecked={false}
                        />
                        {category}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Rating
                </label>
                <input
                  name="rating"
                  type="number"
                  step="0.1"
                  min="0"
                  max="5"
                  placeholder="4.8"
                  value={formData.rating || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, rating: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Reviews
                </label>
                <input
                  name="reviews"
                  type="number"
                  min="0"
                  value={formData.reviews || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, reviews: e.target.value })
                  }
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opening Hours
              </label>
              <div className="space-y-2">
                {daysOfWeek.map((day) => {
                  const lower = day.toLowerCase();
                  const closed = formData[`${lower}Closed`];
                  return (
                    <div
                      key={day}
                      className="grid grid-cols-4 gap-2 items-center"
                    >
                      <span className="font-medium">{day}</span>
                      <input
                        type="time"
                        name={`${lower}Open`}
                        value={formData[`${lower}Open`] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`${lower}Open`]: e.target.value,
                          })
                        }
                        disabled={closed}
                        className="border rounded px-2 py-1"
                      />
                      <input
                        type="time"
                        name={`${lower}Close`}
                        value={formData[`${lower}Close`] || ""}
                        onChange={(e) =>
                          setFormData({
                            ...formData,
                            [`${lower}Close`]: e.target.value,
                          })
                        }
                        disabled={closed}
                        className="border rounded px-2 py-1"
                      />
                      <label className="flex items-center gap-1 text-sm">
                        <input
                          type="checkbox"
                          checked={closed || false}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              [`${lower}Closed`]: e.target.checked,
                            })
                          }
                        />
                        Closed
                      </label>
                    </div>
                  );
                })}
              </div>
            </div>

            {message && (
              <p className="text-center text-sm font-medium text-urbanary">
                {message}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className={`w-full text-white font-semibold py-3 px-4 rounded transition cursor-pointer ${
                submitting ? "bg-gray-400" : "bg-urbanary hover:bg-urbanary/90"
              }`}
            >
              {submitting ? "Adding..." : "Add Venue"}
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default VenuePage;
