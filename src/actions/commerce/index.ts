"use server";

import { client } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { ProductStatus } from "@prisma/client";
import {
  getCatalogProducts,
  getConnectedCatalog,
  updateProductAvailability as updateMetaProductAvailability,
} from "@/lib/instagram/commerce";

// Helper to get current user's integration
async function getUserIntegration() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return null;
  }

  const integration = await client.integrations.findFirst({
    where: { userId: session.user.id },
    select: { token: true, instagramId: true, userId: true },
  });

  return integration;
}

/**
 * Get user's catalog with products
 */
export async function getUserCatalog() {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    const catalog = await client.productCatalog.findUnique({
      where: { userId: integration.userId! },
      include: {
        products: {
          orderBy: { name: "asc" },
        },
      },
    });

    return { status: 200, data: catalog };
  } catch (error) {
    console.error("Error getting catalog:", error);
    return { status: 500, data: "Failed to get catalog" };
  }
}

/**
 * Sync catalog with Instagram/Meta
 */
export async function syncCatalog() {
  try {
    const integration = await getUserIntegration();
    if (!integration?.token || !integration?.instagramId) {
      return { status: 400, data: "Instagram not connected" };
    }

    // Get connected catalog from Meta
    const catalogResult = await getConnectedCatalog(integration.instagramId, integration.token);
    if (!catalogResult.success || !catalogResult.catalogId) {
      return { status: 400, data: "No catalog connected to Instagram" };
    }

    // Upsert catalog in database
    const catalog = await client.productCatalog.upsert({
      where: { userId: integration.userId! },
      create: {
        userId: integration.userId!,
        catalogId: catalogResult.catalogId,
        name: catalogResult.catalogName,
        syncedAt: new Date(),
      },
      update: {
        catalogId: catalogResult.catalogId,
        name: catalogResult.catalogName,
        syncedAt: new Date(),
      },
    });

    // Fetch products from Meta
    const productsResult = await getCatalogProducts(catalogResult.catalogId, integration.token);
    if (!productsResult.success) {
      return { status: 500, data: productsResult.error };
    }

    // Sync products to database
    for (const product of productsResult.products || []) {
      const price = parseFloat(product.price?.replace(/[^0-9.]/g, "") || "0");
      
      await client.product.upsert({
        where: {
          catalogId_externalId: {
            catalogId: catalog.id,
            externalId: product.id,
          },
        },
        create: {
          catalogId: catalog.id,
          externalId: product.id,
          name: product.name,
          price,
          currency: product.currency || "USD",
          imageUrl: product.image_url,
          status: mapAvailabilityToStatus(product.availability),
        },
        update: {
          name: product.name,
          price,
          currency: product.currency || "USD",
          imageUrl: product.image_url,
          status: mapAvailabilityToStatus(product.availability),
        },
      });
    }

    return { status: 200, data: "Catalog synced successfully" };
  } catch (error) {
    console.error("Error syncing catalog:", error);
    return { status: 500, data: "Failed to sync catalog" };
  }
}

/**
 * Get products for the current user
 */
export async function getProducts(options?: { status?: ProductStatus }) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    const catalog = await client.productCatalog.findUnique({
      where: { userId: integration.userId! },
    });

    if (!catalog) {
      return { status: 200, data: [] };
    }

    const products = await client.product.findMany({
      where: {
        catalogId: catalog.id,
        ...(options?.status && { status: options.status }),
      },
      orderBy: { name: "asc" },
    });

    return { status: 200, data: products };
  } catch (error) {
    console.error("Error getting products:", error);
    return { status: 500, data: "Failed to get products" };
  }
}

/**
 * Update product status
 */
export async function updateProductStatus(
  productId: string,
  status: ProductStatus
) {
  try {
    const integration = await getUserIntegration();
    if (!integration) {
      return { status: 401, data: "Unauthorized" };
    }

    // Get the product
    const product = await client.product.findUnique({
      where: { id: productId },
      include: { catalog: true },
    });

    if (!product || product.catalog.userId !== integration.userId) {
      return { status: 404, data: "Product not found" };
    }

    // Update on Meta if possible
    if (integration.token) {
      await updateMetaProductAvailability(
        product.externalId,
        integration.token,
        mapStatusToAvailability(status)
      );
    }

    // Update in database
    const updated = await client.product.update({
      where: { id: productId },
      data: { status },
    });

    return { status: 200, data: updated };
  } catch (error) {
    console.error("Error updating product status:", error);
    return { status: 500, data: "Failed to update product" };
  }
}

// Helper functions
function mapAvailabilityToStatus(availability?: string): ProductStatus {
  switch (availability?.toLowerCase()) {
    case "out of stock":
      return "OUT_OF_STOCK";
    case "discontinued":
      return "DISCONTINUED";
    default:
      return "ACTIVE";
  }
}

function mapStatusToAvailability(status: ProductStatus): "in stock" | "out of stock" | "discontinued" {
  switch (status) {
    case "OUT_OF_STOCK":
      return "out of stock";
    case "DISCONTINUED":
      return "discontinued";
    default:
      return "in stock";
  }
}
