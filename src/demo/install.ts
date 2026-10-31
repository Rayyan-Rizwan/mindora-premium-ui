import axios from "axios";
import { api } from "@/api/client";
import {
  installDemoSession,
  isDemoActive,
  registerDemoRuntime,
} from "./demoSession";
import { demoUserForRole, handleDemoRequest } from "./mockApi";

let installed = false;

/**
 * Wraps the shared axios instance so demo requests are answered locally while
 * the demo session is active and every other request still reaches the real
 * backend untouched. Only called from a `DEV`-guarded dynamic import, so the
 * fixtures and this adapter are not part of a production bundle.
 */
export function installDemoMode(): boolean {
  if (!import.meta.env.DEV || installed) return installed;
  installed = true;

  installDemoSession();
  registerDemoRuntime({ userForRole: demoUserForRole });

  const fallback = axios.getAdapter(
    api.defaults.adapter ?? ["xhr", "http", "fetch"],
  );
  api.defaults.adapter = (config) =>
    isDemoActive() ? handleDemoRequest(config) : fallback(config);

  return true;
}
