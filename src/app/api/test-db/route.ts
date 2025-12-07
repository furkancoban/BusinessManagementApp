import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const businessCount = await prisma.business.count();
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
      businessCount,
      databaseUrl: process.env.DATABASE_URL ? "Set" : "Not set",
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || String(error),
      errorCode: error.code,
      errorName: error.name,
      databaseUrl: process.env.DATABASE_URL ? "Set (hidden)" : "Not set",
      hasDatabaseUrl: !!process.env.DATABASE_URL,
      ...(process.env.NODE_ENV === "development" && { stack: error.stack })
    }, { status: 500 });
  }
}

