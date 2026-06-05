import { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.flashy.app",
  appName: "Flashy",
  webDir: "build",
  server: {
    // Allow navigation to backend API from native app
    allowNavigation: ["*"],
  },
  android: {
    allowMixedContent: true,
  },
  ios: {
    contentInset: "automatic",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#631d76",
      androidScaleType: "CENTER_CROP",
    },
    StatusBar: {
      style: "dark",
      backgroundColor: "#631d76",
    },
  },
};

export default config;
