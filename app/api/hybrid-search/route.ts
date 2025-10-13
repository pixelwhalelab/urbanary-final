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

const synonymMap: Record<string, string[]> = {
  pizza: ["Pizza Place"],
  burger: ["Burger Joint"],
  coffee: ["Coffee Shop", "Café"],
  cappuccino: ["Coffee Shop", "Café"],
  tea: ["Café", "Tea House"],
  pub: ["Pub", "Gastropub"],
  bar: ["Cocktail Bar", "Wine Bar", "Rooftop Bar", "Party Bar", "Gay Bar", "Queer Bar"],
  rooftop: ["Rooftop Bar", "Rooftop Terrace", "Rooftop Restaurant"],
  cocktail: ["Cocktail Bar"],
  wine: ["Wine Bar"],
  whisky: ["Whisky Bar"],
  rum: ["Rum Bar"],
  gin: ["Gin Bar"],
  dog: ["Pet Friendly", "Dog Friendly"],
  brunch: ["Brunch Spot", "Bottomless Brunch"],
  breakfast: ["Café", "Brunch Spot"],
  streetfood: ["Street Food", "Food Market", "Food Hall"],
  dessert: ["Dessert Bar", "Bakery", "Ice Cream Parlour", "Gelato Shop"],
  icecream: ["Ice Cream Parlour", "Gelato Shop", "Dessert Bar"],
  vegan: ["Vegan"],
  vegetarian: ["Vegetarian"],
  halal: ["Halal"],
  steak: ["Steakhouse"],
  seafood: ["Seafood"],
  tapas: ["Tapas Bar"],
  pubgrub: ["Pub Grub", "Gastropub"],
  late: ["Late-Night Eats", "Nightclub", "Late Night Lounge"],
  nightclub: ["Nightclub", "Party Bar"],
  speakeasy: ["Speakeasy", "Cocktail Bar"],
  lounge: ["Lounge Bar", "VIP Club", "Gay Bar", "Queer Bar"],
  shisha: ["Shisha Lounge"],
  music: [
    "Live Music Bar",
    "Live DJ Night",
    "DJ Set",
    "Live Band",
    "Jazz",
    "Pop",
    "Rock",
    "Indie",
    "Hip Hop",
    "Afrobeats",
    "Chart Hits",
    "Soul",
    "Funk",
  ],
  jazz: ["Jazz"],
  arcade: ["Arcade"],
  bowling: ["Bowling"],
  karaoke: ["Karaoke Bar"],
  dance: ["Dance Class", "DJ Set", "Dance Floor"],
  art: ["Art Class", "Art"],
  pottery: ["Pottery Class"],
  yoga: ["Yoga Class", "Wellness Experience"],
  spa: ["Spa", "Wellness Experience", "Hot Tub Experience"],
  cooking: ["Cooking Class", "Culinary Experience"],
  wine_tasting: ["Wine Tasting"],
  cocktail_masterclass: ["Cocktail Masterclass"],
  theatre: ["Theatre Show", "Theatre"],
  comedy: ["Comedy Show", "Comedy"],
  cinema: ["Cinema", "Outdoor Cinema", "Film"],
  boat: ["Boat Party"],
  festival: [
    "Summer Festival",
    "Street Party",
    "Food Festival",
    "Cultural Festival",
  ],
  birthday: ["Birthday Party"],
  hen: ["Hen Party"],
  stag: ["Stag Party"],
  corporate: ["Corporate Event"],
  private: ["Private Hire"],
  networking: ["Networking Event", "After-Work Drinks"],
  singles: ["Singles Night", "Speed Dating"],
  brunchparty: ["Brunch Party", "Bottomless Brunch"],
  seasonal: ["Seasonal Party", "Halloween", "Christmas", "New Year’s Eve"],
  party: [
    "Bottomless Brunch",
    "Themed Event",
    "Seasonal Party",
    "VIP Club",
    "Nightclub",
    "Party Bar",
    "Gay Bar",
    "Queer Bar",
    "Drag Show",
  ],
  chill: ["Chill Lounge", "Casual", "Casual Meetup"],
  luxury: ["Luxury", "Fine Dining"],
  casual: ["Casual Dining", "Casual Meetup", "Walk-ins Welcome"],
  formal: ["Formal", "Dress To Impress", "Smart Casual"],
  outdoor: [
    "Outdoor Seating",
    "Rooftop Terrace",
    "Heated Terrace",
    "Garden Area",
    "Street Side Tables",
  ],
  private_room: ["Private Rooms"],
  stage: ["Stage"],
  pets: ["Pet Friendly", "Dog Friendly"],
  wifi: ["Free Wi-Fi"],
  day: ["Daytime", "All Day", "Weekend", "Weekday"],
  evening: ["Evening", "Late Night"],
  vip: ["VIP Package", "VIP Club", "Guest List"],
  bengali: ["Bengali Restaurant"],
  indian: ["Indian Restaurant"],
  chinese: ["Chinese Restaurant"],
  italian: ["Italian Restaurant"],
  mexican: ["Mexican Restaurant"],
  japanese: ["Japanese Restaurant"],
  takeaway: ["Takeaway", "Street Food"],
  hidden: ["Hidden Gem", "Hidden Bar"],
  trending: ["Trending", "Viral Spot", "New Opening"],
  area: ["Area", "Neighbourhood", "City", "Region", "Near Me"],
  live: ["Live Music Bar", "Live DJ Night", "Live Band"],
  boardgames: ["Board Games", "Quiz Night"],
  darts: ["Darts"],
  pool: ["Pool & Snooker"],
  mini_golf: ["Mini Golf"],
  immersive: ["Immersive Experience", "Virtual Reality", "Escape Room"],
  lgbtq: ["LGBTQ+", "Gay Bar", "Queer Bar", "Drag Show"],
};

function splitIntoSteps(query: string): string[] {
  const normalized = query
    .replace(
      /\b(then|after that|and finally|followed by|next|also|;|&)\b/gi,
      "|"
    )
    .replace(/\.\s+/g, "|");
  return normalized
    .split("|")
    .map((s) => s.trim())
    .filter((s) => s.length > 3)
    .filter((s) => !/I['’]?m \d+ years? old/i.test(s))
    .filter((s) =>
      /breakfast|lunch|dinner|coffee|cappuccino|bar|restaurant|bengali|pub|café|wine|cocktail|rooftop|halal|dog/i.test(
        s
      )
    )
    .map((s) => s.replace(/\bI['’]?m \d+ years old\b/gi, "").trim())
    .filter(Boolean);
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
  for (const [syn, cats] of Object.entries(synonymMap)) {
    const pattern = new RegExp(`\\b${syn.replace("_", " ")}\\b`, "i");
    if (pattern.test(normalizedStep)) cats.forEach((c) => found.add(c));
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

        const hasRestaurantCategory = categories.some((c) =>
          skipGoogleCategories.has(c.trim())
        );

        let venues: GooglePlaceResultOutput[] | undefined = undefined;

        if (!hasRestaurantCategory) {
          try {
            const results = await searchGooglePlacesLeeds(cleanedText, 6);
            if (results.length > 0) {
              venues = results.map((r) => ({
                name: r.name,
                description: generateFriendlyDescription(r.name),
                category: formatCategory(r.types),
                image: r.photos?.[0]?.photo_reference
                  ? getPhotoUrl(r.photos[0].photo_reference)
                  : null,
                logo: r.icon ?? undefined,
                pricing: getPriceRange(r.price_level),
                openStatus: r.opening_hours?.open_now ? "Open" : "Closed",
                phone: r.formatted_phone_number ?? undefined,
                rating: r.rating ?? null,
                reviews: r.user_ratings_total ?? null,
                map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  `${r.name}, ${r.formatted_address}`
                )}`,
              }));
            }
          } catch {}
        }

        let paragraph: string;

        if (venues && venues.length > 0) {
          paragraph = generateParagraph(cleanedText);
        } else if (categories && categories[0] !== "Unidentified") {
          paragraph = `You might be interested in ${categories.join(
            ", "
          )}, but we couldn't find a venue for this step.`;
        } else {
          paragraph = "Sorry, no venues found.";
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