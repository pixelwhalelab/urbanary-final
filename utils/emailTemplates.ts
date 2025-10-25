export function otpEmailTemplate(otp: string) {
  return `
    <!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <title>Urbanary — OTP Verification</title>
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="color-scheme" content="light only">
  <style>
    img{border:0;outline:none;text-decoration:none;display:block;}
    table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
    a{text-decoration:none;}
    /* Brand colours */
    /* Blue: #0E5C8E  Gold: #F5D64B  Dark: #0A3F62  Grey: #DDDDDD */
    .wrap{max-width:640px;}
    .otp{
      font-size:38px;
      font-weight:800;
      letter-spacing:6px;
      color:#0E5C8E;
      text-align:center;
      margin:24px 0;
      font-family:Arial,Helvetica,sans-serif;
    }
    .shadow{box-shadow:0 10px 28px rgba(10,63,98,0.25);}
    .social a{
      display:inline-block;
      width:44px;
      height:44px;
      border-radius:999px;
      background:#ffffff;
      line-height:44px;
      text-align:center;
    }
    .social img{width:22px;height:22px;margin:11px auto 0 auto;}
    @media (max-width:600px){
      .pad{padding-left:16px !important;padding-right:16px !important;}
      .otp{font-size:32px;letter-spacing:4px;}
    }
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
<body style="margin:0;padding:0;background-color:#0E5C8E;background-image:url('https://www.urbanary.co.uk/assets/slider.jpg');background-size:cover;background-position:center;background-repeat:no-repeat;">
  <!-- Preheader -->
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
    Enter this OTP to verify your email.
  </div>

  <!--[if gte mso 9]>
  <v:background fill="t">
    <v:fill type="frame" src="https://www.urbanary.co.uk/assets/slider.jpg" color="#0E5C8E"/>
  </v:background>
  <![endif]-->

  <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
    <tr>
      <td align="center" valign="top" style="padding:24px 12px;">
        
        <table role="presentation" width="100%" class="wrap" style="max-width:640px;background:rgba(255,255,255,0.96);border-radius:16px;overflow:hidden;" align="center">
          
          <!-- Header with logo -->
          <tr>
            <td align="left" style="background:#ffffff;padding:18px 24px;">
              <a href="https://www.urbanary.co.uk" target="_blank" rel="noopener" aria-label="Urbanary">
                <img src="https://www.urbanary.co.uk/logo/logo.png" width="220" alt="URBANARY — Discover Your City" style="height:auto;">
              </a>
            </td>
          </tr>

          <!-- OTP Message -->
          <tr>
            <td class="pad" style="background:#DDDDDD;padding:24px 28px 56px 28px;font-family:Arial,Helvetica,sans-serif;">
              <p style="margin:0 0 16px 0;color:#0A3F62;font-size:16px;line-height:1.6;">
                Enter this OTP to verify your email. If you didn't make this request, please ignore this email.
              </p>

              <p class="otp">${otp}</p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background:#0E5C8E;padding:24px;">
              
              <p style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:22px;font-weight:700;margin:0 0 12px 0;">
                Socials
              </p>

              <table role="presentation" cellpadding="0" cellspacing="0" class="social">
                <tr>
                  <td style="padding:8px;">
                    <a href="https://www.facebook.com/profile.php?id=61579643593745" target="_blank" rel="noopener" aria-label="Facebook">
                      <img src="https://www.urbanary.co.uk/assets/facebook.png" alt="Facebook">
                    </a>
                  </td>
                  <td style="padding:8px;">
                    <a href="https://www.instagram.com/urbanaryleeds/" target="_blank" rel="noopener" aria-label="Instagram">
                      <img src="https://www.urbanary.co.uk/assets/instagram.png" alt="Instagram">
                    </a>
                  </td>
                  <td style="padding:8px;">
                    <a href="https://www.linkedin.com/company/urbanary/" target="_blank" rel="noopener" aria-label="LinkedIn">
                      <img src="https://www.urbanary.co.uk/assets/tiktok.png" alt="LinkedIn">
                    </a>
                  </td>
                  <td style="padding:8px;">
                    <a href="https://www.tiktok.com/@urbanaryleeds" target="_blank" rel="noopener" aria-label="TikTok">
                      <img src="https://www.urbanary.co.uk/assets/linkedin.png" alt="TikTok">
                    </a>
                  </td>
                </tr>
              </table>

              <p style="font-family:Arial,Helvetica,sans-serif;color:#bcd3e3;font-size:12px;margin:18px 0 0 0;">
                <a href="#" target="_blank" rel="noopener" style="color:#bcd3e3;text-decoration:underline;">Unsubscribe</a>
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
}

export function welcomeEmailTemplate() {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Welcome to Urbanary</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
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
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
  </head>

  <body
    style="margin:0;padding:0;background-color:#0E5C8E;background-image:url('https://www.urbanary.co.uk/assets/slider.jpg');background-repeat:no-repeat;background-position:center top;background-size:cover;"
  >
    <!-- Preheader -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      You’re on the Urbanary waitlist—early access is coming soon.
    </div>

    <!-- Background fix for Outlook -->
    <!--[if gte mso 9]>
      <v:background fill="t">
        <v:fill
          type="frame"
          src="https://www.urbanary.co.uk/assets/slider.jpg"
          color="#0E5C8E"
        />
      </v:background>
    <![endif]-->

    <table
      role="presentation"
      width="100%"
      height="100%"
      cellpadding="0"
      cellspacing="0"
    >
      <tr>
        <td align="center" valign="top" style="padding:24px 12px;">
          <table
            role="presentation"
            width="100%"
            style="max-width:640px;background:rgba(255,255,255,0.95);border-radius:16px;overflow:hidden;"
            class="shadow-card"
          >
            <!-- Header -->
            <tr>
              <td align="center" style="padding:32px 24px;background:#0E5C8E;">
                <table role="presentation">
                  <tr>
                    <td
                      style="background:#ffffff;border-radius:14px;padding:10px 14px;"
                    >
                      <a
                        href="https://www.urbanary.co.uk"
                        target="_blank"
                        rel="noopener"
                      >
                        <img
                          src="https://www.urbanary.co.uk/logo/logo.png"
                          width="220"
                          alt="Urbanary"
                          style="width:220px;height:auto;"
                        />
                      </a>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td
                style="padding:28px 28px 8px 28px;font-family:Arial,Helvetica,sans-serif;color:#0A3F62;"
              >
                <h1
                  style="margin:0 0 12px 0;font-size:24px;line-height:1.3;font-weight:800;color:#0E5C8E;"
                >
                  You’re in! 🎉
                </h1>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;">
                  Thanks for signing up to the Urbanary waitlist — you’re
                  officially on the inside. 🎉
                </p>
                <p style="margin:0 0 14px 0;font-size:16px;line-height:1.6;">
                  As one of our early members, you’ll get
                  <strong>exclusive access the day before we launch</strong>, so
                  you can be the first to explore Leeds’ best bars, restaurants,
                  and hidden gems — all tailored to your vibe.
                </p>
                <p style="margin:0;font-size:16px;line-height:1.6;">
                  We can’t wait to show you what’s coming. Stay tuned for your
                  early-access invite soon!
                </p>
              </td>
            </tr>

            <!-- CTA -->
            <tr>
              <td align="center" style="padding:18px 28px 8px 28px;">
                <a
                  href="https://www.urbanary.co.uk"
                  target="_blank"
                  rel="noopener"
                  class="btn"
                >
                  Visit Urbanary
                </a>
              </td>
            </tr>

            <!-- Sign-off -->
            <tr>
              <td
                style="padding:18px 28px 6px 28px;font-family:Arial,Helvetica,sans-serif;color:#0A3F62;"
              >
                <p style="margin:0 0 4px 0;font-size:16px;line-height:1.6;">
                  Cheers,
                </p>
                <p
                  style="margin:0 0 14px 0;font-size:16px;line-height:1.6;font-weight:700;"
                >
                  The Urbanary Team
                </p>

                <!-- Social Icons -->
                <table
                  role="presentation"
                  class="social-icons"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                >
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
              <td
                align="center"
                style="padding:16px 24px 28px 24px;background:#ffffff;font-family:Arial,Helvetica,sans-serif;"
              >
                <p
                  style="margin:0;font-size:12px;line-height:1.6;color:#6a7b88;"
                >
                  You received this email because you joined the Urbanary
                  waitlist. If this wasn’t you, you can safely ignore this
                  message.
                </p>
                <p style="margin:8px 0 0 0;font-size:12px;line-height:1.6;">
                  <a
                    href="https://www.urbanary.co.uk"
                    target="_blank"
                    rel="noopener"
                    style="color:#0E5C8E;"
                    >urbanary.co.uk</a
                  >
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
}

export function resetPasswordEmailTemplate(resetUrl : string) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Urbanary — Reset Password</title>
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <style>
      img{border:0;outline:none;text-decoration:none;display:block;}
      table{border-collapse:collapse;mso-table-lspace:0pt;mso-table-rspace:0pt;}
      a{text-decoration:none;}
      /* Brand colours */
      /* Blue: #0E5C8E  Gold: #F5D64B  Dark: #0A3F62  Grey: #DDDDDD */
      .wrap{max-width:640px;}
      .btn{
        display:inline-block;
        background:#F5D64B;
        color:#0A3F62;
        font-family:Arial,Helvetica,sans-serif;
        font-weight:800;
        font-size:20px;
        line-height:24px;
        padding:18px 28px;
        border-radius:20px;
      }
      .shadow{box-shadow:0 10px 28px rgba(10,63,98,0.25);}
      .social a{
        display:inline-block;
        width:44px;
        height:44px;
        border-radius:999px;
        background:#ffffff;
        line-height:44px;
        text-align:center;
      }
      .social img{width:22px;height:22px;margin:11px auto 0 auto;}
      @media (max-width:600px){
        .pad{padding-left:16px !important;padding-right:16px !important;}
        .btn{font-size:18px;padding:16px 24px;}
      }
    </style>
    <!--[if gte mso 9]>
      <xml>
        <o:OfficeDocumentSettings>
          <o:AllowPNG />
          <o:PixelsPerInch>96</o:PixelsPerInch>
        </o:OfficeDocumentSettings>
      </xml>
    <![endif]-->
  </head>
  <body
    style="margin:0;padding:0;background-color:#0E5C8E;background-image:url('https://www.urbanary.co.uk/assets/slider.jpg');background-size:cover;background-position:center;background-repeat:no-repeat;"
  >
    <!-- Preheader (hidden) -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">
      Use the link below to reset your Urbanary password.
    </div>

    <!--[if gte mso 9]>
      <v:background fill="t">
        <v:fill
          type="frame"
          src="https://www.urbanary.co.uk/assets/slider.jpg"
          color="#0E5C8E"
        />
      </v:background>
    <![endif]-->

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr>
        <td align="center" valign="top" style="padding:24px 12px;">
          <!-- Card Container -->
          <table
            role="presentation"
            width="100%"
            class="wrap"
            style="max-width:640px;background:rgba(255,255,255,0.96);border-radius:16px;overflow:hidden;"
            align="center"
          >
            <!-- Header with logo -->
            <tr>
              <td align="left" style="background:#ffffff;padding:18px 24px;">
                <a
                  href="https://www.urbanary.co.uk"
                  target="_blank"
                  rel="noopener"
                  aria-label="Urbanary"
                >
                  <img
                    src="https://www.urbanary.co.uk/logo/logo.png"
                    width="220"
                    alt="URBANARY — Discover Your City"
                    style="height:auto;"
                  />
                </a>
              </td>
            </tr>

            <!-- Grey content -->
            <tr>
              <td
                class="pad"
                style="background:#DDDDDD;padding:24px 28px 56px 28px;font-family:Arial,Helvetica,sans-serif;"
              >
                <p
                  style="margin:0 0 16px 0;color:#0A3F62;font-size:16px;line-height:1.6;"
                >
                  Please use the following link to reset your password. If you
                  didn’t make this request, please ignore this email.
                </p>
              </td>
            </tr>

            <!-- Footer with CTA and socials -->
            <tr>
              <td
                align="center"
                style="background:#0E5C8E;padding:0 24px 28px 24px;position:relative;"
              >
                <!-- CTA -->
                <table
                  role="presentation"
                  align="center"
                  cellpadding="0"
                  cellspacing="0"
                  class="shadow"
                  style="margin-top:-28px;background:#F5D64B;border-radius:24px;"
                >
                  <tr>
                    <td align="center">
                      <!--[if mso]>
                        <v:roundrect
                          xmlns:v="urn:schemas-microsoft-com:vml"
                          arcsize="20%"
                          fillcolor="#F5D64B"
                          stroke="f"
                          style="height:64px;v-text-anchor:middle;width:280px;"
                        >
                          <w:anchorlock />
                          <center
                            style="color:#0A3F62;font-family:Arial,Helvetica,sans-serif;font-size:20px;font-weight:800;"
                          >
                            <a
                              href="${resetUrl}"
                              style="color:#0A3F62;text-decoration:none;"
                              >Get Started!</a
                            >
                          </center>
                        </v:roundrect>
                      <![endif]-->
                      <!--[if !mso]><!-- -->
                      <a
                        href="${resetUrl}"
                        target="_blank"
                        rel="noopener"
                        class="btn"
                        >RESET PASSWORD</a
                      >
                      <!--<![endif]-->
                    </td>
                  </tr>
                </table>

                <!-- Social Media -->
                <p
                  style="font-family:Arial,Helvetica,sans-serif;color:#ffffff;font-size:22px;font-weight:700;margin:22px 0 12px 0;"
                >
                  Socials
                </p>

                <table role="presentation" cellpadding="0" cellspacing="0" class="social">
                <tr>
                  <td style="padding:8px;">
                    <a href="https://www.facebook.com/profile.php?id=61579643593745" target="_blank" rel="noopener" aria-label="Facebook">
                      <img src="https://www.urbanary.co.uk/assets/facebook.png" alt="Facebook">
                    </a>
                  </td>
                  <td style="padding:8px;">
                    <a href="https://www.instagram.com/urbanaryleeds/" target="_blank" rel="noopener" aria-label="Instagram">
                      <img src="https://www.urbanary.co.uk/assets/instagram.png" alt="Instagram">
                    </a>
                  </td>
                  <td style="padding:8px;">
                    <a href="https://www.linkedin.com/company/urbanary/" target="_blank" rel="noopener" aria-label="LinkedIn">
                      <img src="https://www.urbanary.co.uk/assets/tiktok.png" alt="LinkedIn">
                    </a>
                  </td>
                  <td style="padding:8px;">
                    <a href="https://www.tiktok.com/@urbanaryleeds" target="_blank" rel="noopener" aria-label="TikTok">
                      <img src="https://www.urbanary.co.uk/assets/linkedin.png" alt="TikTok">
                    </a>
                  </td>
                </tr>
              </table>

                <!-- Unsubscribe -->
                <p
                  style="font-family:Arial,Helvetica,sans-serif;color:#bcd3e3;font-size:12px;margin:18px 0 0 0;"
                >
                  <a
                    href="#"
                    target="_blank"
                    rel="noopener"
                    style="color:#bcd3e3;text-decoration:underline;"
                    >Unsubscribe</a
                  >
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
}
