import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/mongoose";
import User from "@/models/User";
import { MailtrapClient } from "mailtrap";

const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN!;
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL!;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "Urbanary";

export async function POST(req: Request) {
  try {
    const { name, email, phone, dob, password } = await req.json();

    if (!name || !email || !phone || !dob || !password) {
      return NextResponse.json({ message: "All fields are required" }, { status: 400 });
    }

    await db;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json({ message: "Email already registered" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000);

    const newUser = await User.create({
      name,
      email,
      phone,
      dob,
      password: hashedPassword,
      otp,
      otpExpiry,
    });
    console.log("New User Created:", newUser);

    const client = new MailtrapClient({ token: MAILTRAP_TOKEN });
    await client.send({
      from: { email: MAIL_FROM_EMAIL, name: MAIL_FROM_NAME },
      to: [{ email }],
      subject: "Your OTP Code",
      html: `
        <p>Hello ${name},</p>
        <p>Your OTP code is: <strong>${otp}</strong></p>
        <p>It will expire in 10 minutes.</p>
      `,
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
    return NextResponse.json({ message: "Internal server error" }, { status: 500 });
  }
}
