import { useEffect, useEffectEvent, useState } from "react";
import { useDebouncedValue } from "./use-debounced-value";

/**
 * Local text state for an input whose real value lives elsewhere (the URL).
 * Keystrokes update instantly; `onCommit` fires only after the user pauses,
 * so typing "65" sends one request, not two. External changes to `value`
 * (e.g. "Clear filters") are synced back into the input.
 */
export function useDebouncedCommit(value: string, onCommit: (next: string) => void, delay = 350) {
  const [text, setText] = useState(value);
  const debounced = useDebouncedValue(text, delay);

  // Adjust state during render when the source value changes from outside.
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    setText(value);
  }

  // Reads the latest `value`/`onCommit` without re-running the effect for them.
  const commit = useEffectEvent((next: string) => {
    if (next !== value) onCommit(next);
  });

  useEffect(() => {
    commit(debounced.trim());
  }, [debounced]);

  return [text, setText] as const;
}
