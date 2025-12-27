"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Search, X, Package, Plus, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";

export interface ProductTag {
  productId: string;
  name: string;
  imageUrl?: string;
  price?: string;
  x: number; // 0-1 position on image
  y: number; // 0-1 position on image
}

interface CatalogProduct {
  id: string;
  name: string;
  imageUrl?: string;
  price?: string;
  currency?: string;
}

interface ProductPickerProps {
  selectedProducts: ProductTag[];
  onProductsChange: (products: ProductTag[]) => void;
  mediaUrl?: string; // Image to show for positioning
  maxProducts?: number;
  onClose: () => void;
}

export function ProductPicker({
  selectedProducts,
  onProductsChange,
  mediaUrl,
  maxProducts = 5,
  onClose,
}: ProductPickerProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [positioningProduct, setPositioningProduct] = useState<CatalogProduct | null>(null);

  const debouncedSearch = useDebounce(searchQuery, 300);

  // Fetch products from catalog
  const fetchProducts = useCallback(async (search: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      if (search) params.set("search", search);
      params.set("limit", "20");

      const response = await fetch(`/api/instagram/catalog-products?${params}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch products");
      }

      setProducts(data.products || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load products");
      setProducts([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts(debouncedSearch);
  }, [debouncedSearch, fetchProducts]);

  const isProductSelected = (productId: string) =>
    selectedProducts.some((p) => p.productId === productId);

  const handleProductClick = (product: CatalogProduct) => {
    if (isProductSelected(product.id)) {
      // Remove product
      onProductsChange(selectedProducts.filter((p) => p.productId !== product.id));
    } else if (selectedProducts.length < maxProducts) {
      // Start positioning mode if we have a media URL
      if (mediaUrl) {
        setPositioningProduct(product);
      } else {
        // Add with default position
        onProductsChange([
          ...selectedProducts,
          {
            productId: product.id,
            name: product.name,
            imageUrl: product.imageUrl,
            price: product.price,
            x: 0.5,
            y: 0.5,
          },
        ]);
      }
    }
  };

  const handleImageClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!positioningProduct) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    onProductsChange([
      ...selectedProducts,
      {
        productId: positioningProduct.id,
        name: positioningProduct.name,
        imageUrl: positioningProduct.imageUrl,
        price: positioningProduct.price,
        x: Math.max(0, Math.min(1, x)),
        y: Math.max(0, Math.min(1, y)),
      },
    ]);

    setPositioningProduct(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-4xl max-h-[90vh] bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-neutral-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Package className="w-5 h-5 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Tag Products
              </h2>
              <p className="text-sm text-gray-500">
                {selectedProducts.length}/{maxProducts} products selected
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="flex flex-1 overflow-hidden">
          {/* Left: Product Search */}
          <div className="w-1/2 border-r border-gray-200 dark:border-neutral-800 flex flex-col">
            {/* Search */}
            <div className="p-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {/* Products List */}
            <div className="flex-1 overflow-y-auto p-4 pt-0">
              {isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : error ? (
                <div className="text-center py-8 text-gray-500">{error}</div>
              ) : products.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  No products found
                </div>
              ) : (
                <div className="space-y-2">
                  {products.map((product) => {
                    const isSelected = isProductSelected(product.id);
                    return (
                      <button
                        key={product.id}
                        onClick={() => handleProductClick(product)}
                        disabled={!isSelected && selectedProducts.length >= maxProducts}
                        className={cn(
                          "w-full flex items-center gap-3 p-3 rounded-xl transition-all text-left",
                          isSelected
                            ? "bg-purple-100 dark:bg-purple-900/30 border-2 border-purple-500"
                            : "bg-gray-50 dark:bg-neutral-800 hover:bg-gray-100 dark:hover:bg-neutral-700 border-2 border-transparent",
                          !isSelected && selectedProducts.length >= maxProducts && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {product.imageUrl ? (
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-12 h-12 rounded-lg object-cover"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-lg bg-gray-200 dark:bg-neutral-700 flex items-center justify-center">
                            <Package className="w-5 h-5 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 dark:text-white truncate">
                            {product.name}
                          </p>
                          {product.price && (
                            <p className="text-sm text-gray-500">
                              {product.currency} {product.price}
                            </p>
                          )}
                        </div>
                        {isSelected ? (
                          <Check className="w-5 h-5 text-purple-500" />
                        ) : (
                          <Plus className="w-5 h-5 text-gray-400" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Right: Image Preview & Tag Positions */}
          <div className="w-1/2 flex flex-col p-4">
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              {positioningProduct
                ? `Click on the image to position "${positioningProduct.name}"`
                : "Product tag positions"}
            </p>

            {mediaUrl ? (
              <div
                className={cn(
                  "relative flex-1 rounded-xl overflow-hidden bg-gray-100 dark:bg-neutral-800",
                  positioningProduct && "cursor-crosshair"
                )}
                onClick={handleImageClick}
              >
                <img
                  src={mediaUrl}
                  alt="Post media"
                  className="w-full h-full object-contain"
                />
                {/* Render tag markers */}
                {selectedProducts.map((tag) => (
                  <div
                    key={tag.productId}
                    className="absolute w-6 h-6 -ml-3 -mt-3 bg-white dark:bg-neutral-900 rounded-full shadow-lg border-2 border-purple-500 flex items-center justify-center"
                    style={{
                      left: `${tag.x * 100}%`,
                      top: `${tag.y * 100}%`,
                    }}
                  >
                    <Package className="w-3 h-3 text-purple-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex-1 rounded-xl bg-gray-100 dark:bg-neutral-800 flex items-center justify-center text-gray-400">
                No media selected
              </div>
            )}

            {/* Selected Products List */}
            {selectedProducts.length > 0 && (
              <div className="mt-4 space-y-2">
                <p className="text-xs font-medium text-gray-500 uppercase">
                  Tagged Products
                </p>
                {selectedProducts.map((tag) => (
                  <div
                    key={tag.productId}
                    className="flex items-center gap-2 text-sm bg-gray-50 dark:bg-neutral-800 rounded-lg p-2"
                  >
                    <Package className="w-4 h-4 text-purple-500" />
                    <span className="flex-1 truncate text-gray-700 dark:text-gray-300">
                      {tag.name}
                    </span>
                    <button
                      onClick={() =>
                        onProductsChange(
                          selectedProducts.filter((p) => p.productId !== tag.productId)
                        )
                      }
                      className="text-gray-400 hover:text-red-500"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-4 border-t border-gray-200 dark:border-neutral-800">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={onClose}>
            Done ({selectedProducts.length} products)
          </Button>
        </div>
      </div>
    </div>
  );
}

export default ProductPicker;
