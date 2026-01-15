import { NextRequest, NextResponse } from "next/server";
import { verifySignatureAppRouter } from "@upstash/qstash/nextjs";
import { commerceService } from "@/services/commerce.service";

async function handler(req: NextRequest) {
  try {
    const body = await req.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 });
    }

    // Use the commerce service to sync catalog
    const result = await commerceService.syncCatalog(userId);

    if ("error" in result) {
      return NextResponse.json({ error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, result });
  } catch (error) {
    console.error("Catalog sync job error:", error);
    return NextResponse.json({ error: "Sync failed" }, { status: 500 });
  }
}

// Verify QStash signature for security (only when keys are available)
const isQstashConfigured = !!process.env.QSTASH_CURRENT_SIGNING_KEY;
export const POST = isQstashConfigured
  ? verifySignatureAppRouter(handler)
  : handler;
