import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "urbanary_captcha";
const SECRET =
  process.env.CAPTCHA_SECRET ||
  "a3f5b9c27d4e1f8a9c0b6d2fe4a7c1b85f3d2e9ac7b1f0d48e2a9b3cd6f0e1b7";

function verifyCaptcha(cookie: string | undefined, userAnswer: string) {
  if (!cookie) return false;

  try {
    const decoded = Buffer.from(cookie, "base64").toString();
    const [answer, timestamp, sig] = decoded.split(":");
    const payload = `${answer}:${timestamp}`;

    const expectedSig = crypto
      .createHmac("sha256", SECRET)
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
  const { answer } = await req.json();
  const cookie = req.headers.get("cookie")?.match(/urbanary_captcha=([^;]+)/)?.[1];

  const isValid = verifyCaptcha(cookie, answer);

  return NextResponse.json({ success: isValid });
}
