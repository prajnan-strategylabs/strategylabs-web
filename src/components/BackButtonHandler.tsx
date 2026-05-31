import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { App } from "@capacitor/app";

export function BackButtonHandler() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const listenerPromise = App.addListener("backButton", () => {
      const rootPaths = ["/dashboard", "/login", "/"];
      
      if (rootPaths.includes(location.pathname)) {
        // Exit the native app if they are on a root landing or login page
        App.exitApp();
      } else {
        // Otherwise, navigate back in the React Router navigation stack
        navigate(-1);
      }
    });

    return () => {
      // Safely clean up the listener once unmounted
      listenerPromise.then((handle) => handle.remove());
    };
  }, [location.pathname, navigate]);

  return null;
}
