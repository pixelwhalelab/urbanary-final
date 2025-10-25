import { NextResponse } from "next/server";

export async function POST() {
  try {
    const response = NextResponse.json({ message: "Logged out successfully" });

    response.cookies.set({
      name: "login-token",
      value: "",
      path: "/",
      maxAge: 0,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return response;
  } catch (err) {
    console.error("Logout Error:", err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}
