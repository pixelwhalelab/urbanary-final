import { NextResponse } from "next/server";
import db from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";


const JWT_SECRET = process.env.JWT_SECRET!;

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { message: "Email and password are required" },
        { status: 400 }
      );
    }

    await db;

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "Email not registered" },
        { status: 404 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email before logging in." },
        { status: 403 }
      );
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return NextResponse.json(
        { message: "Invalid password" },
        { status: 400 }
      );
    }
    const sixMonthsInSeconds = 6 * 30 * 24 * 60 * 60;
    const token = jwt.sign(
      { userId: user.userId, email: user.email },
      JWT_SECRET,
      { expiresIn: sixMonthsInSeconds }
    );

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: { name: user.name, email: user.email },
      },
      { status: 200 }
    );

    response.cookies.set({
      name: "login-token",
      value: token,
      httpOnly: true,
      path: "/",
      maxAge: sixMonthsInSeconds,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (err) {
    console.error("Login Error:", err);
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
