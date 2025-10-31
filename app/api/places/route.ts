import { NextResponse } from "next/server";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("query");

    if (!query) {
      return NextResponse.json(
        { success: false, message: "Query required" },
        { status: 400 }
      );
    }

    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!apiKey) {
      console.error("Missing GOOGLE_PLACES_API_KEY in environment variables");
      return NextResponse.json(
        { success: false, message: "Server misconfiguration" },
        { status: 500 }
      );
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(
        query
      )}&key=${apiKey}`
    );

    const data = await response.json();

    if (!data.results || data.results.length === 0) {
      return NextResponse.json({ success: true, places: [] });
    }

    const places = data.results.map((p: any) => {
      const photoRef = p.photos?.[0]?.photo_reference || null;
      const imageUrl = photoRef
        ? `https://maps.googleapis.com/maps/api/place/photo?maxwidth=600&photo_reference=${photoRef}&key=${apiKey}`
        : "/assets/no-image.jpg";

      return {
        place_id: p.place_id,
        name: p.name,
        address: p.formatted_address,
        imageUrl,
      };
    });

    return NextResponse.json({ success: true, places });
  } catch (err) {
    console.error("Google Places API error:", err);
    return NextResponse.json(
      { success: false, message: "Google API failed" },
      { status: 500 }
    );
  }
}
