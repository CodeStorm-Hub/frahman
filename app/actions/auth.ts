"use server";

import { signIn, signOut } from "@/auth";
import { AuthError } from "next-auth";

export async function loginAction(_prev: string | null, formData: FormData): Promise<string | null> {
  try {
    await signIn("credentials", {
      username: formData.get("username") as string,
      password: formData.get("password") as string,
      redirectTo: "/",
    });
    return null;
  } catch (err) {
    if (err instanceof AuthError) {
      return "Invalid username or password.";
    }
    throw err; // re-throw Next.js redirect
  }
}

export async function signOutAction(): Promise<void> {
  await signOut({ redirectTo: "/login" });
}
