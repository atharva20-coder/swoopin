"use client";

import React, { useState } from "react";
import {
  Package,
  RefreshCw,
  Search,
  Grid,
  List,
  X,
  Check,
  AlertCircle,
  DollarSign,
  ShoppingBag,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { syncCatalog, updateProductStatus } from "@/actions/commerce";

type ProductStatus = "ACTIVE" | "OUT_OF_STOCK" | "DISCONTINUED";

interface Product {
  id: string;
  catalogId: string;
  externalId: string;
  name: string;
  price: number | { toNumber(): number };
  currency: string;
  imageUrl: string | null;
  status: ProductStatus;
  createdAt: Date;
  updatedAt: Date;
}

interface ProductCatalog {
  id: string;
  userId: string;
  catalogId: string;
  name: string | null;
  syncedAt: Date | null;
  products: Product[];
}

interface CommerceViewProps {
  slug: string;
  initialCatalog: ProductCatalog | null;
}

const STATUS_COLORS: Record<ProductStatus, string> = {
  ACTIVE: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  OUT_OF_STOCK: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  DISCONTINUED: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const STATUS_LABELS: Record<ProductStatus, string> = {
  ACTIVE: "In Stock",
  OUT_OF_STOCK: "Out of Stock",
  DISCONTINUED: "Discontinued",
};

export default function CommerceView({ slug, initialCatalog }: CommerceViewProps) {
  const [catalog, setCatalog] = useState<ProductCatalog | null>(initialCatalog);
  const [products, setProducts] = useState<Product[]>(initialCatalog?.products || []);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | ProductStatus>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === "all" || p.status === filter;
    return matchesSearch && matchesFilter;
  });

  const handleSync = async () => {
    setIsLoading(true);
    try {
      const result = await syncCatalog();
      if (result.status === 200) {
        toast.success("Catalog synced successfully");
        window.location.reload();
      } else {
        toast.error(typeof result.data === "string" ? result.data : "Sync failed");
      }
    } catch {
      toast.error("Failed to sync catalog");
    } finally {
      setIsLoading(false);
    }
  };

  const handleStatusUpdate = async (productId: string, status: ProductStatus) => {
    setIsLoading(true);
    try {
      const result = await updateProductStatus(productId, status);
      if (result.status === 200) {
        setProducts(products.map((p) => (p.id === productId ? { ...p, status } : p)));
        setSelectedProduct(null);
        toast.success("Product status updated");
      }
    } catch {
      toast.error("Failed to update product");
    } finally {
      setIsLoading(false);
    }
  };

  const getPrice = (product: Product) => {
    const price = typeof product.price === "object" ? product.price.toNumber() : product.price;
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: product.currency || "USD",
    }).format(price);
  };

  const stats = {
    total: products.length,
    active: products.filter((p) => p.status === "ACTIVE").length,
    outOfStock: products.filter((p) => p.status === "OUT_OF_STOCK").length,
    discontinued: products.filter((p) => p.status === "DISCONTINUED").length,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between px-1 py-3 gap-3">
        <div className="flex items-center gap-2 text-sm">
          <a
            href={`/dashboard/${slug}`}
            className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
          >
            Dashboard
          </a>
          <span className="text-gray-400">/</span>
          <span className="text-gray-900 dark:text-white font-medium">Commerce</span>
        </div>
        <Button onClick={handleSync} disabled={isLoading} className="gap-2 w-full sm:w-auto">
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          Sync Catalog
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4 sm:mb-6">
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.total}</p>
              <p className="text-xs sm:text-sm text-gray-500">Total Products</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center shrink-0">
              <Check className="w-4 h-4 sm:w-5 sm:h-5 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.active}</p>
              <p className="text-xs sm:text-sm text-gray-500">In Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center shrink-0">
              <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 dark:text-yellow-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.outOfStock}</p>
              <p className="text-xs sm:text-sm text-gray-500">Out of Stock</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-neutral-900 rounded-xl p-3 sm:p-4 border border-gray-100 dark:border-neutral-800">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center shrink-0">
              <X className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-white">{stats.discontinued}</p>
              <p className="text-xs sm:text-sm text-gray-500">Discontinued</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mb-4">
        <div className="relative flex-1 sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2 justify-between sm:justify-start">
          <div className="flex gap-1.5 overflow-x-auto pb-1 -mb-1 scrollbar-hide">
            {(["all", "ACTIVE", "OUT_OF_STOCK", "DISCONTINUED"] as const).map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={cn(
                  "px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-colors whitespace-nowrap shrink-0",
                  filter === status
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 dark:bg-neutral-800 text-gray-600 dark:text-gray-300"
                )}
              >
                {status === "all" ? "All" : (
                  <>
                    <span className="sm:hidden">{status === "OUT_OF_STOCK" ? "OOS" : STATUS_LABELS[status].split(" ")[0]}</span>
                    <span className="hidden sm:inline">{STATUS_LABELS[status]}</span>
                  </>
                )}
              </button>
            ))}
          </div>
          <div className="flex gap-1 shrink-0">
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("grid")}
            >
              <Grid className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === "list" ? "secondary" : "ghost"}
              size="icon"
              className="h-8 w-8"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Products Grid/List */}
      <div className="flex-1 bg-white dark:bg-neutral-900 rounded-2xl border border-gray-100 dark:border-neutral-800 overflow-hidden">
        {filteredProducts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-gray-500 p-4">
            <ShoppingBag className="w-12 h-12 mb-3 opacity-50" />
            <p className="text-lg font-medium text-center">No products found</p>
            <p className="text-sm text-center">Sync your catalog to load products</p>
          </div>
        ) : viewMode === "grid" ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4 p-3 sm:p-4">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="text-left bg-gray-50 dark:bg-neutral-800 rounded-xl p-2 sm:p-3 hover:ring-2 ring-blue-500 transition-all"
              >
                <div className="aspect-square rounded-lg overflow-hidden bg-gray-200 dark:bg-neutral-700 mb-2 sm:mb-3">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-6 h-6 sm:w-8 sm:h-8 text-gray-400" />
                    </div>
                  )}
                </div>
                <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{product.name}</h3>
                <p className="text-xs sm:text-sm text-gray-500 mb-1 sm:mb-2">{getPrice(product)}</p>
                <span className={cn("text-[10px] sm:text-xs px-1.5 sm:px-2 py-0.5 sm:py-1 rounded-full", STATUS_COLORS[product.status])}>
                  {STATUS_LABELS[product.status]}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-neutral-800">
            {filteredProducts.map((product) => (
              <button
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="w-full flex items-center gap-3 sm:gap-4 p-3 sm:p-4 hover:bg-gray-50 dark:hover:bg-neutral-800 transition-colors text-left"
              >
                <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-lg overflow-hidden bg-gray-200 dark:bg-neutral-700 flex-shrink-0">
                  {product.imageUrl ? (
                    <Image
                      src={product.imageUrl}
                      alt={product.name}
                      width={64}
                      height={64}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Package className="w-5 h-5 sm:w-6 sm:h-6 text-gray-400" />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm sm:text-base text-gray-900 dark:text-white truncate">{product.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-500">{getPrice(product)}</p>
                </div>
                <span className={cn("text-[10px] sm:text-xs px-2 sm:px-3 py-1 rounded-full shrink-0", STATUS_COLORS[product.status])}>
                  <span className="hidden sm:inline">{STATUS_LABELS[product.status]}</span>
                  <span className="sm:hidden">{product.status === "OUT_OF_STOCK" ? "OOS" : STATUS_LABELS[product.status].split(" ")[0]}</span>
                </span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
          onClick={() => setSelectedProduct(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto"
          >
            <div className="relative h-40 sm:h-48 bg-gray-200 dark:bg-neutral-800">
              {selectedProduct.imageUrl ? (
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  fill
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <Package className="w-12 h-12 sm:w-16 sm:h-16 text-gray-400" />
                </div>
              )}
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-3 right-3 p-2 rounded-full bg-black/30 text-white hover:bg-black/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 sm:p-6">
              <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-2">
                {selectedProduct.name}
              </h2>
              <p className="text-xl sm:text-2xl font-bold text-blue-600 mb-4">{getPrice(selectedProduct)}</p>

              <div className="mb-4 sm:mb-6">
                <p className="text-xs sm:text-sm text-gray-500 mb-2">Current Status</p>
                <span className={cn("text-xs sm:text-sm px-3 py-1 rounded-full", STATUS_COLORS[selectedProduct.status])}>
                  {STATUS_LABELS[selectedProduct.status]}
                </span>
              </div>

              <div>
                <p className="text-xs sm:text-sm text-gray-500 mb-3">Update Status</p>
                <div className="flex flex-col sm:flex-row gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedProduct.id, "ACTIVE")}
                    disabled={isLoading || selectedProduct.status === "ACTIVE"}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <Check className="w-4 h-4 mr-1" />
                    In Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedProduct.id, "OUT_OF_STOCK")}
                    disabled={isLoading || selectedProduct.status === "OUT_OF_STOCK"}
                    className="flex-1 text-xs sm:text-sm"
                  >
                    <AlertCircle className="w-4 h-4 mr-1" />
                    Out of Stock
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleStatusUpdate(selectedProduct.id, "DISCONTINUED")}
                    disabled={isLoading || selectedProduct.status === "DISCONTINUED"}
                    className="flex-1 text-red-600 text-xs sm:text-sm"
                  >
                    <X className="w-4 h-4 mr-1" />
                    Discontinue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
