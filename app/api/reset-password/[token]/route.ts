import { NextRequest, NextResponse } from "next/server";
import db from "@/lib/mongoose";
import User from "@/models/User";
import bcrypt from "bcryptjs";

export async function PATCH(
  req: NextRequest,
  context: { params: Promise<{ token: string }> }
) {
  try {
    const { token } = await context.params;

    if (!token) {
      return NextResponse.json({ message: "Token is required" }, { status: 400 });
    }
    const { password } = await req.json();
    if (!password) {
      return NextResponse.json(
        { message: "Password is required" },
        { status: 400 }
      );
    }

    await db;

    const user = await User.findOne({ resetToken: token });

    if (!user) {
      return NextResponse.json(
        { message: "Invalid reset token" },
        { status: 404 }
      );
    }

    if (!user.resetTokenExpiry || user.resetTokenExpiry < new Date()) {
      return NextResponse.json(
        { message: "Reset token expired. Please request a new one." },
        { status: 410 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { message: "Please verify your email before resetting password." },
        { status: 403 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetToken = undefined;
    user.resetTokenExpiry = undefined;

    await user.save();

    return NextResponse.json(
      { message: "Password reset successful. You can now login." },
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
