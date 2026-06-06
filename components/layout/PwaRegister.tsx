"use client";

import { useEffect } from "react";
import { toast } from "@/store/ui.store";

export function PwaRegister() {
  useEffect(() => {
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    let reloaded = false;

    const promptUpdate = (worker: ServiceWorker | null) => {
      if (!worker) return;
      toast.info("A new version of GutCheck is ready.", {
        duration: 0,
        action: {
          label: "Refresh",
          onClick: () => worker.postMessage("SKIP_WAITING"),
        },
      });
    };

    const register = async () => {
      try {
        const reg = await navigator.serviceWorker.register("/sw.js", { scope: "/" });

        // A worker is already waiting (update found on a previous load).
        if (reg.waiting && navigator.serviceWorker.controller) {
          promptUpdate(reg.waiting);
        }

        reg.addEventListener("updatefound", () => {
          const installing = reg.installing;
          if (!installing) return;
          installing.addEventListener("statechange", () => {
            // Only prompt for updates, not the very first install.
            if (installing.state === "installed" && navigator.serviceWorker.controller) {
              promptUpdate(reg.waiting ?? installing);
            }
          });
        });
      } catch {
        // Registration can fail in dev or when SW is missing; stay quiet.
      }
    };

    // When the new SW takes control, reload once to pick up fresh assets.
    const onControllerChange = () => {
      if (reloaded) return;
      reloaded = true;
      window.location.reload();
    };
    navigator.serviceWorker.addEventListener("controllerchange", onControllerChange);

    void register();

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", onControllerChange);
    };
  }, []);

  return null;
}
