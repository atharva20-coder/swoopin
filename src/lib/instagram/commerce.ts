"use server";

import axios from "axios";

// Types
export interface CatalogProduct {
  id: string;
  name: string;
  description?: string;
  price: string;
  currency: string;
  image_url?: string;
  availability?: string;
  retailer_id?: string;
}

interface ProductsResponse {
  data: CatalogProduct[];
  paging?: {
    cursors: { before: string; after: string };
    next?: string;
  };
}

const getBaseUrl = () => {
  const baseUrl = process.env.INSTAGRAM_BASE_URL;
  if (!baseUrl) {
    throw new Error("INSTAGRAM_BASE_URL environment variable is not set");
  }
  return baseUrl;
};

/**
 * Get products from a catalog
 */
export async function getCatalogProducts(
  catalogId: string,
  accessToken: string,
  options?: { limit?: number; after?: string }
): Promise<{ success: boolean; products?: CatalogProduct[]; nextCursor?: string; error?: string }> {
  try {
    const params: Record<string, string> = {
      fields: "id,name,description,price,currency,image_url,availability,retailer_id",
      limit: (options?.limit || 50).toString(),
    };

    if (options?.after) {
      params.after = options.after;
    }

    const response = await axios.get<ProductsResponse>(
      `${getBaseUrl()}/${catalogId}/products`,
      {
        params,
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      success: true,
      products: response.data.data || [],
      nextCursor: response.data.paging?.cursors?.after,
    };
  } catch (error) {
    console.error("Error fetching catalog products:", error);

    let errorMessage = "Failed to fetch products";
    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400 || error.response?.status === 403) {
        return { success: true, products: [] };
      }
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Update product availability/status
 */
export async function updateProductAvailability(
  productId: string,
  accessToken: string,
  availability: "in stock" | "out of stock" | "discontinued"
): Promise<{ success: boolean; error?: string }> {
  try {
    await axios.post(
      `${getBaseUrl()}/${productId}`,
      {
        availability,
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      }
    );

    return { success: true };
  } catch (error) {
    console.error("Error updating product availability:", error);

    let errorMessage = "Failed to update product";
    if (axios.isAxiosError(error)) {
      errorMessage = error.response?.data?.error?.message || error.message;
    }

    return { success: false, error: errorMessage };
  }
}

/**
 * Get connected catalog for an Instagram account
 */
export async function getConnectedCatalog(
  instagramAccountId: string,
  accessToken: string
): Promise<{ success: boolean; catalogId?: string; catalogName?: string; error?: string }> {
  try {
    const response = await axios.get(
      `${getBaseUrl()}/${instagramAccountId}/product_catalog`,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return {
      success: true,
      catalogId: response.data?.id,
      catalogName: response.data?.name,
    };
  } catch (error) {
    console.log("Product catalog not available for this account");

    if (axios.isAxiosError(error)) {
      if (error.response?.status === 400 || error.response?.status === 403) {
        return { success: true }; // No catalog connected
      }
    }

    return { success: false, error: "Failed to get catalog" };
  }
}
