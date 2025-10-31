import { NextResponse } from "next/server";
import db from "@/lib/mongoose";
import Venue from "@/models/Venue";

export async function POST(req: Request) {
  try {
    await db;
    const body = await req.json();

    const { image, name, description, phone, mapLink, categories, rating, reviews, hours } = body;

    if (!image || !name || !description || !mapLink || !rating || !reviews)
      return NextResponse.json({ success: false, message: "All fields required." }, { status: 400 });

    const newVenue = await Venue.create({
      image,
      name,
      description,
      phone: phone || "",
      mapLink,
      categories,
      rating,
      reviews,
      hours,
    });

    return NextResponse.json({ success: true, data: newVenue }, { status: 201 });
  } catch (err: any) {
    console.error(err);
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}

export async function GET() {
  try {
    await db;
    const venues = await Venue.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: venues });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ success: false, message: "Server error" }, { status: 500 });
  }
}
