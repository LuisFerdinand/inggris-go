// components/AuthProvider.tsx
"use client";

import { useEffect } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";

const IDLE_TIMEOUT_MS = 60 * 60 * 1000;

function IdleLogoutWatcher({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  useEffect(() => {
    if (status !== "authenticated") return;

    let timeoutId: number | undefined;

    const resetTimer = () => {
      window.clearTimeout(timeoutId);

      timeoutId = window.setTimeout(() => {
        signOut({ callbackUrl: "/" });
      }, IDLE_TIMEOUT_MS);
    };

    const handleActivity = () => {
      if (document.visibilityState === "hidden") return;
      resetTimer();
    };

    const events = [
      "mousemove",
      "mousedown",
      "keydown",
      "touchstart",
      "scroll",
      "visibilitychange",
    ] as const;

    events.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true });
    });

    resetTimer();

    return () => {
      window.clearTimeout(timeoutId);

      events.forEach((eventName) => {
        window.removeEventListener(eventName, handleActivity);
      });
    };
  }, [status]);

  return <>{children}</>;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider refetchInterval={0} refetchOnWindowFocus>
      <IdleLogoutWatcher>{children}</IdleLogoutWatcher>
    </SessionProvider>
  );
}