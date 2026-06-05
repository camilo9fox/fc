/**
 * Platform detection utility.
 * Works in both web browser and Capacitor native environment.
 *
 * Usage:
 *   import { isNative, isWeb, platformName, forceMobileUI } from '../platform';
 *
 *   const showMobile = forceMobileUI(); // true if native OR viewport <= 900
 */

let _capacitor: typeof import("@capacitor/core").Capacitor | null = null;

function getCapacitor() {
  if (_capacitor) return _capacitor;
  try {
    // Dynamic require so web builds without Capacitor don't crash
    _capacitor = require("@capacitor/core").Capacitor;
  } catch {
    _capacitor = null;
  }
  return _capacitor;
}

/** True when running inside Capacitor native shell */
export function isNative(): boolean {
  const cap = getCapacitor();
  return cap ? cap.isNativePlatform() : false;
}

/** True when running in a regular browser */
export function isWeb(): boolean {
  return !isNative();
}

/** Returns 'ios', 'android', or 'web' */
export function platformName(): "ios" | "android" | "web" {
  if (!isNative()) return "web";
  const cap = getCapacitor();
  return (cap?.getPlatform() as "ios" | "android") || "web";
}

/** Force mobile UI when running natively OR viewport is narrow */
export function forceMobileUI(): boolean {
  if (isNative()) return true;
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 900;
}
