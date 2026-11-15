import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      service,
      preferredDate,
      preferredTime,
      message,
    } = body;

    if (!fullName || !email || !service || !preferredDate) {
      return NextResponse.json(
        { error: "Full name, email, service, and calendar date are required fields." },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Please provide a valid email address." },
        { status: 400 }
      );
    }

    const ticketId = `RAC-${Math.floor(10000 + Math.random() * 90000)}`;

    const userEmail = process.env.EMAIL_USER;
    const userPass = process.env.EMAIL_PASS;
    const recipientEmail = process.env.TO_EMAIL || userEmail || "care@radiantautism.com";

    // If EMAIL_USER and EMAIL_PASS are set, send live email notification via Nodemailer
    if (userEmail && userPass && userEmail !== "your-email@gmail.com") {
      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: userEmail,
          pass: userPass.replace(/\s+/g, ""),
        },
      });

      const htmlTemplate = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; background-color: #f8fafc; color: #0f172a; margin: 0; padding: 20px; }
            .container { max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
            .header { background: linear-gradient(135deg, #0284c7, #2563eb); padding: 24px; text-align: center; color: #ffffff; }
            .header h2 { margin: 0; font-size: 22px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
            .header p { margin: 6px 0 0 0; font-size: 13px; opacity: 0.9; }
            .content { padding: 24px; }
            .ticket-badge { display: inline-block; background-color: #eff6ff; color: #1d4ed8; padding: 6px 12px; border-radius: 8px; font-weight: 800; font-size: 14px; border: 1px solid #bfdbfe; margin-bottom: 16px; }
            .table-info { width: 100%; border-collapse: collapse; margin-top: 12px; }
            .table-info th, .table-info td { text-align: left; padding: 10px 12px; border-bottom: 1px solid #f1f5f9; font-size: 13px; }
            .table-info th { color: #64748b; font-weight: 700; width: 40%; }
            .table-info td { color: #0f172a; font-weight: 700; }
            .message-box { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 14px; margin-top: 16px; font-size: 13px; font-style: italic; color: #334155; }
            .footer { background-color: #f1f5f9; padding: 16px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h2>Radiant Autism & Skill Center</h2>
              <p>New Appointment & Consultation Request</p>
            </div>
            <div class="content">
              <div class="ticket-badge">Appointment Ticket #${ticketId}</div>
              <p style="font-size: 14px; color: #334155; margin-top: 0;">
                A new appointment inquiry has been submitted through the Radiant Autism website:
              </p>
              
              <table class="table-info">
                <tr>
                  <th>Parent / Guardian Name</th>
                  <td>${fullName}</td>
                </tr>
                <tr>
                  <th>Email Address</th>
                  <td><a href="mailto:${email}" style="color: #2563eb; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <th>Phone Number</th>
                  <td>${phone ? `<a href="tel:${phone}" style="color: #2563eb; text-decoration: none;">${phone}</a>` : "Not Provided"}</td>
                </tr>
                <tr>
                  <th>Interested Service</th>
                  <td style="color: #1d4ed8;">${service}</td>
                </tr>
                <tr>
                  <th>Preferred Appointment Date</th>
                  <td>${preferredDate || "Flexible / First Available"}</td>
                </tr>
                <tr>
                  <th>Prefer Time to Reach (EST)</th>
                  <td>${preferredTime ? `${preferredTime} EST` : "Flexible / First Available"}</td>
                </tr>
              </table>

              ${
                message
                  ? `<div class="message-box">
                      <strong>Additional Notes / Message:</strong><br/>
                      "${message}"
                     </div>`
                  : ""
              }
            </div>
            <div class="footer">
              Radiant Autism & Skill Center • Automatic Web Consultation System
            </div>
          </div>
        </body>
        </html>
      `;

      await transporter.sendMail({
        from: `"Radiant Autism Center" <${userEmail}>`,
        to: recipientEmail,
        replyTo: email,
        subject: `[New Appointment #${ticketId}] Consultation Request from ${fullName}`,
        html: htmlTemplate,
      });
    } else {
      console.log(
        `[Form Submitted Demo - EMAIL_USER/EMAIL_PASS pending] Ticket: #${ticketId} | Name: ${fullName} | Service: ${service} | Phone: ${phone}`
      );
    }

    return NextResponse.json({
      success: true,
      ticketId,
      message: "Consultation inquiry received successfully.",
    });
  } catch (error: unknown) {
    console.error("Error in contact API route:", error);
    const errorMessage = error instanceof Error ? error.message : "Failed to process inquiry.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
