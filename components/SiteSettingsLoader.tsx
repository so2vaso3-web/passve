"use client";

import { useEffect } from "react";

export function SiteSettingsLoader() {
  useEffect(() => {
    // Load site settings và cập nhật favicon, title động
    const loadSettings = async () => {
      try {
        const res = await fetch("/api/site-settings", { cache: "no-store" });
        if (!res.ok) {
          // Nếu API lỗi, bỏ qua (không làm crash app)
          return;
        }
        const data = await res.json();
        
        if (data?.settings) {
          const { siteName, favicon, logo, themeColor } = data.settings;
          
          // Cập nhật favicon
          if (favicon) {
            let link = document.querySelector("link[rel='icon']") as HTMLLinkElement;
            if (!link) {
              link = document.createElement("link");
              link.rel = "icon";
              document.head.appendChild(link);
            }
            link.href = favicon;
            
            // Cập nhật apple-touch-icon
            let appleLink = document.querySelector("link[rel='apple-touch-icon']") as HTMLLinkElement;
            if (!appleLink) {
              appleLink = document.createElement("link");
              appleLink.rel = "apple-touch-icon";
              document.head.appendChild(appleLink);
            }
            appleLink.href = favicon;
          }
          
          // Cập nhật title
          if (siteName) {
            document.title = siteName;
          }
          
          // Cập nhật theme color
          if (themeColor) {
            let themeMeta = document.querySelector("meta[name='theme-color']") as HTMLMetaElement;
            if (!themeMeta) {
              themeMeta = document.createElement("meta");
              themeMeta.name = "theme-color";
              document.head.appendChild(themeMeta);
            }
            themeMeta.content = themeColor;
          }
        }
      } catch (error) {
        console.error("Error loading site settings:", error);
      }
    };
    
    loadSettings();
  }, []);

  return null;
}

