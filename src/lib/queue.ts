"use server";

import { Client } from "@upstash/qstash";

// Initialize QStash client
const qstash = new Client({
  token: process.env.QSTASH_TOKEN!,
});

export type WebhookJobPayload = {
  webhookPayload: any;
  receivedAt: string;
  retryCount?: number;
};

/**
 * Enqueue a webhook for reliable processing
 * Returns immediately, processing happens async
 */
export async function enqueueWebhookJob(payload: WebhookJobPayload) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL;
  
  if (!baseUrl) {
    console.error("QStash: No base URL configured");
    throw new Error("No base URL configured for QStash");
  }

  const targetUrl = `${baseUrl.startsWith("http") ? baseUrl : `https://${baseUrl}`}/api/jobs/process-webhook`;

  console.log("QStash: Enqueueing webhook job to", targetUrl);

  try {
    const result = await qstash.publishJSON({
      url: targetUrl,
      body: payload,
      retries: 3, // Retry up to 3 times on failure
      delay: 0, // Process immediately
    });

    console.log("QStash: Job enqueued with ID:", result.messageId);
    return { success: true, messageId: result.messageId };
  } catch (error) {
    console.error("QStash: Failed to enqueue job:", error);
    throw error;
  }
}

/**
 * Enqueue a delayed job (for scheduled automations)
 */
export async function enqueueDelayedJob(
  payload: WebhookJobPayload,
  delaySeconds: number
) {
  const baseUrl = process.env.NEXT_PUBLIC_URL || process.env.VERCEL_URL;
  const targetUrl = `${baseUrl?.startsWith("http") ? baseUrl : `https://${baseUrl}`}/api/jobs/process-webhook`;

  const result = await qstash.publishJSON({
    url: targetUrl,
    body: payload,
    retries: 3,
    delay: delaySeconds,
  });

  return { success: true, messageId: result.messageId };
}

