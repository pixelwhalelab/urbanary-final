import { NextRequest, NextResponse } from "next/server";

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
  types?: string[];
  [key: string]: any;
}

function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatCategory(types: string[] | undefined): string | undefined {
  if (!types || types.length === 0) return undefined;
  const filtered = types.filter((t) => !["establishment", "point_of_interest"].includes(t));
  if (filtered.length === 0) return undefined;
  const main = filtered[0];
  const othersCount = filtered.length - 1;
  return othersCount > 0 ? `${capitalize(main)} +${othersCount}` : capitalize(main);
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

function detectLocalArea(q: string): string | undefined {
  const map: Record<string, string> = {
    headingley: "Headingley Leeds",
    "chapel allerton": "Chapel Allerton Leeds",
    "hyde park": "Hyde Park Leeds",
    meanwood: "Meanwood Leeds",
    "city centre": "Leeds City Centre",
    "city center": "Leeds City Centre",
    ls1: "Leeds City Centre",
    ls2: "Leeds City Centre",
    ls6: "Leeds LS6",
    "leeds dock": "Leeds Dock",
    "granary wharf": "Leeds Dock",
    briggate: "Briggate Leeds",
    headrow: "The Headrow Leeds",
    "kirkgate market": "Kirkgate Market Leeds",
    "otley run": "Headingley Leeds",
    "first direct arena": "Leeds City Centre",
    "royal armouries": "Leeds Dock",
    "trinity leeds": "Leeds City Centre",
    "corn exchange": "Leeds City Centre",
  };
  for (const key in map) if (q.includes(key)) return map[key];
  return undefined;
}

function detectTypeFromQuery(query: string): {
  type: string;
  locationModifier?: string;
  strictKeywords?: string[];
  boostAdventure?: boolean;
} {
  const q = query.toLowerCase();
  if (/bar|pub|cocktail|beer|wine|whiskey|rum|vodka|club|nightclub|night life|speakeasy|lounge|sports bar|late night/.test(q))
    return { type: "bar", locationModifier: detectLocalArea(q) };
  if (/restaurant|food|eat|dining|brunch|breakfast|lunch|dinner|buffet|street food|fine dining|cheap eats/.test(q))
    return { type: "restaurant", locationModifier: detectLocalArea(q) };
  if (/vegan|vegetarian|gluten[- ]free|plant based|organic|dairy free|halal|kosher|healthy food/.test(q))
    return {
      type: "restaurant",
      locationModifier: detectLocalArea(q),
      strictKeywords: ["vegan","vegetarian","gluten-free","gluten free","plant based","organic","dairy free","halal","kosher","healthy"]
    };
  if (/cafe|coffee|espresso|tea|breakfast cafe|brunch cafe/.test(q))
    return { type: "cafe", locationModifier: detectLocalArea(q) };
  if (/theatre|theater|cinema|movie|performance|concert|live music|gig|opera|jazz|show|play/.test(q))
    return { type: "movie_theater", locationModifier: detectLocalArea(q) };
  if (/museum|gallery|art|exhibition/.test(q))
    return { type: "museum", locationModifier: detectLocalArea(q) };
  if (/park|garden|walk|hike|trail|canal|riverside|nature/.test(q))
    return { type: "park", locationModifier: detectLocalArea(q) };
  if (/casino|gambling|poker|slots/.test(q))
    return { type: "casino", locationModifier: detectLocalArea(q) };
  if (/hotel|stay|lodging|bnb|bed and breakfast|accommodation|hostel/.test(q))
    return { type: "lodging", locationModifier: detectLocalArea(q) };
  if (/helicopter|air tour|hot air balloon|adventure|sightseeing flight|zipline|rafting|kayak|river cruise|trek|hiking tour|climbing/.test(q))
    return { type: "tourist_attraction", locationModifier: detectLocalArea(q), boostAdventure: true };
  if (/shopping|mall|plaza|boutique|store/.test(q))
    return { type: "shopping_mall", locationModifier: detectLocalArea(q) };
  if (/supermarket|grocery|milk|convenience|corner shop/.test(q))
    return { type: "supermarket", locationModifier: detectLocalArea(q) };
  if (/butcher|meat shop|beef|chicken|pork|lamb|fishmongers|seafood/.test(q))
    return { type: "supermarket", locationModifier: detectLocalArea(q), strictKeywords: ["butcher","meat","beef","chicken","pork","lamb","fish","seafood"] };
  if (/sports store|sporting goods|hiking gear|outdoor shop|climbing gear|bike shop/.test(q))
    return { type: "shopping_mall", locationModifier: detectLocalArea(q), strictKeywords: ["sports","hiking","outdoor","climbing","bike"] };
  if (/spa|massage|wellness|sauna/.test(q))
    return { type: "spa", locationModifier: detectLocalArea(q) };
  if (/gym|fitness|workout|yoga/.test(q))
    return { type: "gym", locationModifier: detectLocalArea(q) };
  if (/stadium|arena|sports ground|football|rugby|cricket/.test(q))
    return { type: "stadium", locationModifier: detectLocalArea(q) };
  if (/music venue|concert hall|gig|live music|festival/.test(q))
    return { type: "night_club", locationModifier: detectLocalArea(q) };
  if (/university|college/.test(q))
    return { type: "university", locationModifier: detectLocalArea(q) };
  if (/library/.test(q))
    return { type: "library", locationModifier: detectLocalArea(q) };
  if (/train station|bus station|coach station/.test(q))
    return { type: "transit_station", locationModifier: detectLocalArea(q) };
  if (/airport/.test(q))
    return { type: "airport", locationModifier: detectLocalArea(q) };
  if (/parking|car park/.test(q))
    return { type: "parking", locationModifier: detectLocalArea(q) };
  if (/currency exchange|foreign exchange|forex|money changer|bureau de change|bank|atm|western union|money transfer|paypal|revolut|cash app/.test(q))
    return { type: "bank", locationModifier: detectLocalArea(q) };
  if (/church|mosque|temple|cathedral/.test(q))
    return { type: "place_of_worship", locationModifier: detectLocalArea(q) };
  return { type: "restaurant", locationModifier: detectLocalArea(q) };
}

function isRelevant(types: string[] = [], type: string): boolean {
  const mapping: Record<string, string[]> = {
    restaurant: ["restaurant","food"],
    cafe: ["cafe","bakery","food"],
    bar: ["bar","night_club"],
    supermarket: ["supermarket","grocery_or_supermarket","food"],
    movie_theater: ["movie_theater","point_of_interest"],
    park: ["park","point_of_interest"],
    museum: ["museum","art_gallery","point_of_interest"],
    shopping_mall: ["shopping_mall","store"],
    stadium: ["stadium","point_of_interest"],
    spa: ["spa","point_of_interest"],
    gym: ["gym","health","point_of_interest"],
    transit_station: ["transit_station","train_station","bus_station"],
    airport: ["airport","point_of_interest"],
    place_of_worship: ["church","mosque","temple","cathedral"],
    tourist_attraction: ["tourist_attraction","point_of_interest"],
    lodging: ["lodging","hotel","point_of_interest"],
    night_club: ["night_club","bar","point_of_interest"],
    university: ["university","point_of_interest"],
    library: ["library","point_of_interest"],
    bank: ["bank","finance","point_of_interest","atm","money_transfer"]
  };
  const allowed = mapping[type] || [];
  return types.some((t) => allowed.includes(t));
}

function isSupermarketRelevant(place: GoogleSearchResult, strictKeywords?: string[]): boolean {
  if (!place.types) return false;
  const allowedTypes = ["supermarket","grocery_or_supermarket","food","store"];
  if (!place.types.some((t) => allowedTypes.includes(t))) return false;
  if (strictKeywords && strictKeywords.length > 0) {
    const name = (place.name || "").toLowerCase();
    return strictKeywords.some((k) => name.includes(k.toLowerCase()));
  }
  return true;
}

async function getPlaceDetails(placeId: string): Promise<Venue | null> {
  try {
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=name,formatted_address,formatted_phone_number,website,opening_hours,price_level,rating,user_ratings_total,photos,types,icon&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const detailsRes = await fetch(detailsUrl);
    const result = (await detailsRes.json()).result;
    if (!result) return null;
    const photoRef = result.photos?.[0]?.photo_reference;
    const image = photoRef ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photoRef}&key=${process.env.GOOGLE_MAPS_API_KEY}` : undefined;
    let openStatus: string | undefined;
    if (result.opening_hours?.open_now !== undefined) openStatus = result.opening_hours.open_now ? "Open" : "Closed";
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
      map: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${result.name}, ${result.formatted_address}`)}`
    };
  } catch (err) {
    console.error("Error fetching place details:", err);
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message } = await req.json();
    const { type, locationModifier, strictKeywords, boostAdventure } = detectTypeFromQuery(message);
    const query = encodeURIComponent(`${message} ${locationModifier || "Leeds, UK"}`);
    const searchUrl = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${query}&region=uk&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const searchRes = await fetch(searchUrl);
    const searchData: { results: GoogleSearchResult[] } = await searchRes.json();
    if (!searchData.results?.length) return NextResponse.json({ reply: "Sorry, I couldn't find anything matching your search. Try another experience or location in Leeds!", venues: [] });
    const venues: Venue[] = (await Promise.all(searchData.results.map(async (place) => {
      if (type === "supermarket" || (type === "restaurant" && strictKeywords?.length)) {
        const name = (place.name || "").toLowerCase();
        if (!strictKeywords?.some((k) => name.includes(k.toLowerCase()))) return null;
      } else if (!isRelevant(place.types, type) && !boostAdventure) return null;
      return await getPlaceDetails(place.place_id);
    }))).filter(Boolean) as Venue[];
    if (!venues.length) return NextResponse.json({ reply: "Sorry, I couldn't find anything matching your search. Try another experience or location in Leeds!", venues: [] });
    const sortedVenues = venues.sort((a, b) => {
      if (a.openStatus === "Open" && b.openStatus !== "Open") return -1;
      if (a.openStatus !== "Open" && b.openStatus === "Open") return 1;
      return (b.rating || 0) - (a.rating || 0);
    });
    return NextResponse.json({ reply: "Here are the best spots based on your search:", venues: sortedVenues });
  } catch (err) {
    console.error("Unexpected error:", err);
    return NextResponse.json({ reply: "Something went wrong. Please try again later.", venues: [] });
  }
}
