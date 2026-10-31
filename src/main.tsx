import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "@fontsource-variable/fraunces";
import "@fontsource-variable/plus-jakarta-sans";
import "@/styles/index.css";
import App from "@/app/App";
import { initialiseTheme } from "@/lib/theme";

initialiseTheme();

const root = document.getElementById("root");
if (!root) {
  throw new Error("Mindora root element is missing from index.html");
}

async function bootstrap() {
  // Demo mode must be installed before the first render so a restored demo
  // session resolves through the local adapter instead of the network.
  if (import.meta.env.DEV) {
    const { installDemoMode } = await import("./demo/install");
    installDemoMode();
  }

  createRoot(root as HTMLElement).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

void bootstrap();
