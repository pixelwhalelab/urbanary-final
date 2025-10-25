import { NextResponse } from "next/server";
import db from "@/lib/mongoose";
import User from "@/models/User";
import { v4 as uuidv4 } from "uuid";
import { MailtrapClient } from "mailtrap";
import { resetPasswordEmailTemplate } from "@/utils/emailTemplates";

const MAILTRAP_TOKEN = process.env.MAILTRAP_TOKEN!;
const MAIL_FROM_EMAIL = process.env.MAIL_FROM_EMAIL!;
const MAIL_FROM_NAME = process.env.MAIL_FROM_NAME || "Urbanary";
const LIVE_URL = process.env.LIVE_URL!;

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
    if (!user.isVerified) {
      return NextResponse.json(
        {
          message:
            "Please verify your email first before resetting your password.",
        },
        { status: 403 }
      );
    }

    const resetToken = uuidv4();
    const resetTokenExpiry  = new Date(Date.now() + 60 * 60 * 1000);
    await User.updateOne(
      { _id: user._id },
      { resetToken, resetTokenExpiry }
    );

    const resetUrl = `${LIVE_URL}/reset-password/${resetToken}`;

    const client = new MailtrapClient({ token: MAILTRAP_TOKEN });
    await client.send({
      from: { email: MAIL_FROM_EMAIL, name: MAIL_FROM_NAME },
      to: [{ email }],
      subject: "Reset Your Password",
      html: resetPasswordEmailTemplate(resetUrl),
    });

    return NextResponse.json(
      {
        message: "Reset password email sent. Please check your inbox.",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Forgot Password Error:", err);
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
