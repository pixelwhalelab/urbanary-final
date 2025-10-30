import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import db from "@/lib/mongoose";
import User from "@/models/User";

export async function PATCH(req: Request) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { message: "Token and new password are required." },
        { status: 400 }
      );
    }
    await db;
    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid or expired reset token." },
        { status: 400 }
      );
    }

    if (user.resetTokenExpiry && user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { message: "Reset token has expired. Please request a new one." },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;
    await user.save();

    return NextResponse.json(
      {
        message: "Password reset successful.",
        redirectUrl: "/login",
      },
      { status: 200 }
    );
  } catch (err) {
    console.error("Reset Password Error:", err);
    return NextResponse.json(
      { message: "Server error. Please try again later." },
      { status: 500 }
    );
  }
}
