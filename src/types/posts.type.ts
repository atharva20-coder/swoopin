/**
 * Instagram Post type - matches Zod schema in user-queries.ts
 * Following Zero-Patchwork Protocol:
 * - All nullish values are normalized to empty strings at schema layer
 * - Types here reflect the POST-normalization state
 */
export type InstagramPostProps = {
  id: string;
  media_type: "IMAGE" | "VIDEO" | "CAROUSEL_ALBUM";
  media_url: string; // Normalized from nullish to "" in schema
  timestamp: string;
  caption: string; // Normalized from nullish to "" in schema
};
