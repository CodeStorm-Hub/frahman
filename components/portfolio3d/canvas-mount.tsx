"use client";

import { useEffect, useState } from "react";
import { CanvasBackground } from "./canvas-background";

/** Defers the WebGL canvas to client-only mount — avoids any SSR/hydration mismatch. */
export function CanvasMount() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return <CanvasBackground />;
}
