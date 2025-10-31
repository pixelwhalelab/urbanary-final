import { NextResponse } from "next/server";
import crypto from "crypto";
import { generateMathCaptcha } from "@/lib/mathCaptcha";

const COOKIE_NAME = "urbanary_captcha";
const SECRET =
  process.env.CAPTCHA_SECRET ||
  "a3f5b9c27d4e1f8a9c0b6d2fe4a7c1b85f3d2e9ac7b1f0d48e2a9b3cd6f0e1b7";

function signPayload(payload: string) {
  return crypto.createHmac("sha256", SECRET).update(payload).digest("hex");
}

export async function GET() {
  const { svg, answer } = generateMathCaptcha();

  const timestamp = Date.now();
  const payload = `${answer}:${timestamp}`;
  const sig = signPayload(payload);
  const cookieValue = Buffer.from(`${payload}:${sig}`).toString("base64");

  const res = NextResponse.json({ svg });

  const cookieOptions = [
    `${COOKIE_NAME}=${cookieValue}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Strict",
    `Max-Age=${5 * 60}`,
  ];
  if (process.env.NODE_ENV === "production") cookieOptions.push("Secure");

  res.headers.set("Set-Cookie", cookieOptions.join("; "));
  return res;
}
