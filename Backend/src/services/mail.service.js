const nodemailer = require("nodemailer");
const config = require("../config/config");

const transporter = nodemailer.createTransport({
  host: config.SMTP_HOST,
  port: Number(config.SMTP_PORT),
  secure: Number(config.SMTP_PORT) === 465,
  auth: {
    user: config.SMTP_USER,
    pass: config.SMTP_PASS,
  },
});

async function sendOtpEmail({ email, otp, purpose = "Login" }) {
  const isRegister = purpose.toLowerCase().includes("register") || purpose.toLowerCase().includes("registration");
  const isPassword = purpose.toLowerCase().includes("password");

  const heading = isRegister
    ? "Your verification code"
    : isPassword
      ? "Your password change code"
      : "Your login verification code";

  const actionText = isRegister
    ? "complete your registration on ResumeIQ"
    : isPassword
      ? "confirm the password change on your ResumeIQ account"
      : "securely sign in to your ResumeIQ account";

  const titleText = isRegister
    ? "Email Verification"
    : isPassword
      ? "Password Change Verification"
      : "Login Verification";

  const year = new Date().getFullYear();

  const mailOptions = {
    from: `"ResumeIQ" <${config.SMTP_USER}>`,
    to: email,
    subject: `${otp} is your ResumeIQ verification code`,
    text: [
      `Your ResumeIQ verification code is: ${otp}`,
      "",
      `Use this code to ${actionText}. It expires in 5 minutes.`,
      "",
      "If you didn't request this code, you can safely ignore this email.",
      "",
      `© ${year} ResumeIQ. All rights reserved.`,
    ].join("\n"),
    html: `<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <meta name="x-apple-disable-message-reformatting">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>ResumeIQ — ${titleText}</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=DM+Sans:wght@500;700&family=DM+Mono:wght@500&display=swap" rel="stylesheet">
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <style>td,th,div,p,a,h1,h2,h3,h4{font-family:Arial,sans-serif!important}</style>
  <![endif]-->
  <style>
    * { box-sizing: border-box; }
    body { margin: 0; padding: 0; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
    img { border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
    @media only screen and (max-width: 520px) {
      .email-card { width: 100% !important; border-radius: 0 !important; }
      .card-inner { padding-left: 24px !important; padding-right: 24px !important; }
      .otp-display { font-size: 28px !important; letter-spacing: 6px !important; padding: 18px 20px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f7;font-family:'Inter','DM Sans',-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">

  <!-- Outer wrapper -->
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:#f5f5f7;">
    <tr>
      <td align="center" style="padding:32px 16px 40px;">

        <!-- Card -->
        <table role="presentation" class="email-card" width="460" cellpadding="0" cellspacing="0" border="0" style="max-width:460px;width:100%;background-color:#ffffff;border-radius:16px;border:1px solid #e5e5ea;overflow:hidden;">

          <!-- Accent line -->
          <tr><td style="height:3px;background:linear-gradient(90deg,#6366f1,#8b5cf6,#a78bfa);font-size:0;line-height:0;" height="3">&nbsp;</td></tr>

          <!-- Content -->
          <tr>
            <td class="card-inner" style="padding:32px 36px 28px;">

              <!-- Logo -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:28px;">
                    <span style="font-family:'DM Sans','Inter',-apple-system,sans-serif;font-size:22px;font-weight:700;color:#111827;letter-spacing:-0.02em;">Resume</span><span style="font-family:'DM Sans','Inter',-apple-system,sans-serif;font-size:22px;font-weight:700;color:#6366f1;letter-spacing:-0.02em;">IQ</span>
                  </td>
                </tr>
              </table>

              <!-- Heading -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:12px;">
                    <h1 style="margin:0;font-family:'DM Sans','Inter',-apple-system,sans-serif;font-size:20px;font-weight:700;color:#111827;line-height:1.3;letter-spacing:-0.015em;">${heading}</h1>
                  </td>
                </tr>
              </table>

              <!-- Description -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:24px;">
                    <p style="margin:0;font-family:'Inter',-apple-system,sans-serif;font-size:14px;line-height:1.6;color:#6b7280;">Use this verification code to ${actionText}. This code is valid for <strong style="color:#374151;font-weight:600;">5 minutes</strong>.</p>
                  </td>
                </tr>
              </table>

              <!-- OTP block -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td style="padding-bottom:24px;">
                    <div class="otp-display" style="background-color:#f9fafb;border:1px solid #e5e7eb;border-radius:12px;padding:22px 24px;text-align:center;font-family:'DM Mono','Courier New',monospace;font-size:32px;font-weight:500;letter-spacing:8px;color:#111827;line-height:1;">${otp}</div>
                  </td>
                </tr>
              </table>

              <!-- Security note -->
              <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr>
                  <td>
                    <p style="margin:0;font-family:'Inter',-apple-system,sans-serif;font-size:13px;line-height:1.5;color:#9ca3af;">Didn't request this code? You can safely ignore this email.</p>
                  </td>
                </tr>
              </table>

            </td>
          </tr>

          <!-- Divider -->
          <tr><td style="padding:0 36px;"><div style="height:1px;background-color:#f3f4f6;"></div></td></tr>

          <!-- Footer -->
          <tr>
            <td class="card-inner" style="padding:20px 36px 24px;">
              <p style="margin:0 0 2px;font-family:'DM Sans','Inter',-apple-system,sans-serif;font-size:13px;font-weight:600;color:#374151;line-height:1.4;">ResumeIQ</p>
              <p style="margin:0 0 12px;font-family:'Inter',-apple-system,sans-serif;font-size:12px;color:#9ca3af;line-height:1.4;">AI-powered career &amp; interview preparation</p>
              <p style="margin:0;font-family:'Inter',-apple-system,sans-serif;font-size:11px;color:#d1d5db;line-height:1.4;">&copy; ${year} ResumeIQ. All rights reserved.</p>
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</body>
</html>`,
  };

  return await transporter.sendMail(mailOptions);
}

module.exports = {
  sendOtpEmail,
  sendTwoFactorOtpEmail: sendOtpEmail,
};
