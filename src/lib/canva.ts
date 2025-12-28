// Canva API utility library

import crypto from "crypto";

const CANVA_API_BASE = "https://api.canva.com/rest/v1";
const CANVA_AUTH_URL = "https://www.canva.com/api/oauth/authorize";
const CANVA_TOKEN_URL = "https://api.canva.com/rest/v1/oauth/token";

// Required scopes for accessing designs
const CANVA_SCOPES = [
  "design:meta:read",
  "design:content:read", 
  "asset:read",
  "profile:read",
].join(" ");

// Generate PKCE code verifier and challenge
export function generatePKCE(): { codeVerifier: string; codeChallenge: string } {
  // Generate a random 32-byte string
  const codeVerifier = crypto.randomBytes(32).toString("base64url");
  
  // Create SHA-256 hash and base64url encode it
  const codeChallenge = crypto
    .createHash("sha256")
    .update(codeVerifier)
    .digest("base64url");
  
  return { codeVerifier, codeChallenge };
}

// Generate Canva OAuth authorization URL
export function getCanvaAuthUrl(
  redirectUri: string,
  state: string,
  codeChallenge: string
): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: process.env.CANVA_CLIENT_ID || "",
    redirect_uri: redirectUri,
    scope: CANVA_SCOPES,
    state: state,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return `${CANVA_AUTH_URL}?${params.toString()}`;
}

// Exchange authorization code for tokens
export async function exchangeCodeForTokens(
  code: string,
  codeVerifier: string,
  redirectUri: string
): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
  tokenType: string;
}> {
  const credentials = Buffer.from(
    `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code: code,
      code_verifier: codeVerifier,
      redirect_uri: redirectUri,
    }).toString(),
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Canva token exchange error:", error);
    throw new Error(`Failed to exchange code: ${error}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
    tokenType: data.token_type,
  };
}

// Refresh access token
export async function refreshAccessToken(refreshToken: string): Promise<{
  accessToken: string;
  refreshToken?: string;
  expiresIn: number;
}> {
  const credentials = Buffer.from(
    `${process.env.CANVA_CLIENT_ID}:${process.env.CANVA_CLIENT_SECRET}`
  ).toString("base64");

  const response = await fetch(CANVA_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      "Authorization": `Basic ${credentials}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }).toString(),
  });

  if (!response.ok) {
    throw new Error("Failed to refresh token");
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

// Get user's designs from Canva
export async function getUserDesigns(
  accessToken: string,
  options?: { limit?: number; continuation?: string }
): Promise<{
  designs: Array<{
    id: string;
    title: string;
    thumbnail?: { url: string };
    urls?: { viewUrl: string; editUrl: string };
    createdAt: string;
    updatedAt: string;
  }>;
  continuation?: string;
}> {
  const params = new URLSearchParams();
  if (options?.limit) params.set("limit", options.limit.toString());
  if (options?.continuation) params.set("continuation", options.continuation);

  const url = `${CANVA_API_BASE}/designs${params.toString() ? `?${params}` : ""}`;
  
  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    console.error("Canva designs fetch error:", error);
    throw new Error(`Failed to fetch designs: ${error}`);
  }

  const data = await response.json();
  return {
    designs: data.items || [],
    continuation: data.continuation,
  };
}

// Get a specific design by ID
export async function getDesign(
  accessToken: string,
  designId: string
): Promise<{
  id: string;
  title: string;
  thumbnail?: { url: string };
  urls?: { viewUrl: string; editUrl: string };
}> {
  const response = await fetch(`${CANVA_API_BASE}/designs/${designId}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch design");
  }

  const data = await response.json();
  return data.design;
}

// Export design as image
export async function exportDesign(
  accessToken: string,
  designId: string,
  format: "png" | "jpg" | "pdf" = "png"
): Promise<{
  exportId: string;
  status: "in_progress" | "completed" | "failed";
  urls?: string[];
}> {
  // Start export job
  const response = await fetch(`${CANVA_API_BASE}/designs/${designId}/export`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      format: format,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to start export: ${error}`);
  }

  const data = await response.json();
  return {
    exportId: data.job?.id,
    status: data.job?.status || "in_progress",
    urls: data.job?.urls,
  };
}

// Check export job status
export async function getExportStatus(
  accessToken: string,
  designId: string,
  exportId: string
): Promise<{
  status: "in_progress" | "completed" | "failed";
  urls?: string[];
}> {
  const response = await fetch(
    `${CANVA_API_BASE}/designs/${designId}/export/${exportId}`,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    }
  );

  if (!response.ok) {
    throw new Error("Failed to check export status");
  }

  const data = await response.json();
  return {
    status: data.job?.status || "failed",
    urls: data.job?.urls,
  };
}

// Get user profile
export async function getUserProfile(accessToken: string): Promise<{
  userId: string;
  displayName?: string;
}> {
  const response = await fetch(`${CANVA_API_BASE}/users/me`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!response.ok) {
    throw new Error("Failed to fetch user profile");
  }

  const data = await response.json();
  return {
    userId: data.user?.id,
    displayName: data.user?.display_name,
  };
}
