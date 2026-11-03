"use client";
import { useCallback, useEffect, useState } from "react";
import { ApiError } from "@/shared/api/http";
import { useRouter } from "next/navigation";
export function useRemote<T>(load: (signal: AbortSignal) => Promise<T>) {
  const router = useRouter();
  const [revision, setRevision] = useState(0);
  const [state, setState] = useState<{
    data?: T;
    error?: string;
    loading: boolean;
  }>({ loading: true });
  const reload = useCallback(() => setRevision((v) => v + 1), []);
  useEffect(() => {
    const controller = new AbortController();
    setState({ loading: true });
    load(controller.signal)
      .then((data) => {
        if (!controller.signal.aborted) setState({ data, loading: false });
      })
      .catch((error) => {
        if (controller.signal.aborted) return;
        if (error instanceof ApiError && error.status === 401)
          router.replace("/login");
        setState({
          error: error instanceof Error ? error.message : "Ошибка загрузки",
          loading: false,
        });
      });
    return () => controller.abort();
  }, [load, revision, router]);
  return { ...state, reload };
}
