import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import db from "@/lib/mongoose";
import User from "@/models/User";

const JWT_SECRET = process.env.JWT_SECRET!;

export async function GET(req: Request) {
  try {
    await db;

    const token = req.headers.get("cookie")
      ?.split("; ")
      .find((c) => c.startsWith("login-token="))
      ?.split("=")[1];

    if (!token) {
      return NextResponse.json({ message: "Not authenticated" }, { status: 401 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, JWT_SECRET);
    } catch (err) {
      return NextResponse.json({ message: "Invalid or expired token" }, { status: 401 });
    }

    const user = await User.findOne({ userId: decoded.userId })
      .select("-password -otp -otpExpiry -resetToken -resetTokenExpiry -__v");

    if (!user) {
      return NextResponse.json({ message: "User not found" }, { status: 404 });
    }

    return NextResponse.json(
      {
        success: true,
        user,
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Check Auth Error:", err);
    return NextResponse.json(
      { message: "Server error" },
      { status: 500 }
    );
  }
}
