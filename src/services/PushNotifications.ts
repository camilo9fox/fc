/**
 * Push notifications service for Capacitor native apps.
 * Handles registration, token management, and incoming notification routing.
 */
import { PushNotifications } from "@capacitor/push-notifications";
import { isNative, platformName } from "../platform";
import { apiClient } from "../api";

const TOKEN_SENT_KEY = "flashy:push-token-sent";

export async function initializePushNotifications(): Promise<void> {
  if (!isNative()) return;

  try {
    const permStatus = await PushNotifications.checkPermissions();
    if (permStatus.receive !== "granted") {
      const result = await PushNotifications.requestPermissions();
      if (result.receive !== "granted") return;
    }

    await PushNotifications.register();
  } catch (err) {
    console.warn("[Push] Failed to initialize:", err);
  }
}

export async function addPushListeners(): Promise<void> {
  if (!isNative()) return;

  await PushNotifications.addListener("registration", async (token) => {
    console.log("[Push] Registered with token:", token.value);
    await sendTokenToBackend(token.value);
  });

  await PushNotifications.addListener("registrationError", (err) => {
    console.error("[Push] Registration error:", err);
  });

  await PushNotifications.addListener(
    "pushNotificationReceived",
    (notification) => {
      // Notification received while app is in foreground
      // Could show an in-app toast here if desired
      console.log("[Push] Received foreground notification:", notification);
    },
  );

  await PushNotifications.addListener(
    "pushNotificationActionPerformed",
    (action) => {
      // User tapped notification — navigate to the target
      const data = action.notification.data;
      if (data?.route) {
        const route = data.route as string;
        const allowed =
          route.startsWith("/") ||
          route.startsWith(window.location.origin);
        if (allowed) {
          window.location.href = route;
        }
      }
    },
  );
}

async function sendTokenToBackend(token: string): Promise<void> {
  const alreadySent = localStorage.getItem(TOKEN_SENT_KEY) === token;
  if (alreadySent) return;

  try {
    await apiClient.post("/auth/push-token", {
      token,
      platform: platformName(),
    });
    localStorage.setItem(TOKEN_SENT_KEY, token);
    console.log("[Push] Token sent to backend");
  } catch (err) {
    console.warn("[Push] Failed to send token to backend:", err);
  }
}

export async function removePushListeners(): Promise<void> {
  if (!isNative()) return;
  await PushNotifications.removeAllListeners();
}
