import { NextRequest, NextResponse } from "next/server";
import os from "os";
import db from "@/lib/mongoose";
import ComingSoonData from "@/models/ComingSoonData";
import { UAParser } from "ua-parser-js";

function isPrivateIP(ip: string) {
  return (
    ip.startsWith("10.") ||
    ip.startsWith("172.") ||
    ip.startsWith("192.168.") ||
    ip === "127.0.0.1" ||
    ip === "::1"
  );
}

// Send email using Mailtrap API
async function sendMailtrapEmail(to: string, subject: string, html: string) {
  try {
    const response = await fetch("https://send.api.mailtrap.io/api/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MAILTRAP_TOKEN}`,
      },
      body: JSON.stringify({
        from: {
          email: process.env.MAIL_FROM_EMAIL || "no-reply@urbanary.test",
          name: process.env.MAIL_FROM_NAME || "Urbanary",
        },
        to: [{ email: to }],
        subject,
        html,
      }),
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Mailtrap API Error:", text);
    }
  } catch (error) {
    console.error("Failed to send email via Mailtrap API:", error);
  }
}

export async function POST(req: NextRequest) {
  try {
    await db;

    const { email } = await req.json();

    const bypassEmails = [
      "avijeetpaul100@gmail.com",
      "avijeetpaul@icloud.com",
      "james@urbanary.co.uk",
      "bals@fiveriversdesigns.com",
    ];
    if (bypassEmails.includes(email.toLowerCase())) {
      return NextResponse.json({ closePopup: true });
    }

    const forwarded = req.headers.get("x-forwarded-for");
    const ip = forwarded ? forwarded.split(",")[0] : "unknown";

    const isLocalhost = ip === "127.0.0.1" || ip === "::1";
    const isPrivate = isPrivateIP(ip);

    const networkInterfaces = os.networkInterfaces();
    let mac = "unknown";
    for (const iface of Object.values(networkInterfaces)) {
      if (iface) {
        const valid = iface.find((d) => d.mac && d.mac !== "00:00:00:00:00:00");
        if (valid) {
          mac = valid.mac;
          break;
        }
      }
    }

    const userAgent = req.headers.get("user-agent") || "unknown";
    const parser = new UAParser(userAgent);
    const deviceInfo = parser.getResult();

    interface GeoLocation {
      status?: string;
      country?: string;
      countryCode?: string;
      region?: string;
      regionName?: string;
      city?: string;
      zip?: string;
      lat?: number;
      lon?: number;
      timezone?: string;
      isp?: string;
      org?: string;
      as?: string;
      query?: string;
    }

    let geo: GeoLocation = {};
    if (!isPrivate) {
      try {
        const res = await fetch(`http://ip-api.com/json/${ip}`);
        geo = (await res.json()) as GeoLocation;
      } catch (err) {
        console.error("IP Geolocation error:", err);
      }
    } else {
      geo = { city: "private", regionName: "private", country: "private" };
    }

    // Save to database
    await ComingSoonData.create({
      email,
      ip,
      mac,
      device: deviceInfo,
      location: geo,
      isLocalhost,
      isPrivate,
    });

    // HTML Email template
    const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Welcome to the Urbanary waitlist</title>
  </head>
  <body style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,'Helvetica Neue',Arial;color:#111;line-height:1.5;">
    <table width="100%" cellpadding="0" cellspacing="0" role="presentation">
      <tr>
        <td align="center">
          <table width="600" cellpadding="24" cellspacing="0" role="presentation" style="max-width:600px;">
            <tr>
              <td style="text-align:left;">
                <h1 style="margin:0 0 12px 0;font-size:22px;">Thanks for signing up to the Urbanary waitlist — you’re officially on the inside. 🎉</h1>
                <p style="margin:0 0 12px 0;">As one of our early members, you’ll get exclusive access the day before we launch, so you can be the first to explore Leeds’ best bars, restaurants, and hidden gems — all tailored to your vibe.</p>
                <p style="margin:0 0 12px 0;">We can’t wait to show you what’s coming. Stay tuned for your early-access invite soon!</p>
                <p style="margin:24px 0 8px 0;">Cheers,<br/>The Urbanary Team</p>
                <hr style="border:none;border-top:1px solid #e6e6e6;margin:20px 0;" />
                <p style="margin:0;font-size:13px;color:#666;">Discover your city.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;

    // Send welcome email
    await sendMailtrapEmail(email, "You're on the Urbanary waitlist!", html);

    return NextResponse.json({ success: true, closePopup: false });
  } catch (err) {
    console.error("Error saving email:", err);
    return NextResponse.json(
      { error: "Failed to save email" },
      { status: 500 }
    );
  }
}
