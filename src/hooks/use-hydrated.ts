import { useSyncExternalStore } from "react";

const subscribe = () => () => {};

/**
 * `false` during SSR and while hydrating, `true` afterwards.
 * Use it for UI that depends on client-only state (session, theme) so the
 * first client render matches the server HTML exactly.
 */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
