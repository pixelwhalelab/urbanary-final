import { NextResponse } from "next/server";
import db from "@/lib/mongoose";
import User from "@/models/User";
import { MailtrapClient } from "mailtrap";
import { welcomeEmailTemplate } from "@/utils/emailTemplates";
const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN!;
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL!;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "Urbanary";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { message: "Email and OTP are required" },
        { status: 400 }
      );
    }

    await db;
    const user = await User.findOne({ email });
    if (!user) {
      return NextResponse.json(
        { message: "Email not registered. Redirecting to signup page" },
        { status: 404 }
      );
    }

    if (user.isVerified) {
      return NextResponse.json({
        message: "Already verified",
        redirectUrl: "/login",
      });
    }

    if (!user.otp || !user.otpExpiry || user.otpExpiry < new Date()) {
      return NextResponse.json({ message: "OTP expired" }, { status: 410 });
    }

    if (user.otp !== otp) {
      return NextResponse.json({ message: "Invalid OTP" }, { status: 400 });
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otpExpiry = undefined;
    await User.updateOne(
      { _id: user._id },
      { $set: { isVerified: true }, $unset: { otp: "", otpExpiry: "" } }
    );
    const client = new MailtrapClient({ token: MAILTRAP_TOKEN });
    await client.send({
      from: { email: MAIL_FROM_EMAIL, name: MAIL_FROM_NAME },
      to: [{ email }],
      subject: "Welcome to Urbanary",
      html: welcomeEmailTemplate(),
    });

    return NextResponse.json(
      { message: "Email verified", redirectUrl: "/login" },
      { status: 200 }
    );
  } catch (err) {
    console.error("Verify Email Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
