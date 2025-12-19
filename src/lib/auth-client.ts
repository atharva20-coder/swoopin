import { createAuthClient } from "better-auth/react";
import { magicLinkClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
  plugins: [
    magicLinkClient(),
  ],
});

export const { 
  signUp, 
  signOut, 
  signIn,  // signIn.email(), signIn.social(), signIn.magicLink()
  useSession, 
  sendVerificationEmail, 
  resetPassword,
} = authClient;

// forgetPassword - triggers password reset email
export async function forgetPassword(options: {
  email: string;
  redirectTo?: string;
  fetchOptions?: {
    onRequest?: () => void;
    onResponse?: () => void;
    onError?: (ctx: { error: { message: string } }) => void;
    onSuccess?: () => void;
  };
}) {
  // @ts-expect-error - forgetPassword exists at runtime but types may not expose it
  return authClient.forgetPassword(options);
}

// Re-export the client for direct access
export default authClient;
