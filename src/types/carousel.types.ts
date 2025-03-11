/**
 * Types for Carousel Template feature
 */

/**
 * Button types supported in carousel elements
 */
export type ButtonType = "WEB_URL" | "POSTBACK";

/**
 * Button interface for carousel elements
 * - title: Max 20 characters
 * - url: Required for WEB_URL type
 * - payload: Required for POSTBACK type
 */
export interface CarouselButton {
  type: ButtonType;
  title: string; // Max 20 chars
  url?: string; // Required if type is WEB_URL
  payload?: string; // Required if type is POSTBACK
}

/**
 * Single carousel element interface
 * - title: Required, max 80 characters
 * - subtitle: Optional, max 80 characters
 * - imageUrl: Optional URL for element image
 * - defaultAction: Optional URL for entire element click
 * - buttons: 1-3 buttons per element
 */
export interface CarouselElement {
  title: string; // Max 80 chars
  subtitle?: string; // Max 80 chars
  imageUrl?: string;
  defaultAction?: string;
  buttons: CarouselButton[]; // Min 1, max 3 buttons
}

/**
 * Complete carousel template interface
 * - elements: 1-10 carousel elements
 */
export interface CarouselTemplate {
  elements: CarouselElement[]; // Min 1, max 10 elements
}

/**
 * Props for CarouselTemplateForm component
 */
export interface CarouselTemplateFormProps {
  automationId: string;
  onSuccess?: () => void;
}