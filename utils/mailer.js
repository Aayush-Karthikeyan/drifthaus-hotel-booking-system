const https = require("https");

/**
 * Send a booking confirmation email via Brevo HTTP API.
 */
async function sendBookingConfirmation(opts) {
  const {
    toEmail, username, title, location, country,
    imageUrl, checkIn, checkOut, nights, totalPrice, listingId,
  } = opts;

  const fmt = (d) =>
    new Date(d).toLocaleDateString("en-CA", {
      weekday: "long", year: "numeric", month: "long", day: "numeric",
    });

  const siteUrl = process.env.SITE_URL || "https://drifthaus-hotel-booking-system.onrender.com";

  const html = `
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Booking Confirmed – Drifthaus</title>
<style>
  body{margin:0;padding:0;background:#f4f4f4;font-family:'Segoe UI',Arial,sans-serif;}
  .wrap{max-width:600px;margin:32px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.10);}
  .header{background:#212529;padding:28px 32px;text-align:center;}
  .header h1{color:#fff;margin:0;font-size:26px;letter-spacing:1px;}
  .header p{color:#adb5bd;margin:4px 0 0;font-size:13px;}
  .banner{width:100%;height:220px;object-fit:cover;display:block;}
  .body{padding:32px;}
  .greeting{font-size:18px;font-weight:600;color:#212529;margin-bottom:8px;}
  .sub{color:#495057;font-size:15px;margin-bottom:24px;}
  .card{background:#f8f9fa;border-radius:8px;padding:20px 24px;margin-bottom:24px;}
  .card h2{margin:0 0 14px;font-size:16px;color:#212529;text-transform:uppercase;letter-spacing:.6px;}
  .row{display:flex;justify-content:space-between;margin-bottom:8px;}
  .label{color:#6c757d;font-size:14px;}
  .value{color:#212529;font-size:14px;font-weight:600;text-align:right;}
  .divider{border:none;border-top:1px solid #dee2e6;margin:14px 0;}
  .total{font-size:17px;}
  .btn{display:inline-block;margin-top:8px;padding:12px 28px;background:#212529;color:#fff;text-decoration:none;border-radius:6px;font-size:15px;font-weight:600;}
  .footer{background:#f8f9fa;text-align:center;padding:18px 32px;color:#6c757d;font-size:12px;border-top:1px solid #dee2e6;}
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <h1>🏨 Drifthaus</h1>
    <p>Your home away from home</p>
  </div>
  ${imageUrl ? `<img src="${imageUrl}" alt="${title}" class="banner"/>` : ""}
  <div class="body">
    <p class="greeting">Hi ${username}! Your booking is confirmed 🎉</p>
    <p class="sub">Thank you for choosing Drifthaus. Here are your booking details:</p>
    <div class="card">
      <h2>📍 Property</h2>
      <div class="row"><span class="label">Listing</span><span class="value">${title}</span></div>
      <div class="row"><span class="label">Location</span><span class="value">${location}, ${country}</span></div>
    </div>
    <div class="card">
      <h2>📅 Stay Details</h2>
      <div class="row"><span class="label">Check-in</span><span class="value">${fmt(checkIn)}</span></div>
      <div class="row"><span class="label">Check-out</span><span class="value">${fmt(checkOut)}</span></div>
      <div class="row"><span class="label">Duration</span><span class="value">${nights} night${nights !== 1 ? "s" : ""}</span></div>
      <hr class="divider"/>
      <div class="row total">
        <span class="label"><strong>Total</strong></span>
        <span class="value">CA$ ${totalPrice.toLocaleString("en-CA")}</span>
      </div>
    </div>
    <a href="${siteUrl}/listings/${listingId}" class="btn">View Listing</a>
  </div>
  <div class="footer">
    © ${new Date().getFullYear()} Drifthaus · All rights reserved<br/>
    <a href="${siteUrl}/my-bookings" style="color:#495057;">View all my bookings</a>
  </div>
</div>
</body>
</html>`;

  const payload = JSON.stringify({
    sender: { name: "Drifthaus", email: process.env.BREVO_LOGIN },
    to: [{ email: toEmail, name: username }],
    subject: `Booking Confirmed – ${title} 🏨`,
    htmlContent: html,
  });

  return new Promise((resolve, reject) => {
    const req = https.request({
      hostname: "api.brevo.com",
      path: "/v3/smtp/email",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": process.env.BREVO_API_KEY,
        "Content-Length": Buffer.byteLength(payload),
      },
    }, (res) => {
      let data = "";
      res.on("data", (chunk) => { data += chunk; });
      res.on("end", () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data);
        } else {
          reject(new Error(`Brevo API error ${res.statusCode}: ${data}`));
        }
      });
    });
    req.on("error", reject);
    req.write(payload);
    req.end();
  });
}

module.exports = { sendBookingConfirmation };
