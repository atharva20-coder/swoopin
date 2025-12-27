import { NextResponse } from "next/server";

export const runtime = "edge"; // Fast edge runtime

export async function GET() {
  return NextResponse.json(
    { 
      status: "ok", 
      timestamp: Date.now(),
      environment: process.env.NODE_ENV,
    },
    {
      headers: {
        "Cache-Control": "no-store",
      },
    }
  );
}
