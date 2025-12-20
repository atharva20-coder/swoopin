import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { magicLink } from "better-auth/plugins";
import { hash, verify, type Options } from "@node-rs/argon2";
import { client } from "./prisma";
import { sendEmailAction } from "@/actions/send-email.action";

// Argon2id configuration (OWASP recommended)
const argon2Opts: Options = {
  memoryCost: 65536, // 64 MiB
  timeCost: 3,       // 3 iterations
  parallelism: 4,    // 4 parallel threads
  outputLen: 32,     // 32 bytes output
  algorithm: 2,      // Argon2id (recommended)
};

export const auth = betterAuth({
  // Required for production OAuth - must match your deployed URL
  baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  secret: process.env.BETTER_AUTH_SECRET,
  
  // Trusted origins for OAuth callbacks
  trustedOrigins: [
    "https://swoopin.vercel.app",
    "http://localhost:3000",
  ],
  
  database: prismaAdapter(client, { provider: "postgresql" }),
  
  // Email/Password with Argon2 hashing
  emailAndPassword: {
    enabled: true,
    password: {
      hash: async (password) => hash(password, argon2Opts),
      verify: async ({ password, hash: h }) => verify(h, password, argon2Opts),
    },
    requireEmailVerification: true,
    
    // Password reset email
    sendResetPassword: async ({ user, url }) => {
      await sendEmailAction({
        to: user.email,
        subject: "Reset your password",
        meta: {
          description: "Click the button below to reset your password.",
          link: url,
        },
      });
    },
  },
  
  // Email Verification Setup
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      const link = new URL(url);
      link.searchParams.set("callbackURL", "/auth/verify");

      await sendEmailAction({
        to: user.email,
        subject: "Verify your email",
        meta: {
          description: "Click the button below to verify your email address.",
          link: String(link),
        },
      });
    },
  },
  
  // Google OAuth
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    },
  },
  
  // Enable account linking
  account: {
    accountLinking: {
      enabled: true,
      trustedProviders: ["google"],
    },
  },
  
  // Let the database generate IDs (required for UUID columns)
  advanced: {
    database: {
      generateId: false,
    },
  },
  
  // Plugins
  plugins: [
    // Magic Link plugin for passwordless login and forgot password
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        await sendEmailAction({
          to: email,
          subject: "Magic Link Login",
          meta: {
            description: "Click the button below to log in to your account.",
            link: String(url),
          },
        });
      },
    }),
  ],
});

// Export types for use in server actions
export type Session = typeof auth.$Infer.Session;
export type User = typeof auth.$Infer.Session.user;
export type ErrorCode = keyof typeof auth.$ERROR_CODES | "UNKNOWN";
