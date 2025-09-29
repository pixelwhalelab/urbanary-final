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

export async function POST(req: NextRequest) {
  try {
    await db;

    const { email } = await req.json();

    const bypassEmails = ["avijeetpaul100@gmail.com", "avijeetpaul@icloud.com", "james@urbanary.co.uk", "bals@fiveriversdesigns.com"];
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

    let geo: Record<string, any> = {};
    if (!isPrivate) {
      try {
        const res = await fetch(`http://ip-api.com/json/${ip}`);
        geo = await res.json();
      } catch (err) {
        console.error("IP Geolocation error:", err);
      }
    } else {
      geo = { city: "private", regionName: "private", country: "private" };
    }

    await ComingSoonData.create({
      email,
      ip,
      mac,
      device: deviceInfo,
      location: geo,
      isLocalhost,
      isPrivate,
    });

    return NextResponse.json({ success: true, closePopup: false });
  } catch (err) {
    console.error("Error saving email:", err);
    return NextResponse.json(
      { error: "Failed to save email" },
      { status: 500 }
    );
  }
}
