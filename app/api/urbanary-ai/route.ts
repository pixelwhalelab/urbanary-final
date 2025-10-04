import { NextRequest, NextResponse } from "next/server";

const allowedTopics = [
  "restaurant","restaurants","dinner","lunch","brunch","breakfast","food",
  "meal","eat","places to eat","buffet","cafe","cafes","chinese","italian",
  "indian","french","mexican","thai","japanese","street food","fine dining",
  "rooftop restaurant","bar","bars","pub","lounges","nightclub","nightclubs",
  "nightlife","club","clubs","drinks","cocktails","alcohol","beer","wine",
  "happy hour","hookah","shisha","dance floor","casino","casinos",
];

interface Venue {
  name: string;
  description: string;
  image?: string;
  logo?: string;
  pricing?: string;
  openStatus?: string;
  category?: string; 
  phone?: string;
  rating?: number;
  reviews?: number;
  map?: string;
}

interface GoogleSearchResult {
  place_id: string;
  name: string;
  [key: string]: any;
}

function formatCategory(types: string[] | undefined): string | undefined {
  if (!types || types.length === 0) return undefined;

  const filtered = types.filter(t => !["establishment","point_of_interest"].includes(t));
  if (filtered.length === 0) return undefined;

  const main = filtered[0];
  const othersCount = filtered.length - 1;

  return othersCount > 0 ? `${capitalize(main)} +${othersCount}` : capitalize(main);
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function generateFriendlyDescription(venueName: string): string {
  const templates = [
    `Step into ${venueName} for an unforgettable experience. Discover flavors, vibes, and moments you’ll love!`,
    `${venueName} is the perfect spot to relax and enjoy. Great atmosphere, amazing food, and memorable times await!`,
    `Looking for a top spot? ${venueName} has you covered with delicious offerings and a welcoming environment.`,
    `${venueName} brings a fantastic experience to Leeds. Come for the taste, stay for the vibes!`,
    `Experience the best at ${venueName}! Delicious food, great drinks, and a friendly atmosphere all in one.`,
  ];

  return templates[Math.floor(Math.random() * templates.length)];
}

function getPriceRange(priceLevel: number | undefined): string | undefined {
  if (priceLevel === undefined) return undefined;
  const symbols = ["", "£", "££", "£££", "££££"];
  return symbols[priceLevel] || undefined;
}

async function getPlaceDetails(placeId: string): Promise<Venue | null> {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,price_level,rating,user_ratings_total,photos,types,icon&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const result = (await detailsRes.json()).result;

    const photoRef = result.photos?.[0]?.photo_reference;
    const image = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photoRef}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      : undefined;

    let openStatus: string | undefined = undefined;
    if (result.opening_hours?.open_now !== undefined) {
      openStatus = result.opening_hours.open_now ? "Open" : "Closed";
    }

    return {
      name: result.name,
      description: generateFriendlyDescription(result.name),
      category: formatCategory(result.types),
      image,
      logo: result.icon,
      pricing: getPriceRange(result.price_level),
      openStatus,
      phone: result.formatted_phone_number,
      rating: result.rating,
      reviews: result.user_ratings_total,
      map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${result.name}, ${result.formatted_address}`)}`,
    };
  } catch (err) {
    console.error("Error fetching place details:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const messageLower = message.toLowerCase();

    if (!allowedTopics.some(topic => messageLower.includes(topic))) {
      return NextResponse.json({
        reply: "Hi! I can help you find top spots in Leeds—restaurants, bars, pubs, and more!",
        venues: [],
      });
    }

    const keywords = allowedTopics.filter(topic => messageLower.includes(topic));
    const queryString = keywords.length > 0 ? keywords.join(" ") : "restaurants";
    const query = encodeURIComponent(`${queryString} Leeds, UK`);

    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&region=uk&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData: { results: GoogleSearchResult[] } = await searchRes.json();

    if (!searchData.results?.length) {
      return NextResponse.json({ reply: "No spots found.", venues: [] });
    }

    const venues: Venue[] = (
      await Promise.all(
        searchData.results.map(place => getPlaceDetails(place.place_id))
      )
    ).filter(Boolean) as Venue[];

    const sortedVenues = venues.sort((a, b) => {
      if (a.openStatus === "Open" && b.openStatus !== "Open") return -1;
      if (a.openStatus !== "Open" && b.openStatus === "Open") return 1;

      const ratingA = a.rating || 0;
      const ratingB = b.rating || 0;
      return ratingB - ratingA;
    });

    return NextResponse.json({
      reply: "Here are some top spots in Leeds based on your search:",
      venues: sortedVenues,
    });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({
      reply: "Something went wrong. Please try again later.",
      venues: [],
    });
  }
}
