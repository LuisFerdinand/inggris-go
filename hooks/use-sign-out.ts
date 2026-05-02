"use client";

import { authClient } from "@/lib/auth/client";
import { useRouter } from "next/navigation";
import { useState, useCallback } from "react";
import toast from "react-hot-toast";

export function useSignOut() {
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const signOut = useCallback(async () => {
    if (isSigningOut) return;

    setIsSigningOut(true);

    try {
      const res = await authClient.signOut();

      if (res?.error) {
        throw new Error(res.error.message || "Sign out failed");
      }

      toast.success("Signed out successfully");
      router.push("/");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      toast.error("Failed to sign out");
    } finally {
      setIsSigningOut(false);
    }
  }, [isSigningOut, router]);

  return {
    signOut,
    isSigningOut,
  };
}
