import { NextRequest, NextResponse } from "next/server";
import { loginAdmin } from "@/modules/auth/auth.service";

export async function POST(request: NextRequest) {
  try {
    const { email, password, rememberMe } = await request.json();
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

    const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 7 * 24 * 60 * 60; // 30 days if remember me, else 7 days

    response.cookies.set("admin_token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Server error during authentication.";
    const status = message === "Invalid email or password." ? 401 : 500;
    return NextResponse.json({ success: false, error: message }, { status });
  }
}
