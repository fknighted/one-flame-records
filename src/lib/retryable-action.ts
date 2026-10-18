"use client";
import { useCallback, useRef } from "react";
/** Keep the same identity after a lost response. A received result ends that
 * attempt; a later intentional submission gets a fresh identity. */
export function useRetryableAction<S>(action: (previous: S, data: FormData) => Promise<S>) {
  const request = useRef<string | null>(null);
  return useCallback(async (previous: S, data: FormData): Promise<S> => {
    request.current ??= crypto.randomUUID();
    data.set("request_id", request.current);
    try {
      const result = await action(previous, data);
      if (!result || typeof result !== "object" || !("error" in result)) request.current = null;
      return result;
    } catch (error) { throw error; }
  }, [action]);
}
