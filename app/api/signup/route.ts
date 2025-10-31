import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/mongoose";
import User from "@/models/User";
import { MailtrapClient } from "mailtrap";
import { generateInitialAvatar } from "@/utils/generateInitialAvatar";
import { otpEmailTemplate } from "@/utils/emailTemplates";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN!;
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL!;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "Urbanary";

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
    const { name, email, phone, dob, password, captcha } = await req.json();

    if (!name || !email || !phone || !dob || !password || !captcha) {
      return NextResponse.json(
        { message: "All fields are required" },
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

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { message: "Email already registered" },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);
    const avatarSvg = generateInitialAvatar(name);
    const randomId = crypto.randomUUID();
    const avatarsDir = path.join(process.cwd(), "public", "avatars");
    if (!fs.existsSync(avatarsDir)) {
      fs.mkdirSync(avatarsDir, { recursive: true });
    }

    const newUser = await User.create({
      name,
      email,
      phone,
      dob,
      password: hashedPassword,
      otp,
      otpExpiry,
      avatar: avatarSvg,
    });
    console.log("New User Created:", newUser);

    const client = new MailtrapClient({ token: MAILTRAP_TOKEN });
    await client.send({
      from: { email: MAIL_FROM_EMAIL, name: MAIL_FROM_NAME },
      to: [{ email }],
      subject: "Your OTP Code",
      html: otpEmailTemplate(otp),
    });

    return NextResponse.json(
      {
        message: "Signup successful. OTP sent to your email.",
        redirectUrl: "/verify-email",
        userId: newUser._id,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Signup Error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}
