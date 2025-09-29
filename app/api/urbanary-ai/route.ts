import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { DateTime } from "luxon";

const openai = new OpenAI({
  apiKey: process.env.GPT5_KEY,
});

const allowedTopics = [
  "restaurant","restaurants","dinner","lunch","brunch","breakfast","food","meal","eat","places to eat","buffet","cafe","cafes","chinese","italian","indian","french","mexican","thai","japanese","street food","fine dining","rooftop restaurant",
  "bar","bars","pub","lounges","nightclub","nightclubs","nightlife","club","clubs","drinks","cocktails","alcohol","beer","wine","happy hour","hookah","shisha","dance floor",
  "casino","casinos"
];

const categoryMapping: Record<string, string> = {
  restaurant: "restaurant",
  bar: "bar",
  cafe: "cafe",
  nightclub: "nightclub",
  pub: "bar",
  bakery: "cafe",
  food: "restaurant",
  meal_takeaway: "restaurant",
  fast_food: "restaurant",
  park: "activity",
  museum: "activity",
  tourist_attraction: "activity",
  shopping_mall: "activity",
  movie_theater: "activity",
  bowling_alley: "activity",
  night_club: "nightclub",
  casino: "casino",
  default: "other",
};

interface AIVenue {
  name: string;
  description?: string;
  category?: string;
}

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

interface GoogleOpeningPeriod {
  open: { day: number; time: string };
  close?: { day: number; time: string };
}

async function getGooglePlaceDetails(name: string) {
  try {
    const query = encodeURIComponent(`${name} Leeds, UK`);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&region=uk&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData = await searchRes.json();
    if (!searchData.results?.length) return null;

    const place = searchData.results[0];
    const placeId = place.place_id;

    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,price_level,rating,user_ratings_total,photos,types,icon&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const detailsData = await detailsRes.json();
    const result = detailsData.result;

    const photoRef = result.photos?.[0]?.photo_reference;
    const image = photoRef
      ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photoRef}&key=${process.env.GOOGLE_MAPS_API_KEY}`
      : "/fallback.jpg";

    const type = result.types?.[0] || "default";
    const category = categoryMapping[type] || categoryMapping["default"];

    let openStatus: string | undefined = undefined;
    if (result.opening_hours?.periods) {
      const now = DateTime.now().setZone("Europe/London");
      const weekday = now.weekday % 7; 
      const currentMinutes = now.hour * 60 + now.minute;

      const todayPeriod = (result.opening_hours.periods as GoogleOpeningPeriod[]).find(p => p.open.day === weekday);
      if (todayPeriod) {
        const openMinutes = parseInt(todayPeriod.open.time.slice(0,2)) * 60 + parseInt(todayPeriod.open.time.slice(2));
        const closeMinutes = todayPeriod.close
          ? parseInt(todayPeriod.close.time.slice(0,2)) * 60 + parseInt(todayPeriod.close.time.slice(2))
          : undefined;

        if (closeMinutes !== undefined) {
          if (currentMinutes >= closeMinutes) openStatus = "Closed";
          else if (currentMinutes >= closeMinutes - 30) openStatus = "Closing soon";
          else openStatus = "Open";
        } else {
          openStatus = "Open";
        }
      }
    }

    return {
      address: result.formatted_address,
      phone: result.formatted_phone_number,
      website: result.website,
      openStatus,
      pricing: result.price_level !== undefined ? "£".repeat(result.price_level) : undefined,
      category,
      image,
      logo: result.icon,
      rating: result.rating,
      reviews: result.user_ratings_total,
      map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${name}, ${result.formatted_address}`)}`,
    };
  } catch (err) {
    console.error("Google Places API error:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const messageLower = message.toLowerCase();

    if (!allowedTopics.some(topic => messageLower.includes(topic))) {
      return NextResponse.json({
        reply: "Hi there! I can help you find the best spots in Leeds—restaurants, bars, casinos, and more!",
        venues: [],
      });
    }

    const prompt = `
You are a Leeds local guide. Suggest venues in Leeds city.
Return ONLY a JSON array, no extra text or HTML.
Each venue must include:
- name
- description (one-line)
- category (choose from: restaurant, bar, cafe, nightclub, casino, activity, other)
Example:
[
  { "name": "Dishoom Leeds", "description": "Lively Bombay-style restaurant with great curries.", "category": "restaurant" },
  { "name": "Whitelocks Ale House", "description": "Historic bar with a wide selection of ales.", "category": "bar" }
]
User message: "${message}"
`;

    const aiResponse = await openai.chat.completions.create({
      model: "gpt-5-mini",
      messages: [{ role: "user", content: prompt }],
    });

    const rawText = aiResponse.choices?.[0]?.message?.content ?? "";
    console.log("Raw AI response:", rawText);

    let aiVenues: AIVenue[] = [];
    try {
      const jsonMatch = rawText.match(/\[[\s\S]*\]/);
      if (jsonMatch) aiVenues = JSON.parse(jsonMatch[0]);
      else console.warn("No JSON array found in AI response.");
    } catch (err) {
      console.error("Failed to parse AI JSON:", err, "Raw text:", rawText);
    }

    const venues = (
      await Promise.all(
        aiVenues.map(async (v) => {
          const details = await getGooglePlaceDetails(v.name);
          if (!details) return null;
          return {
            name: v.name,
            description: v.description || "",
            image: details.image,
            logo: details.logo,
            pricing: details.pricing,
            openStatus: details.openStatus,
            category: v.category || details.category,
            phone: details.phone,
            rating: details.rating,
            reviews: details.reviews,
            map: details.map,
          };
        })
      )
    ).filter(Boolean) as Venue[];

    if (!venues.length) {
      return NextResponse.json({
        reply: "Oh no! I couldn't find any spots matching your search in Leeds. Try another search?",
        venues: [],
      });
    }

const introParagraph = "Here's a handpicked selection of top spots in Leeds I reckon you’ll love—food, drinks, and a bit of fun!";

    return NextResponse.json({ reply: introParagraph, venues });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({
      reply: "Sorry mate, something went wrong. Give it another go in a minute!",
      venues: [],
    });
  }
}
