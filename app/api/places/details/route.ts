import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const place_id = searchParams.get("place_id");

  if (!place_id)
    return NextResponse.json({ success: false, message: "place_id required" }, { status: 400 });

  try {
    const apiKey = process.env.GOOGLE_PLACES_API_KEY;
    const res = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&fields=name,formatted_phone_number,rating,user_ratings_total,opening_hours,photos,geometry&key=${apiKey}`
    );
    const data = await res.json();

    if (data.status !== "OK")
      return NextResponse.json({ success: false, message: data.status }, { status: 400 });

    return NextResponse.json({ success: true, place: data.result });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { success: false, message: "Google Details API failed" },
      { status: 500 }
    );
  }
}
