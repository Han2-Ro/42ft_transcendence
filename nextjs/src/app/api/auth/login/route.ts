import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { SignJWT } from "jose";
import { prisma } from "@/lib/prisma";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      );
    }

    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Verify password
    const passwordValid = await bcrypt.compare(password, user.passwordHash);

    if (!passwordValid) {
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 },
      );
    }

    // Check if 2FA is enabled
    if (user.twoFactorEnabled) {
      return NextResponse.json(
        {
          message: "2FA required",
          requiresTwoFactor: true,
          userId: user.id,
        },
        { status: 200 },
      );
    }

    // Generate JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      username: user.username,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("24h")
      .sign(JWT_SECRET);

    const response = NextResponse.json({
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
      },
    });

    // Set cookie with token
    response.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 24h
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    );
  }
}
