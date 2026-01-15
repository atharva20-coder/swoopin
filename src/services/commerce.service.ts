import { client } from "@/lib/prisma";
import {
  getCatalogProducts,
  getConnectedCatalog,
  updateProductAvailability as updateMetaProductAvailability,
} from "@/lib/instagram/commerce";
import {
  ProductListSchema,
  CatalogSchema,
  type Product,
  type Catalog,
  type ProductsQuery,
  type ProductStatus,
  type SyncResult,
} from "@/schemas/commerce.schema";

/**
 * ============================================
 * COMMERCE SERVICE
 * Business logic for product catalog management
 * IDOR protection via userId ownership checks
 * All data validation via Zod schemas
 * ============================================
 */

class CommerceService {
  /**
   * Get user's catalog with products
   * IDOR: Only returns catalog owned by userId
   */
  async getCatalog(userId: string): Promise<Catalog | null> {
    const catalog = await client.productCatalog.findUnique({
      where: { userId },
      include: {
        products: {
          orderBy: { name: "asc" },
        },
      },
    });

    if (!catalog) return null;

    const validated = CatalogSchema.safeParse(catalog);
    return validated.success ? validated.data : null;
  }

  /**
   * Sync catalog with Instagram/Meta
   * IDOR: Only syncs for userId's integration
   */
  async syncCatalog(userId: string): Promise<SyncResult | { error: string }> {
    // Get user's integration
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    if (!integration?.token || !integration?.instagramId) {
      return { error: "Instagram not connected" };
    }

    // Get connected catalog from Meta
    const catalogResult = await getConnectedCatalog(
      integration.instagramId,
      integration.token
    );

    if (!catalogResult.success || !catalogResult.catalogId) {
      return { error: "No catalog connected to Instagram" };
    }

    // Upsert catalog in database
    const catalog = await client.productCatalog.upsert({
      where: { userId },
      create: {
        userId,
        catalogId: catalogResult.catalogId,
        name: catalogResult.catalogName ?? null,
        syncedAt: new Date(),
      },
      update: {
        catalogId: catalogResult.catalogId,
        name: catalogResult.catalogName ?? null,
        syncedAt: new Date(),
      },
    });

    // Fetch products from Meta
    const productsResult = await getCatalogProducts(
      catalogResult.catalogId,
      integration.token
    );

    if (!productsResult.success) {
      return { error: productsResult.error || "Failed to fetch products" };
    }

    let productCount = 0;

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
          imageUrl: product.image_url ?? null,
          status: this.mapAvailabilityToStatus(product.availability),
        },
        update: {
          name: product.name,
          price,
          currency: product.currency || "USD",
          imageUrl: product.image_url ?? null,
          status: this.mapAvailabilityToStatus(product.availability),
        },
      });
      productCount++;
    }

    return {
      synced: true,
      productCount,
      catalogId: catalog.catalogId,
    };
  }

  /**
   * Get products for user
   * IDOR: Only returns products from user's catalog
   */
  async getProducts(userId: string, query: ProductsQuery): Promise<Product[]> {
    const catalog = await client.productCatalog.findUnique({
      where: { userId },
    });

    if (!catalog) return [];

    const products = await client.product.findMany({
      where: {
        catalogId: catalog.id,
        ...(query.status && { status: query.status }),
      },
      orderBy: { name: "asc" },
    });

    const validated = ProductListSchema.safeParse(products);
    return validated.success ? validated.data : [];
  }

  /**
   * Update product status
   * IDOR: Verifies product belongs to user's catalog
   */
  async updateProductStatus(
    userId: string,
    productId: string,
    status: ProductStatus
  ): Promise<Product | { error: string }> {
    // Get product with catalog for ownership check
    const product = await client.product.findUnique({
      where: { id: productId },
      include: { catalog: true },
    });

    // IDOR check
    if (!product || product.catalog.userId !== userId) {
      return { error: "Product not found" };
    }

    // Get integration for Meta update
    const integration = await client.integrations.findFirst({
      where: {
        userId,
        name: "INSTAGRAM",
      },
    });

    // Update on Meta if connected
    if (integration?.token) {
      try {
        await updateMetaProductAvailability(
          product.externalId,
          integration.token,
          this.mapStatusToAvailability(status)
        );
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.error("Meta product update failed:", error.message);
        }
        // Continue with local update even if Meta fails
      }
    }

    // Update in database
    const updated = await client.product.update({
      where: { id: productId },
      data: { status },
    });

    const validated = ProductListSchema.safeParse([updated]);
    if (!validated.success || !validated.data[0]) {
      return { error: "Validation failed" };
    }

    return validated.data[0];
  }

  // ============================================
  // PRIVATE HELPERS
  // ============================================

  private mapAvailabilityToStatus(availability?: string): ProductStatus {
    switch (availability?.toLowerCase()) {
      case "out of stock":
        return "OUT_OF_STOCK";
      case "discontinued":
        return "DISCONTINUED";
      default:
        return "ACTIVE";
    }
  }

  private mapStatusToAvailability(
    status: ProductStatus
  ): "in stock" | "out of stock" | "discontinued" {
    switch (status) {
      case "OUT_OF_STOCK":
        return "out of stock";
      case "DISCONTINUED":
        return "discontinued";
      default:
        return "in stock";
    }
  }
}

// Export singleton instance
export const commerceService = new CommerceService();
