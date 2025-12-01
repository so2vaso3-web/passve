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
          const { siteName, favicon, logo, ogImage, themeColor } = data.settings;
          
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
          
          // Cập nhật logo cho search engines (Open Graph)
          if (logo) {
            // OG Image
            let ogImageMeta = document.querySelector("meta[property='og:image']") as HTMLMetaElement;
            if (!ogImageMeta) {
              ogImageMeta = document.createElement("meta");
              ogImageMeta.setAttribute("property", "og:image");
              document.head.appendChild(ogImageMeta);
            }
            ogImageMeta.content = ogImage || logo;
            
            // Twitter Image
            let twitterImageMeta = document.querySelector("meta[name='twitter:image']") as HTMLMetaElement;
            if (!twitterImageMeta) {
              twitterImageMeta = document.createElement("meta");
              twitterImageMeta.setAttribute("name", "twitter:image");
              document.head.appendChild(twitterImageMeta);
            }
            twitterImageMeta.content = ogImage || logo;
          }
          
          // Cập nhật title
          if (siteName) {
            document.title = siteName;
            
            // Cập nhật OG Title
            let ogTitle = document.querySelector("meta[property='og:title']") as HTMLMetaElement;
            if (!ogTitle) {
              ogTitle = document.createElement("meta");
              ogTitle.setAttribute("property", "og:title");
              document.head.appendChild(ogTitle);
            }
            ogTitle.content = siteName;
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

