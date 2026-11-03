"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
export function LegacyRedirect() {
  const router = useRouter();
  useEffect(() => {
    const target = window.location.hash.slice(1);
    router.replace(
      /^\/(dashboard|portfolio(?:\/[^/?#]+)?|profile|admin)$/.test(target)
        ? target
        : "/dashboard",
    );
  }, [router]);
  return (
    <p role="status" className="p-8 text-muted">
      Открываем рабочее пространство…
    </p>
  );
}
