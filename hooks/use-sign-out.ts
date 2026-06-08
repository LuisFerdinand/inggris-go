// hooks/use-sign-out.ts
"use client";

import { signOut as nextAuthSignOut } from "next-auth/react";
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
      // redirect: false lets us drive navigation ourselves + show the toast
      await nextAuthSignOut({ redirect: false });

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

  return { signOut, isSigningOut };
}