import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { syncCatalog } from "@/actions/commerce";

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // This would need to be modified to accept userId parameter
    const result = await syncCatalog();

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Catalog sync job error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

// Verify QStash signature for security
export const POST = verifySignatureAppRouter(handler);
