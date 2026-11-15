import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/modules/auth/auth.service";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    if (!email || !password) {
      return NextResponse.json(
        { success: false, error: "Email and password are required." },
        { status: 400 }
      );
    }

    const { token, admin } = await loginAdmin(email.trim().toLowerCase(), password);

    const response = NextResponse.json({
      success: true,
      message: "Login successful",
      admin,
    });

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 24 * 60 * 60, // 15 days
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error during authentication.";
    const status = message === "Invalid email or password." ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
