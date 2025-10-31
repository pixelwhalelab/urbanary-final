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
  "Bistro",
  "Reggaeton",
  "Pop",
  "Chart Hits",
  "Indie",
  "Rock",
  "Jazz",
  "Soul",
  "Funk",
  "DJ",
  "Live Band",
  "DJ Set",
  "Chill Lounge",
  "Upbeat",
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
  "Viral Spot",
  "New Opening",
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
  "Gay Bar",
  "Queer Bar",
  "Drag Show",
  "Cultural Experience",
  "Sustainability",
  "Local Produce",
  "Independent Venue",
  "Heritage Venue",
];

function splitIntoSteps(query: string): string[] {
  const normalizedQuery = query
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  const splitQuery = normalizedQuery
    .replace(
      /\b(then|after that|and finally|followed by|next|also|;|&|and)\b/gi,
      "|"
    )
    .replace(/\.\s+/g, "|");

  const steps = splitQuery
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 1)
    .filter((s) => !/I['’]?m \d+ years? old/i.test(s))
    .filter(Boolean);

  return steps;
}

function normalizeText(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();
}

function extractCategoriesFast(step: string): string[] {
  const found = new Set<string>();
  const normalizedStep = normalizeText(step);

  for (const category of allCategories) {
    const normalizedCat = normalizeText(category);
    const pattern = new RegExp(`\\b${normalizedCat}\\b`, "i");
    if (pattern.test(normalizedStep)) {
      found.add(category);
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
      } catch (e) {}
    }
  } catch (e) {}
  return Array.from(found);
}

async function extractCategoriesHybrid(step: string): Promise<string[]> {
  const finalCats = extractCategoriesFast(step);
  const allowedCats = finalCats.filter((c) => allCategories.includes(c));
  if (allowedCats.length > 0) return allowedCats;
  if (finalCats.length === 0) {
    const aiCats = await extractCategoriesByGPT(step);
    const allowedAiCats = aiCats.filter((c) => allCategories.includes(c));
    if (allowedAiCats.length > 0) return allowedAiCats;
  }
  return ["Unidentified"];
}

function generateParagraph(stepText: string): string {
  const cleanStep = stepText
    .replace(
      /^(I want to|I'm planning to|I would like to|I want|I'm looking to)\s+/i,
      ""
    )
    .trim();
  if (!cleanStep) return "";
  const intros = [
    "That sounds like a great plan —",
    "You can’t go wrong with",
    "If you’re into good vibes, definitely try",
    "For something memorable, go for",
    "It’s always a good idea to check out",
    "A solid pick would be",
    "Locals love",
    "A fun option could be",
    "If that’s your vibe, you’ll enjoy",
  ];
  const outros = [
    "It’s got a great atmosphere and plenty to enjoy!",
    "Perfect for making memories with your group.",
    "Expect a mix of fun, flavour, and good energy.",
    "You’ll find it’s got the right mix of comfort and charm.",
    "People say it’s one of the best ways to spend your time around here.",
    "It’s a nice balance of relaxed and lively — worth a visit.",
    "A great way to experience something local and different!",
  ];
  return `${intros[Math.floor(Math.random() * intros.length)]} ${cleanStep}. ${
    outros[Math.floor(Math.random() * outros.length)]
  }`;
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
  const leedsLat = 53.8008;
  const leedsLng = -1.5491;
  const radius = 10000;
  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
    query
  )}&location=${leedsLat},${leedsLng}&radius=${radius}&key=${apiKey}`;
  console.log("Google Places API URL:", url);
  const res = await fetch(url);
  const data = await res.json();
  const results = (data.results || []).slice(0, maxResults);
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

    const unnecessaryPhrases = [
      "go to office",
      "head to",
      "visit",
      "proceed to",
      "go to",
      "stop by",
      "make your way to",
      "then",
      "after that",
      "next",
      "finally",
      "and",
      "also",
      "at the",
      "in the",
      "on the",
    ];

    const skipGoogleCategories = new Set([
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
      "Gay Bar",
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
      "Late-Night Eats",
      "Cocktail Bar",
      "Wine Bar",
      "Pub",
      "Party Bar",
      "Rooftop Bar",
      "Lounge Bar",
      "Tiki Bar",
      "Sports Bar",
      "Whisky Bar",
      "Rum Bar",
      "Gin Bar",
      "Shisha Lounge",
      "Live Music Bar",
    ]);

    let stepsText = splitIntoSteps(query);
    if (stepsText.length === 0) {
      stepsText = [query];
    }
    const steps: StepResult[] = await Promise.all(
      stepsText.map(async (stepText, idx) => {
        let cleanedText = stepText.toLowerCase();
        for (const phrase of unnecessaryPhrases) {
          const regex = new RegExp(`\\b${phrase}\\b,?\\s*`, "gi");
          cleanedText = cleanedText.replace(regex, "");
        }
        cleanedText = cleanedText.trim();

        let categories: string[];
        try {
          categories = await extractCategoriesHybrid(cleanedText);
        } catch {
          categories = ["Unidentified"];
        }

        let venues: GooglePlaceResultOutput[] | undefined = undefined;
        const normalizeCategory = (cat: string) =>
          cat.trim().toLowerCase().replace(/s$/, "");

        const normalizedCategories = categories.map(normalizeCategory);

        if (
          !categories ||
          categories.length === 0 ||
          normalizedCategories.includes("unidentified")
        ) {
          try {
            const results = await searchGooglePlacesLeeds(cleanedText, 6);
            if (results.length > 0) {
              const filteredResults = results.filter((r) => {
                const types = r.types?.map((t) => t.toLowerCase()) || [];
                return (
                  (types.includes("bar") || types.includes("night_club")) &&
                  !types.includes("spa") &&
                  !types.includes("sauna") &&
                  !r.name.toLowerCase().includes("sauna") &&
                  !r.name.toLowerCase().includes("spa")
                );
              });

              if (filteredResults.length > 0) {
                venues = filteredResults.map((r) => ({
                  name: r.name,
                  description: generateFriendlyDescription(r.name),
                  category: formatCategory(r.types),
                  image: r.photos?.[0]?.photo_reference
                    ? getPhotoUrl(r.photos[0].photo_reference)
                    : null,
                  logo: r.icon ?? undefined,
                  pricing: getPriceRange(r.price_level),
                  openStatus: r.opening_hours?.open_now ? "Open" : "Closed",
                  phone: r.formatted_phone_number ?? null,
                  rating: r.rating ?? null,
                  reviews: r.user_ratings_total ?? null,
                  map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                    `${r.name}, ${r.formatted_address}`
                  )}`,
                }));
              }
            }
          } catch (err) {
            console.error("Google Places API error:", err);
          }
        }

        let paragraph: string;

        if (venues && venues.length > 0) {
          paragraph = generateParagraph(cleanedText);
        } else if (categories && categories[0] !== "Unidentified") {
          paragraph = `A ${categories.join(
            ", "
          )} could be a great choice for your visit.`;
        } else {
          paragraph =
            "A place matching your preferences could be a great choice for your visit.";
        }

        return {
          intent: `Visit ${idx + 1}`,
          paragraph,
          categories,
          ...(venues ? { venues } : {}),
        };
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
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
