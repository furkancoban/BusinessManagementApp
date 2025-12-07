import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export const dynamic = 'force-dynamic';

export async function GET() {
  const info: any = {
    timestamp: new Date().toISOString(),
    hasDatabaseUrl: !!process.env.DATABASE_URL,
    databaseUrlFormat: "unknown",
    databaseUrlPreview: null,
    nodeEnv: process.env.NODE_ENV,
  };

  // Check DATABASE_URL format
  if (process.env.DATABASE_URL) {
    const url = process.env.DATABASE_URL;
    info.databaseUrlFormat = url.startsWith("postgresql://") ? "postgresql" : 
                             url.startsWith("postgres://") ? "postgres" : 
                             url.startsWith("file:") ? "sqlite" : "invalid";
    info.databaseUrlPreview = `${url.substring(0, 20)}...${url.substring(url.length - 10)}`;
  }

  try {
    // Test database connection
    const userCount = await prisma.user.count();
    const businessCount = await prisma.business.count();
    
    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      userCount,
      businessCount,
      ...info,
    });
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message || String(error),
      errorCode: error.code,
      errorName: error.name,
      ...info,
      // Additional error details
      errorDetails: {
        message: error.message,
        code: error.code,
        meta: error.meta,
        cause: error.cause?.message,
      },
      ...(process.env.NODE_ENV === "development" && { stack: error.stack })
    }, { status: 500 });
  }
}

