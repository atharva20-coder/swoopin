import { client } from "@/lib/prisma";
import transporter from "@/lib/nodemailer";
import type { EarlyAccessRequestInput } from "@/schemas/early-access.schema";

/**
 * ============================================
 * EARLY ACCESS SERVICE
 * Business logic for tester enrollment requests
 * IDOR protection via userId ownership checks
 * ============================================
 */

class EarlyAccessService {
  /**
   * Create or update an early-access request.
   * Uses upsert to enforce one request per user+platform.
   * Sends admin notification email on new submissions.
   */
  async createRequest(userId: string, data: EarlyAccessRequestInput) {
    const request = await client.earlyAccessRequest.upsert({
      where: {
        userId_platform: {
          userId,
          platform: "INSTAGRAM",
        },
      },
      create: {
        userId,
        platform: "INSTAGRAM",
        fullName: data.fullName,
        email: data.email,
        instagramHandle: data.instagramHandle,
        note: data.note,
      },
      update: {
        fullName: data.fullName,
        email: data.email,
        instagramHandle: data.instagramHandle,
        note: data.note,
        status: "PENDING",
      },
      select: {
        id: true,
        platform: true,
        fullName: true,
        email: true,
        instagramHandle: true,
        status: true,
        createdAt: true,
      },
    });

    // Fire-and-forget: notify admin(s) via email
    void this.notifyAdmins(request);

    return request;
  }

  /**
   * Get existing early-access request for a user + platform.
   * Returns null if no request exists.
   */
  async getRequest(userId: string, platform: string) {
    const request = await client.earlyAccessRequest.findUnique({
      where: {
        userId_platform: {
          userId,
          platform,
        },
      },
      select: {
        id: true,
        platform: true,
        fullName: true,
        email: true,
        instagramHandle: true,
        status: true,
        createdAt: true,
      },
    });

    return request;
  }

  /**
   * Send email notification to admin(s) when a new request comes in.
   * Uses ADMIN_EMAILS from environment variable.
   */
  private async notifyAdmins(request: {
    fullName: string;
    email: string;
    instagramHandle: string | null;
    platform: string;
  }) {
    const adminEmails = (process.env.ADMIN_EMAILS || "")
      .split(",")
      .map((e) => e.trim())
      .filter((e) => e.length > 0);

    if (adminEmails.length === 0) {
      console.warn(
        "[EarlyAccess] No ADMIN_EMAILS configured, skipping notification",
      );
      return;
    }

    const handle = request.instagramHandle
      ? `@${request.instagramHandle}`
      : "Not provided";

    const mailOptions = {
      from: process.env.NODEMAILER_USER,
      to: adminEmails.join(","),
      subject: `🚀 Swoopin – New Early Access Request (${request.platform})`,
      html: `
        <div style="max-width: 520px; margin: 20px auto; padding: 24px; border-radius: 8px; background-color: #ffffff; font-family: Arial, sans-serif; border: 1px solid #e0e0e0; box-shadow: 0 2px 6px rgba(0,0,0,0.05);">
          <h2 style="font-size: 20px; color: #111827; margin-bottom: 16px;">🚀 New Early Access Request</h2>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #374151;">
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Platform</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">${request.platform}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Name</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">${request.fullName}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Email</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">${request.email}</td>
            </tr>
            <tr>
              <td style="padding: 8px 12px; font-weight: bold; border-bottom: 1px solid #f3f4f6;">Instagram</td>
              <td style="padding: 8px 12px; border-bottom: 1px solid #f3f4f6;">${handle}</td>
            </tr>
          </table>
          <p style="font-size: 13px; color: #6b7280; margin-top: 16px;">
            Add this user as a tester in the 
            <a href="https://developers.facebook.com/apps/" style="color: #6366f1;">Meta Developer Dashboard</a> 
            and update their status.
          </p>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (err) {
      console.error("[EarlyAccess] Failed to send admin notification:", err);
    }
  }
}

// Export singleton instance
export const earlyAccessService = new EarlyAccessService();
