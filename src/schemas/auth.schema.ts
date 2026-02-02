import { z } from "zod";

/**
 * ============================================
 * AUTH SECURITY SCHEMAS (Contract-Driven Design)
 * Strict validation filters before Service Layer
 * ============================================
 */

export const SignUpSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email address"),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least 1 uppercase letter")
      .regex(/[0-9]/, "Password must contain at least 1 numeric character")
      .regex(
        /[!@#$%^&*(),.?":{}|<>]/,
        "Password must contain at least 1 special character",
      ),
  })
  .refine(
    (data) => !data.password.toLowerCase().includes(data.name.toLowerCase()),
    {
      message: "Password cannot contain your name",
      path: ["password"],
    },
  );

export type SignUpInput = z.infer<typeof SignUpSchema>;
