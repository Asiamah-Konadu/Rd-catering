"use server";

import { signIn } from "@/auth";
import { AuthError } from "next-auth";

export async function authenticateAdmin(
  prevState: string | undefined,
  formData: FormData
) {
  try {
    formData.append("redirectTo", "/admin");
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return "Invalid email or password. Please check your details and try again.";
        default:
          return "Authentication failed. Please check your credentials.";
      }
    }
    // Next.js redirect errors MUST be rethrown to perform navigation!
    throw error;
  }
}
