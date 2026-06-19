import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { App } from "@capacitor/app";
import { useNavigate, useLocation } from "react-router-dom";
import { isNative } from "../platform";

interface BackButtonContextValue {
  setHandler: (handler: (() => boolean) | null) => void;
}

const BackButtonContext = createContext<BackButtonContextValue>({
  setHandler: () => {},
});

export function useBackButton(): BackButtonContextValue {
  return useContext(BackButtonContext);
}

const ROOT_PATHS = [
  "/m/home", "/m/create", "/m/library", "/m/profile",
  "/dashboard",
  "/",
  "/intro", "/m/intro",
];

export const BackButtonProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const handlerRef = useRef<(() => boolean) | null>(null);
  const exitTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showExitToast, setShowExitToast] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const locationRef = useRef(location.pathname);
  locationRef.current = location.pathname;
  const navigateRef = useRef(navigate);
  navigateRef.current = navigate;

  const setHandler = useCallback((fn: (() => boolean) | null) => {
    handlerRef.current = fn;
  }, []);

  useEffect(() => {
    if (!isNative()) return;

    let listener: { remove: () => void } | undefined;

    App.addListener("backButton", ({ canGoBack }) => {
      if (handlerRef.current) {
        const handled = handlerRef.current();
        if (handled) return;
      }

      const path = locationRef.current;
      const isRootPath = ROOT_PATHS.some((p) => p === path);

      if (isRootPath) {
        if (exitTimerRef.current) {
          clearTimeout(exitTimerRef.current);
          exitTimerRef.current = null;
          setShowExitToast(false);
          App.exitApp();
        } else {
          setShowExitToast(true);
          exitTimerRef.current = setTimeout(() => {
            setShowExitToast(false);
            exitTimerRef.current = null;
          }, 2000);
        }
        return;
      }

      if (canGoBack) {
        window.history.back();
        return;
      }

      navigateRef.current(-1);
    }).then((h) => {
      listener = h;
    });

    return () => {
      listener?.remove();
    };
  }, []);

  return (
    <BackButtonContext.Provider value={{ setHandler }}>
      {children}
      {showExitToast && (
        <div className="back-exit-toast">Presiona de nuevo para salir</div>
      )}
    </BackButtonContext.Provider>
  );
};
