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
                      <a href="https://www.urbanary.co.uk" target="_blank" rel="noopener">
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

            <!-- CTA -->
            <tr>
              <td align="center" style="padding:18px 28px 8px 28px;">
                <a href="https://www.urbanary.co.uk" target="_blank" rel="noopener" class="btn">
                  Visit Urbanary
                </a>
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
                        <img src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+RmFjZWJvb2s8L3RpdGxlPjxwYXRoIGQ9Ik05LjEwMSAyMy42OTF2LTcuOThINi42Mjd2LTMuNjY3aDIuNDc0di0xLjU4YzAtNC4wODUgMS44NDgtNS45NzggNS44NTgtNS45NzguNDAxIDAgLjk1NS4wNDIgMS40NjguMTAzYTguNjggOC42OCAwIDAgMSAxLjE0MS4xOTV2My4zMjVhOC42MjMgOC42MjMgMCAwIDAtLjY1My0uMDM2IDI2LjgwNSAyNi44MDUgMCAwIDAtLjczMy0uMDA5Yy0uNzA3IDAtMS4yNTkuMDk2LTEuNjc1LjMwOWExLjY4NiAxLjY4NiAwIDAgMC0uNjc5LjYyMmMtLjI1OC40Mi0uMzc0Ljk5NS0uMzc0IDEuNzUydjEuMjk3aDMuOTE5bC0uMzg2IDIuMTAzLS4yODcgMS41NjRoLTMuMjQ2djguMjQ1QzE5LjM5NiAyMy4yMzggMjQgMTguMTc5IDI0IDEyLjA0NGMwLTYuNjI3LTUuMzczLTEyLTEyLTEycy0xMiA1LjM3My0xMiAxMmMwIDUuNjI4IDMuODc0IDEwLjM1IDkuMTAxIDExLjY0N1oiLz48L3N2Zz4=" width="28" height="28" alt="Facebook" style="filter: invert(18%) sepia(91%) saturate(2403%) hue-rotate(191deg) brightness(95%) contrast(99%);">
                      </a>
                    </td>
                    <td align="center">
                      <a href="https://www.instagram.com/urbanaryleeds/" target="_blank" rel="noopener">
                        <img src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+SW5zdGFncmFtPC90aXRsZT48cGF0aCBkPSJNNy4wMzAxLjA4NGMtMS4yNzY4LjA2MDItMi4xNDg3LjI2NC0yLjkxMS41NjM0LS43ODg4LjMwNzUtMS40NTc1LjcyLTIuMTIyOCAxLjM4NzctLjY2NTIuNjY3Ny0xLjA3NSAxLjMzNjgtMS4zODAyIDIuMTI3LS4yOTU0Ljc2MzgtLjQ5NTYgMS42MzY1LS41NTIgMi45MTQtLjA1NjQgMS4yNzc1LS4wNjg5IDEuNjg4Mi0uMDYyNiA0Ljk0Ny4wMDYyIDMuMjU4Ni4wMjA2IDMuNjY3MS4wODI1IDQuOTQ3My4wNjEgMS4yNzY1LjI2NCAyLjE0ODIuNTYzNSAyLjkxMDcuMzA4Ljc4ODkuNzIgMS40NTczIDEuMzg4IDIuMTIyOC42Njc5LjY2NTUgMS4zMzY1IDEuMDc0MyAyLjEyODUgMS4zOC43NjMyLjI5NSAxLjYzNjEuNDk2MSAyLjkxMzQuNTUyIDEuMjc3My4wNTYgMS42ODg0LjA2OSA0Ljk0NjIuMDYyNyAzLjI1NzgtLjAwNjIgMy42NjgtLjAyMDcgNC45NDc4LS4wODE0IDEuMjgtLjA2MDcgMi4xNDctLjI2NTIgMi45MDk4LS41NjMzLjc4ODktLjMwODYgMS40NTc4LS43MiAyLjEyMjgtMS4zODgxLjY2NS0uNjY4MiAxLjA3NDUtMS4zMzc4IDEuMzc5NS0yLjEyODQuMjk1Ny0uNzYzMi40OTY2LTEuNjM2LjU1Mi0yLjkxMjQuMDU2LTEuMjgwOS4wNjkyLTEuNjg5OC4wNjMtNC45NDgtLjAwNjMtMy4yNTgzLS4wMjEtMy42NjY4LS4wODE3LTQuOTQ2NS0uMDYwNy0xLjI3OTctLjI2NC0yLjE0ODctLjU2MzMtMi45MTE3LS4zMDg0LS43ODg5LS43Mi0xLjQ1NjgtMS4zODc2LTIuMTIyOEMyMS4yOTgyIDEuMzMgMjAuNjI4LjkyMDggMTkuODM3OC42MTY1IDE5LjA3NC4zMjEgMTguMjAxNy4xMTk3IDE2LjkyNDQuMDY0NSAxNS42NDcxLjAwOTMgMTUuMjM2LS4wMDUgMTEuOTc3LjAwMTQgOC43MTguMDA3NiA4LjMxLjAyMTUgNy4wMzAxLjA4MzltLjE0MDIgMjEuNjkzMmMtMS4xNy0uMDUwOS0xLjgwNTMtLjI0NTMtMi4yMjg3LS40MDgtLjU2MDYtLjIxNi0uOTYtLjQ3NzEtMS4zODE5LS44OTUtLjQyMi0uNDE3OC0uNjgxMS0uODE4Ni0uOS0xLjM3OC0uMTY0NC0uNDIzNC0uMzYyNC0xLjA1OC0uNDE3MS0yLjIyOC0uMDU5NS0xLjI2NDUtLjA3Mi0xLjY0NDItLjA3OS00Ljg0OC0uMDA3LTMuMjAzNy4wMDUzLTMuNTgzLjA2MDctNC44NDguMDUtMS4xNjkuMjQ1Ni0xLjgwNS40MDgtMi4yMjgyLjIxNi0uNTYxMy40NzYyLS45Ni44OTUtMS4zODE2LjQxODgtLjQyMTcuODE4NC0uNjgxNCAxLjM3ODMtLjkwMDMuNDIzLS4xNjUxIDEuMDU3NS0uMzYxNCAyLjIyNy0uNDE3MSAxLjI2NTUtLjA2IDEuNjQ0Ny0uMDcyIDQuODQ4LS4wNzkgMy4yMDMzLS4wMDcgMy41ODM1LjAwNSA0Ljg0OTUuMDYwOCAxLjE2OS4wNTA4IDEuODA1My4yNDQ1IDIuMjI4LjQwOC41NjA4LjIxNi45Ni40NzU0IDEuMzgxNi44OTUuNDIxNy40MTk0LjY4MTYuODE3Ni45MDA1IDEuMzc4Ny4xNjUzLjQyMTcuMzYxNyAxLjA1Ni40MTY5IDIuMjI2My4wNjAyIDEuMjY1NS4wNzM5IDEuNjQ1LjA3OTYgNC44NDguMDA1OCAzLjIwMy0uMDA1NSAzLjU4MzQtLjA2MSA0Ljg0OC0uMDUxIDEuMTctLjI0NSAxLjgwNTUtLjQwOCAyLjIyOTQtLjIxNi41NjA0LS40NzYzLjk2LS44OTU0IDEuMzgxNC0uNDE5LjQyMTUtLjgxODEuNjgxMS0xLjM3ODMuOS0uNDIyNC4xNjQ5LTEuMDU3Ny4zNjE3LTIuMjI2Mi40MTc0LTEuMjY1Ni4wNTk1LTEuNjQ0OC4wNzItNC44NDkzLjA3OS0zLjIwNDUuMDA3LTMuNTgyNS0uMDA2LTQuODQ4LS4wNjA4TTE2Ljk1MyA1LjU4NjRBMS40NCAxLjQ0IDAgMSAwIDE4LjM5IDQuMTQ0YTEuNDQgMS40NCAwIDAgMC0xLjQzNyAxLjQ0MjRNNS44Mzg1IDEyLjAxMmMuMDA2NyAzLjQwMzIgMi43NzA2IDYuMTU1NyA2LjE3MyA2LjE0OTMgMy40MDI2LS4wMDY1IDYuMTU3LTIuNzcwMSA2LjE1MDYtNi4xNzMzLS4wMDY1LTMuNDAzMi0yLjc3MS02LjE1NjUtNi4xNzQtNi4xNDk4LTMuNDAzLjAwNjctNi4xNTYgMi43NzEtNi4xNDk2IDYuMTczOE04IDEyLjAwNzdhNCA0IDAgMSAxIDQuMDA4IDMuOTkyMUEzLjk5OTYgMy45OTk2IDAgMCAxIDggMTIuMDA3NyIvPjwvc3ZnPg==" width="28" height="28" alt="Instagram" style="filter: invert(18%) sepia(91%) saturate(2403%) hue-rotate(191deg) brightness(95%) contrast(99%);">
                      </a>
                    </td>
                    <td align="center">
                      <a href="https://www.tiktok.com/@urbanaryleeds" target="_blank" rel="noopener">
                        <img src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+VGlrVG9rPC90aXRsZT48cGF0aCBkPSJNMTIuNTI1LjAyYzEuMzEtLjAyIDIuNjEtLjAxIDMuOTEtLjAyLjA4IDEuNTMuNjMgMy4wOSAxLjc1IDQuMTcgMS4xMiAxLjExIDIuNyAxLjYyIDQuMjQgMS43OXY0LjAzYy0xLjQ0LS4wNS0yLjg5LS4zNS00LjItLjk3LS41Ny0uMjYtMS4xLS41OS0xLjYyLS45My0uMDEgMi45Mi4wMSA1Ljg0LS4wMiA4Ljc1LS4wOCAxLjQtLjU0IDIuNzktMS4zNSAzLjk0LTEuMzEgMS45Mi0zLjU4IDMuMTctNS45MSAzLjIxLTEuNDMuMDgtMi44Ni0uMzEtNC4wOC0xLjAzLTIuMDItMS4xOS0zLjQ0LTMuMzctMy42NS01LjcxLS4wMi0uNS0uMDMtMS0uMDEtMS40OS4xOC0xLjkgMS4xMi0zLjcyIDIuNTgtNC45NiAxLjY2LTEuNDQgMy45OC0yLjEzIDYuMTUtMS43Mi4wMiAxLjQ4LS4wNCAyLjk2LS4wNCA0LjQ0LS45OS0uMzItMi4xNS0uMjMtMy4wMi4zNy0uNjMuNDEtMS4xMSAxLjA0LTEuMzYgMS43NS0uMjEuNTEtLjE1IDEuMDctLjE0IDEuNjEuMjQgMS42NCAxLjgyIDMuMDIgMy41IDIuODcgMS4xMi0uMDEgMi4xOS0uNjYgMi43Ny0xLjYxLjE5LS4zMy40LS42Ny40MS0xLjA2LjEtMS43OS4wNi0zLjU3LjA3LTUuMzYuMDEtNC4wMy0uMDEtOC4wNS4wMi0xMi4wN3oiLz48L3N2Zz4=" width="28" height="28" alt="TikTok" style="filter: invert(18%) sepia(91%) saturate(2403%) hue-rotate(191deg) brightness(95%) contrast(99%);">
                      </a>
                    </td>
                    <td align="center">
                      <a href="https://www.linkedin.com/company/urbanary/" target="_blank" rel="noopener">
                        <img src="data:image/svg+xml;base64,PHN2ZyByb2xlPSJpbWciIHZpZXdCb3g9IjAgMCAyNCAyNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48dGl0bGU+TGlua2VkSW48L3RpdGxlPjxwYXRoIGQ9Ik0yMC40NDcgMjAuNDUyaC0zLjU1NHYtNS41NjljMC0xLjMyOC0uMDI3LTMuMDM3LTEuODUyLTMuMDM3LTEuODUzIDAtMi4xMzYgMS40NDUtMi4xMzYgMi45Mzl2NS42NjdIOS4zNTFWOWgzLjQxNHYxLjU2MWguMDQ2Yy40NzctLjkgMS42MzctMS44NSAzLjM3LTEuODUgMy42MDEgMCA0LjI2NyAyLjM3IDQuMjY3IDUuNDU1djYuMjg2ek01LjMzNyA3LjQzM2MtMS4xNDQgMC0yLjA2My0uOTI2LTIuMDYzLTIuMDY1IDAtMS4xMzguOTItMi4wNjMgMi4wNjMtMi4wNjMgMS4xNCAwIDIuMDY0LjkyNSAyLjA2NCAyLjA2MyAwIDEuMTM5LS45MjUgMi4wNjUtMi4wNjQgMi4wNjV6bTEuNzgyIDEzLjAxOUgzLjU1NVY5aDMuNTY0djExLjQ1MnpNMjIuMjI1IDBIMS43NzFDLjc5MiAwIDAgLjc3NCAwIDEuNzI5djIwLjU0MkMwIDIzLjIyNy43OTIgMjQgMS43NzEgMjRoMjAuNDUxQzIzLjIgMjQgMjQgMjMuMjI3IDI0IDIyLjI3MVYxLjcyOUMyNCAuNzc0IDIzLjIgMCAyMi4yMjIgMGguMDAzeiIvPjwvc3ZnPg==" width="28" height="28" alt="LinkedIn" style="filter: invert(18%) sepia(91%) saturate(2403%) hue-rotate(191deg) brightness(95%) contrast(99%);">
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
