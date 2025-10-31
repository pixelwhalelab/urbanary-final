import { NextResponse } from "next/server";
import db from "@/lib/mongoose";
import VenueCategory from "@/models/VenueCategory";

export async function POST(req: Request) {
  try {
    await db;
    const { category } = await req.json();

    if (!category || !category.trim()) {
      return NextResponse.json(
        { success: false, message: "Category is required" },
        { status: 400 }
      );
    }

    const formattedCategory = category.trim().toLowerCase();

    const existing = await VenueCategory.findOne({ category: formattedCategory });
    if (existing) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      );
    }

    const newCategory = await VenueCategory.create({
      category: formattedCategory,
    });

    return NextResponse.json(
      { success: true, data: newCategory },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json(
        { success: false, message: "Category already exists" },
        { status: 409 }
      );
    }

    console.error("Error creating category:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    await db;
    const categories = await VenueCategory.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, data: categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
