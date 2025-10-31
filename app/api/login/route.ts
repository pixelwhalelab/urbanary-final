import { NextResponse } from "next/server";
import db from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const JWT_SECRET = process.env.JWT_SECRET!;
const CAPTCHA_SECRET =
  process.env.CAPTCHA_SECRET ||
  "a3f5b9c27d4e1f8a9c0b6d2fe4a7c1b85f3d2e9ac7b1f0d48e2a9b3cd6f0e1b7";

const CAPTCHA_COOKIE = "urbanary_captcha";

function verifyCaptcha(
  cookie: string | undefined,
  userAnswer: string
): boolean {
  if (!cookie || !userAnswer) return false;

  try {
    const decoded = Buffer.from(cookie, "base64").toString();
    const [answer, timestamp, sig] = decoded.split(":");
    const payload = `${answer}:${timestamp}`;

    const expectedSig = crypto
      .createHmac("sha256", CAPTCHA_SECRET)
      .update(payload)
      .digest("hex");

    if (sig !== expectedSig) return false;
    if (Date.now() - parseInt(timestamp) > 5 * 60 * 1000) return false;
    return Number(userAnswer) === Number(answer);
  } catch {
    return false;
  }
}

export async function POST(req: Request) {
  try {
    const { email, password, captcha } = await req.json();
    console.log("Captch : ", captcha);
    if (!email || !password || !captcha) {
      return NextResponse.json(
        { message: "Email, password, and captcha are required" },
        { status: 400 }
      );
    }

    const cookie = req.headers
      .get("cookie")
      ?.match(new RegExp(`${CAPTCHA_COOKIE}=([^;]+)`))?.[1];

    const captchaValid = verifyCaptcha(cookie, captcha);

    if (!captchaValid) {
      return NextResponse.json(
        { message: "Invalid or expired captcha" },
        { status: 403 }
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
