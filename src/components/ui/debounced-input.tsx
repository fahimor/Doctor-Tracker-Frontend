"use client";

import type { InputHTMLAttributes } from "react";
import { useDebouncedCommit } from "@/hooks/use-debounced-commit";
import { Input } from "./input";

interface DebouncedInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "value" | "onChange"> {
  value: string;
  /** Called once the user pauses typing. */
  onCommit: (value: string) => void;
  delay?: number;
}

/** An <Input> for filters: updates instantly, reports upstream after a pause. */
export function DebouncedInput({ value, onCommit, delay, ...props }: DebouncedInputProps) {
  const [text, setText] = useDebouncedCommit(value, onCommit, delay);
  return <Input {...props} value={text} onChange={(e) => setText(e.target.value)} />;
}
