import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { client } from "@/lib/prisma";
import axios from "axios";

export const runtime = "nodejs";

interface CatalogProduct {
  id: string;
  name: string;
  image_url?: string;
  price?: string;
  currency?: string;
  retailer_id?: string;
}

interface GraphAPIResponse {
  data: CatalogProduct[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

/**
 * GET /api/instagram/catalog-products
 * Fetch products from connected Instagram/Facebook catalog
 * 
 * Query params:
 * - search: Search term for filtering products
 * - limit: Number of products to return (default: 20)
 * - after: Cursor for pagination
 */
export async function GET(req: NextRequest) {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's Instagram integration
    const integration = await client.integrations.findFirst({
      where: { userId: session.user.id },
      select: { token: true, instagramId: true },
    });

    if (!integration?.token || !integration?.instagramId) {
      return NextResponse.json(
        { error: "Instagram not connected" },
        { status: 400 }
      );
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "20");
    const after = searchParams.get("after") || "";

    const baseUrl = process.env.INSTAGRAM_BASE_URL;
    if (!baseUrl) {
      return NextResponse.json(
        { error: "Instagram API not configured" },
        { status: 500 }
      );
    }

    // First, get the catalog ID connected to this Instagram account
    const catalogResponse = await axios.get(
      `${baseUrl}/${integration.instagramId}/product_catalog`,
      {
        headers: { Authorization: `Bearer ${integration.token}` },
      }
    );

    const catalogId = catalogResponse.data?.id;
    if (!catalogId) {
      return NextResponse.json(
        { error: "No product catalog connected", products: [] },
        { status: 200 }
      );
    }

    // Fetch products from the catalog
    const params: Record<string, string> = {
      fields: "id,name,image_url,price,currency,retailer_id",
      limit: limit.toString(),
    };

    if (search) {
      params.filter = JSON.stringify({ name: { contains: search } });
    }
    if (after) {
      params.after = after;
    }

    const productsResponse = await axios.get<GraphAPIResponse>(
      `${baseUrl}/${catalogId}/products`,
      {
        params,
        headers: { Authorization: `Bearer ${integration.token}` },
      }
    );

    const products = productsResponse.data.data || [];
    const nextCursor = productsResponse.data.paging?.cursors?.after;

    return NextResponse.json({
      products: products.map((p) => ({
        id: p.id,
        name: p.name,
        imageUrl: p.image_url,
        price: p.price,
        currency: p.currency,
        retailerId: p.retailer_id,
      })),
      nextCursor,
      hasMore: !!productsResponse.data.paging?.next,
    });
  } catch (error) {
    // Handle specific API errors
    if (axios.isAxiosError(error)) {
      const message = error.response?.data?.error?.message || error.message;
      
      // No catalog permission or not connected - this is expected for accounts without shops
      if (error.response?.status === 400 || error.response?.status === 403) {
        // Only log a brief message, not the full error
        console.log("Product catalog not available for this account");
        return NextResponse.json(
          { error: "Product catalog not available", products: [] },
          { status: 200 }
        );
      }
      
      console.error("Error fetching catalog products:", message);
      return NextResponse.json({ error: message }, { status: 500 });
    }

    console.error("Error fetching catalog products:", error);

    return NextResponse.json(
      { error: "Failed to fetch products" },
      { status: 500 }
    );
  }
}
