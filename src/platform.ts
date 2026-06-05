/**
 * Platform detection utility.
 * Works in both web browser and Capacitor native environment.
 *
 * In Capacitor WebView, window.Capacitor is injected as a global.
 * No module imports needed — works with webpack bundling.
 *
 * Usage:
 *   import { isNative, isWeb, platformName, forceMobileUI } from '../platform';
 *
 *   const showMobile = forceMobileUI(); // true if native OR viewport <= 900
 */

interface CapacitorGlobal {
  isNativePlatform(): boolean;
  getPlatform(): "ios" | "android" | "web";
}

function getCapacitor(): CapacitorGlobal | null {
  if (typeof window !== "undefined" && (window as any).Capacitor) {
    return (window as any).Capacitor;
  }
  return null;
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
  const cap = getCapacitor();
  if (cap && cap.isNativePlatform()) {
    return cap.getPlatform() as "ios" | "android";
  }
  return "web";
}

/** Force mobile UI when running natively OR viewport is narrow */
export function forceMobileUI(): boolean {
  if (isNative()) return true;
  if (typeof window === "undefined") return false;
  return window.innerWidth <= 900;
}
