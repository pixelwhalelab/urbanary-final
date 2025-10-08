import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const SESSION_CACHE_TTL = 10 * 60 * 1000;
const GOOGLE_CACHE_TTL = 60 * 60 * 1000;

interface CacheEntry {
  timestamp: number;
  steps: StepResult[];
}

const sessionCache: Record<string, CacheEntry> = {};

interface GooglePlaceCacheEntry {
  timestamp: number;
  results: GooglePlaceResult[];
}

const googleCache: Record<string, GooglePlaceCacheEntry> = {};

interface GooglePlaceResult {
  name: string;
  types?: string[];
  photos?: { photo_reference: string }[];
  icon?: string;
  price_level?: number;
  opening_hours?: { open_now: boolean };
  formatted_phone_number?: string;
  rating?: number;
  user_ratings_total?: number;
  formatted_address: string;
}

interface StepResult {
  intent: string;
  paragraph: string;
  categories: string[];
  venues?: GooglePlaceResultOutput[];
}

interface GooglePlaceResultOutput {
  name: string;
  description: string;
  category: string;
  image: string | null;
  logo?: string;
  pricing: string;
  openStatus: string;
  phone?: string | null;
  rating?: number | null;
  reviews?: number | null;
  map: string;
}

const allCategories = [
  "Restaurant",
  "Fine Dining",
  "Casual Dining",
  "Street Food",
  "Brunch Spot",
  "Café",
  "Coffee Shop",
  "Bakery",
  "Dessert Bar",
  "Vegan",
  "Vegetarian",
  "Halal",
  "Steakhouse",
  "Seafood",
  "Burger Joint",
  "Pizza Place",
  "Tapas Bar",
  "Pub Grub",
  "Gastropub",
  "Food Market",
  "Rooftop Restaurant",
  "Hidden Gem",
  "Food Hall",
  "Takeaway",
  "Late-Night Eats",
  "Cocktail Bar",
  "Party Bar",
  "Wine Bar",
  "Pub",
  "Speakeasy",
  "Lounge Bar",
  "Tiki Bar",
  "Sports Bar",
  "Whisky Bar",
  "Rum Bar",
  "Gin Bar",
  "Shisha Lounge",
  "Live Music Bar",
  "Entertainment Bar",
  "Dive Bar",
  "Rooftop Bar",
  "Hidden Bar",
  "VIP Club",
  "Nightclub",
  "Gentlemen’s Club",
  "Late Night Lounge",
  "Brewery Taproom",
  "Distillery Bar",
  "Beer Garden",
  "Karaoke Bar",
  "Immersive Experience",
  "Escape Room",
  "Arcade",
  "Virtual Reality",
  "Bowling",
  "Mini Golf",
  "Darts",
  "Pool & Snooker",
  "Quiz Night",
  "Board Games",
  "Comedy Show",
  "Theatre Show",
  "Cinema",
  "Outdoor Cinema",
  "Live Performance",
  "Boat Party",
  "Silent Disco",
  "Wine Tasting",
  "Cocktail Masterclass",
  "Cooking Class",
  "Art Class",
  "Pottery Class",
  "Dance Class",
  "Yoga Class",
  "Wellness Experience",
  "Spa",
  "Hot Tub Experience",
  "Birthday Party",
  "Hen Party",
  "Stag Party",
  "Corporate Event",
  "Private Hire",
  "After-Work Drinks",
  "Networking Event",
  "Charity Event",
  "Launch Party",
  "Speed Dating",
  "Singles Night",
  "Live DJ Night",
  "Brunch Party",
  "Bottomless Brunch",
  "Themed Event",
  "Seasonal Party",
  "Halloween",
  "Christmas",
  "New Year’s Eve",
  "Summer Festival",
  "Street Party",
  "Food Festival",
  "Cultural Festival",
  "House",
  "Techno",
  "Hip Hop",
  "Afrobeats",
  "bistro",
  "Reggaeton",
  "Pop",
  "Chart Hits",
  "Indie",
  "Rock",
  "Jazz",
  "Soul",
  "Funk",
  "Live Band",
  "DJ Set",
  "Chill Lounge",
  "Upbeat",
  "Party Mashup",
  "Date Night",
  "First Date",
  "Romantic",
  "Group Hangout",
  "Solo Friendly",
  "Work Lunch",
  "Casual Meetup",
  "Friends Night Out",
  "Family Friendly",
  "Student Night",
  "Budget Friendly",
  "Luxury",
  "Something A Little Different",
  "Hidden Gem",
  "Viral Spot",
  "New Opening",
  "Trending",
  "Area",
  "Neighbourhood",
  "City",
  "Region",
  "Near Me",
  "Casual",
  "Smart Casual",
  "Dress To Impress",
  "Formal",
  "No Sportswear",
  "No Hoodies",
  "Themed Costume",
  "Outdoor Seating",
  "Rooftop Terrace",
  "Heated Terrace",
  "Street Side Tables",
  "Private Rooms",
  "Garden Area",
  "Smoking Area",
  "Dance Floor",
  "Stage",
  "Big Screen Sports",
  "DJ Booth",
  "Photo Booth",
  "Pet Friendly",
  "Free Wi-Fi",
  "Daytime",
  "Evening",
  "Late Night",
  "All Day",
  "Weekend",
  "Weekday",
  "Seasonal",
  "Taking Bookings",
  "Walk-ins Welcome",
  "Free Entry",
  "Ticketed",
  "Guest List",
  "Pre-book Required",
  "VIP Package",
  "Group Booking",
  "Walk-in Only",
  "Art",
  "Theatre",
  "Comedy",
  "Film",
  "Literature",
  "LGBTQ+",
  "Cultural Experience",
  "Sustainability",
  "Local Produce",
  "Independent Venue",
  "Heritage Venue",
];
const synonymMap: Record<string, string[]> = {
  pizza: ["Pizza Place"],
  burger: ["Burger Joint"],
  coffee: ["Coffee Shop", "Café"],
  pub: ["Pub", "Gastropub"],
  rooftop: ["Rooftop Bar", "Rooftop Terrace", "Rooftop Restaurant"],
  cocktail: ["Cocktail Bar"],
  wine: ["Wine Bar"],
  dog: ["Pet Friendly"],
  brunch: ["Brunch Spot", "Bottomless Brunch"],
  music: ["Live Music Bar", "Live DJ Night", "DJ Set", "Live Band"],
  spa: ["Spa"],
  arcade: ["Arcade"],
  bowling: ["Bowling"],
  karaoke: ["Karaoke Bar"],
  dance: ["Dance Class", "DJ Set"],
  art: ["Art Class"],
  pottery: ["Pottery Class"],
};

function splitIntoSteps(query: string): string[] {
  const normalized = query.replace(
    /\b(then|after that|and finally|followed by|next|also|;|&)\b/gi,
    "|"
  );

  let steps = normalized
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 3);

  const finalSteps: string[] = [];
  for (let step of steps) {
    finalSteps.push(
      ...step
        .split(",")
        .map((s) => s.trim())
        .filter((s) => s.length > 0)
    );
  }

  return finalSteps;
}

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function extractCategoriesFast(step: string): string[] {
  const found = new Set<string>();
  const stepWords = normalizeText(step).split(/\W+/).filter(Boolean);

  for (const [syn, cats] of Object.entries(synonymMap)) {
    if (stepWords.includes(syn.toLowerCase())) {
      cats.forEach((c) => found.add(c));
    }
  }

  for (const cat of allCategories) {
    const normalizedCat = normalizeText(cat);
    if (normalizeText(step).includes(normalizedCat)) {
      found.add(cat);
    }
  }

  return Array.from(found);
}

async function extractCategoriesByGPT(step: string): Promise<string[]> {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  const found = new Set<string>();
  try {
    const res = await openai.chat.completions.create({
      model: "gpt-5-nano",
      messages: [
        {
          role: "system",
          content:
            "Return JSON array of category names from provided list. If none match, suggest a new category.",
        },
        {
          role: "user",
          content: `${step}\nCategories:\n${allCategories.join(", ")}`,
        },
      ],
      temperature: 0,
      max_tokens: 200,
    });
    const text = res.choices[0]?.message?.content?.trim();
    if (text) {
      try {
        JSON.parse(text).forEach((c: string) => found.add(c));
      } catch (e) {
        console.error("Failed to parse GPT output:", text, e);
      }
    }
  } catch (e) {
    console.error(e);
  }
  return Array.from(found);
}

async function extractCategoriesHybrid(step: string): Promise<string[]> {
  const cats = extractCategoriesFast(step);

  let finalCats = [...cats];
  if (finalCats.length === 0) {
    const aiCats = await extractCategoriesByGPT(step);
    finalCats = aiCats.filter((c) => allCategories.includes(c));
  }

  if (finalCats.length === 0) finalCats.push("Unidentified");

  return finalCats;
}

function generateParagraph(stepText: string): string {
  const cleanStep = stepText
    .replace(/^(I want to|I'm planning to|I would like to)\s+/i, "")
    .trim();
  return `You should check out ${cleanStep}. It's a great experience worth your time.`;
}

function cleanSessionCache() {
  const now = Date.now();
  for (const k in sessionCache)
    if (now - sessionCache[k].timestamp > SESSION_CACHE_TTL)
      delete sessionCache[k];
}

async function searchGooglePlacesLeeds(
  query: string,
  maxResults = 6
): Promise<GooglePlaceResult[]> {
  const key = query.toLowerCase();
  const cached = googleCache[key];
  if (cached && Date.now() - cached.timestamp < GOOGLE_CACHE_TTL)
    return cached.results;

  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}+Leeds+UK&key=${apiKey}&type=restaurant`;
  const res = await fetch(url);
  const data = await res.json();
  const results: GooglePlaceResult[] = (data.results || []).slice(
    0,
    maxResults
  );
  googleCache[key] = { timestamp: Date.now(), results };
  return results;
}

function getPhotoUrl(photoReference?: string, maxWidth = 400): string | null {
  if (!photoReference) return null;
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  return `https://maps.googleapis.com/maps/api/place/photo?maxwidth=${maxWidth}&photoreference=${photoReference}&key=${apiKey}`;
}

function formatCategory(types?: string[]): string {
  return types?.join(", ") || "Unknown";
}
function generateFriendlyDescription(name: string): string {
  return `${name} is a great place to visit! Perfect for your adventure.`;
}
function getPriceRange(level?: number): string {
  if (level === undefined) return "Unknown";
  return ["Free", "$", "$$", "$$$", "$$$$"][level] || "Unknown";
}

export async function POST(req: NextRequest) {
  try {
    const { query, sessionId } = await req.json();
    if (!query || !sessionId)
      return NextResponse.json(
        { error: "Missing query or sessionId" },
        { status: 400 }
      );

    cleanSessionCache();

    const cacheKey = `${sessionId}:${query.toLowerCase()}`;
    const cached = sessionCache[cacheKey];
    if (cached)
      return NextResponse.json({
        success: true,
        input: query,
        steps: cached.steps,
        cached: true,
      });

    const stepsText = splitIntoSteps(query);

    const steps: StepResult[] = await Promise.all(
      stepsText.map(async (stepText, idx) => {
        try {
          let categories: string[] = [];
          try {
            categories = await extractCategoriesHybrid(stepText);
          } catch (e) {
            console.error("Category extraction failed for step:", stepText, e);
            categories = ["Unidentified"];
          }

          const paragraph = generateParagraph(stepText);

          let venues: GooglePlaceResultOutput[] = [];
          if (categories.includes("Unidentified")) {
            try {
              const results = await searchGooglePlacesLeeds(stepText, 6);
              venues = results.map((r: GooglePlaceResult) => ({
                name: r.name,
                description: generateFriendlyDescription(r.name),
                category: formatCategory(r.types),
                image: getPhotoUrl(r.photos?.[0]?.photo_reference) || null,
                logo: r.icon,
                pricing: getPriceRange(r.price_level),
                openStatus: r.opening_hours?.open_now ? "Open" : "Closed",
                phone: r.formatted_phone_number || null,
                rating: r.rating || null,
                reviews: r.user_ratings_total || null,
                map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${r.name}, ${r.formatted_address}`
                )}`,
              }));
            } catch (e) {
              console.error(
                "Google Places lookup failed for step:",
                stepText,
                e
              );
              venues = [];
            }
          }

          return {
            intent: `Visit ${idx + 1}`,
            paragraph,
            categories,
            ...(venues.length ? { venues } : {}),
          };
        } catch (e) {
          console.error("Step processing failed for:", stepText, e);
          return {
            intent: `Visit ${idx + 1}`,
            paragraph: "Error processing step",
            categories: ["Unidentified"],
          };
        }
      })
    );

    sessionCache[cacheKey] = { timestamp: Date.now(), steps };

    return NextResponse.json({
      success: true,
      input: query,
      steps,
      cached: false,
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
