import { useEffect, useState } from "react";

let cachedSupport: boolean | null = null;

function detectWebGl(): boolean {
  if (typeof document === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    const context =
      canvas.getContext("webgl2") ||
      canvas.getContext("webgl") ||
      canvas.getContext("experimental-webgl");
    return Boolean(context);
  } catch {
    return false;
  }
}

export function useWebGlSupport(): boolean | null {
  const [supported, setSupported] = useState<boolean | null>(cachedSupport);

  useEffect(() => {
    if (cachedSupport !== null) return;
    cachedSupport = detectWebGl();
    setSupported(cachedSupport);
  }, []);

  return supported;
}
