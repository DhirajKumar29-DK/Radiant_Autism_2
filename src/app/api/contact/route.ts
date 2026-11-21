import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";
import { prisma } from "@/lib/prisma";

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

    // 1. Save appointment record in database
    try {
      await prisma.appointment.create({
        data: {
          ticketId,
          fullName,
          email,
          phone: phone || null,
          service,
          preferredDate,
          preferredTime: preferredTime || null,
          message: message || null,
          status: "NEW",
        },
      });
    } catch (dbErr) {
      console.error("Failed to save appointment to database:", dbErr);
      // continue so email or error is reported cleanly
    }

    const userEmail = process.env.EMAIL_USER;
    const userPass = process.env.EMAIL_PASS;
    const recipientEmail = process.env.TO_EMAIL || userEmail || "care@radiantautism.com";

    // Dynamic base URL for direct Admin Portal button
    const host = req.headers.get("x-forwarded-host") || req.headers.get("host");
    const proto = req.headers.get("x-forwarded-proto") || (host?.includes("localhost") ? "http" : "https");
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || (host ? `${proto}://${host}` : "https://radiant-autism-nu.vercel.app");
    const adminInquiryUrl = `${siteUrl}/admin/inquiries?ticket=${encodeURIComponent(ticketId)}`;

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

              <!-- Direct 1-Click Action to Open in Admin Portal -->
              <div style="margin-top: 26px; padding: 22px; background: #f0fdf4; border-radius: 14px; border: 1.5px solid #86efac; text-align: center;">
                <div style="font-size: 11px; font-weight: 800; color: #15803d; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 6px;">
                  Clinical Management Portal
                </div>
                <div style="font-size: 14px; font-weight: 800; color: #0f172a; margin-bottom: 14px;">
                  Inquiry Ticket #${ticketId}
                </div>
                <div>
                  <a href="${adminInquiryUrl}" target="_blank" style="display: inline-block; background: #2563eb; color: #ffffff; padding: 13px 32px; border-radius: 10px; font-weight: 800; font-size: 14px; text-decoration: none; box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35); letter-spacing: 0.3px;">
                    Open Inquiry in Admin Panel &rarr;
                  </a>
                </div>
                <p style="margin: 12px 0 0 0; font-size: 11px; color: #64748b;">
                  Clicking opens this inquiry directly in the Admin Inquiries Desk to update status, view details, or add staff notes.
                </p>
                <div style="margin-top: 12px; padding-top: 8px; border-top: 1px solid #bbf7d0; font-size: 11px; color: #94a3b8; word-break: break-all;">
                  Direct Link: <a href="${adminInquiryUrl}" style="color: #2563eb; text-decoration: underline;">${adminInquiryUrl}</a>
                </div>
              </div>
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
