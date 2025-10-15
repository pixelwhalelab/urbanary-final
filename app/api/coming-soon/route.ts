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

    await ComingSoonData.create({
      email,
      ip,
      mac,
      device: deviceInfo,
      location: geo,
      isLocalhost,
      isPrivate,
    });

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>Welcome to Urbanary</title>
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <meta name="color-scheme" content="light only">
    <style>
      img{border:0;outline:none;text-decoration:none;display:block;}
      table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
      a{text-decoration:none;}
      /* Brand palette */
      .btn{display:inline-block;background:#F5D64B;color:#0A3F62;font-family:Arial,Helvetica,sans-serif;font-weight:700;font-size:16px;line-height:20px;padding:12px 22px;border-radius:999px;}
      .shadow-card{box-shadow:0 6px 24px rgba(10,63,98,0.15);}
      .social-icons img{width:28px;height:28px;margin-right:10px;}
    </style>
    <!--[if gte mso 9]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
  </head>

  <body style="margin:0;padding:0;background-color:#0E5C8E;background-image:url('https://www.urbanary.co.uk/assets/slider.jpg');background-repeat:no-repeat;background-position:center top;background-size:cover;">

    <!-- Preheader -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      You’re on the Urbanary waitlist—early access is coming soon.
    </div>

    <!-- Background fix for Outlook -->
    <!--[if gte mso 9]>
    <v:background fill="t">
      <v:fill type="frame" src="https://www.urbanary.co.uk/assets/slider.jpg" color="#0E5C8E"/>
    </v:background>
    <![endif]-->

    <table role="presentation" width="100%" height="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" valign="top" style="padding:24px 12px;">
          
          <table role="presentation" width="100%" style="max-width:640px;background:rgba(255,255,255,0.95);border-radius:16px;overflow:hidden;" class="shadow-card">
            
            <!-- Header -->
            <tr>
              <td align="center" style="padding:32px 24px;background:#0E5C8E;">
                <table role="presentation">
                  <tr>
                    <td style="background:#ffffff;border-radius:14px;padding:10px 14px;">
                      <a href="#" rel="noopener">
                        <img src="https://www.urbanary.co.uk/logo/49962.png" width="220" alt="Urbanary" style="width:220px;height:auto;">
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:28px 28px 8px 28px;font-family:Arial,Helvetica,sans-serif;color:#0A3F62;">
                <h1 style="margin:0 0 12px 0;font-size:24px;line-height:1.3;font-weight:800;color:#0E5C8E;">
                  You’re in! 🎉
                </h1>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;">
                  Thanks for signing up to the Urbanary waitlist — you’re officially on the inside. 🎉
                </p>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;">
                  As one of our early members, you’ll get <strong>exclusive access the day before we launch</strong>, so you can be the first to explore Leeds’ best bars, restaurants, and hidden gems — all tailored to your vibe.
                </p>
                <p style="margin:0;font-size:16px;line-height:1.6;">
                  We can’t wait to show you what’s coming. Stay tuned for your early-access invite soon!
                </p>
              </td>
            </tr>

           

            <!-- Sign-off -->
            <tr>
              <td style="padding:18px 28px 6px 28px;font-family:Arial,Helvetica,sans-serif;color:#0A3F62;">
                <p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;">Cheers,</p>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;font-weight:700;">The Urbanary Team</p>

                <!-- Social Icons -->
                <table role="presentation" class="social-icons" align="center" cellpadding="0" cellspacing="0">
                  <tr>
                    <td align="center">
                      <a href="https://www.facebook.com/profile.php?id=61579643593745" target="_blank" rel="noopener">
                        <img src="https://www.urbanary.co.uk/assets/facebook.png" width="28" height="28" alt="Facebook" style="filter: invert(18%) sepia(91%) saturate(2403%) hue-rotate(191deg) brightness(95%) contrast(99%);">
                      </a>
                    </td>
                    <td align="center">
                      <a href="https://www.instagram.com/urbanaryleeds/" target="_blank" rel="noopener">
                        <img src="https://www.urbanary.co.uk/assets/instagram.png" width="28" height="28" alt="Instagram" style="filter: invert(18%) sepia(91%) saturate(2403%) hue-rotate(191deg) brightness(95%) contrast(99%);">
                      </a>
                    </td>
                    <td align="center">
                      <a href="https://www.tiktok.com/@urbanaryleeds" target="_blank" rel="noopener">
                        <img src="https://www.urbanary.co.uk/assets/tiktok.png" width="28" height="28" alt="TikTok" style="filter: invert(18%) sepia(91%) saturate(2403%) hue-rotate(191deg) brightness(95%) contrast(99%);">
                      </a>
                    </td>
                    <td align="center">
                      <a href="https://www.linkedin.com/company/urbanary/" target="_blank" rel="noopener">
                        <img src="https://www.urbanary.co.uk/assets/linkedin.png" width="28" height="28" alt="LinkedIn" style="filter: invert(18%) sepia(91%) saturate(2403%) hue-rotate(191deg) brightness(95%) contrast(99%);">
                      </a>
                    </td>
                  </tr>
                </table>

              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td align="center" style="padding:16px 24px 28px 24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#6a7b88;">
                  You received this email because you joined the Urbanary waitlist.
                  If this wasn’t you, you can safely ignore this message.
                </p>
                <p style="margin:8px 0 0 0;font-size:12px;line-height:1.6;">
                  <a href="https://www.urbanary.co.uk" target="_blank" rel="noopener" style="color:#0E5C8E;">urbanary.co.uk</a>
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`;

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
