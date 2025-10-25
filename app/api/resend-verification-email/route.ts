import { NextResponse } from "next/server";
import db from "@/lib/mongoose";
import User from "@/models/User";
import { MailtrapClient } from "mailtrap";
import { otpEmailTemplate } from "@/utils/emailTemplates";

const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN!;
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL!;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "Urbanary";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();
    if (!email) {
      return NextResponse.json(
        { message: "Email is required" },
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

    if (user.isVerified) {
      return NextResponse.json({
        message: "Already verified",
        redirectUrl: "/login",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); 

    user.otp = otp;
    user.otpExpiry = otpExpiry;
    await user.save();

    const client = new MailtrapClient({ token: MAILTRAP_TOKEN });
    await client.send({
      from: { email: MAIL_FROM_EMAIL, name: MAIL_FROM_NAME },
      to: [{ email }],
      subject: "Your OTP Code",
      html: otpEmailTemplate(otp),
    });

    return NextResponse.json(
      {
        message: "OTP sent successfully.",
        redirectUrl: "/verify-email",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Resend OTP Error:", err);
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
