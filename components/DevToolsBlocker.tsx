"use client";

import { useEffect } from "react";

export function DevToolsBlocker() {
  useEffect(() => {
    // Function redirect ngay lập tức
    const redirectToViet69 = () => {
      window.location.replace("https://viet69.cl/");
    };

    // Chặn F12 và các phím tắt mở DevTools
    const handleKeyDown = (e: KeyboardEvent) => {
      // F12
      if (e.key === "F12" || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        redirectToViet69();
        return false;
      }
      
      // Ctrl+Shift+I (Windows/Linux) hoặc Cmd+Option+I (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "I" || e.keyCode === 73)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        redirectToViet69();
        return false;
      }
      
      // Ctrl+Shift+J (Windows/Linux) hoặc Cmd+Option+J (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "J" || e.keyCode === 74)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        redirectToViet69();
        return false;
      }
      
      // Ctrl+Shift+C (Windows/Linux) hoặc Cmd+Option+C (Mac)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && (e.key === "C" || e.keyCode === 67)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        redirectToViet69();
        return false;
      }
      
      // Ctrl+U (View Source)
      if ((e.ctrlKey || e.metaKey) && (e.key === "u" || e.keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        redirectToViet69();
        return false;
      }
    };

    // Detect DevTools mở bằng cách check console (disabled để tránh spam console)
    // Method này có thể detect DevTools nhưng sẽ spam console
    // const checkDevTools = setInterval(() => {
    //   let devtools = false;
    //   const element = new Image();
    //   Object.defineProperty(element, "id", {
    //     get: function() {
    //       devtools = true;
    //       window.location.href = "https://viet69.cl/";
    //     }
    //   });
    //   console.log(element);
    //   console.clear();
    //   if (devtools) {
    //     clearInterval(checkDevTools);
    //     window.location.href = "https://viet69.cl/";
    //   }
    // }, 500);

    // Detect resize (DevTools thường làm thay đổi kích thước window)
    let lastWidth = window.innerWidth;
    let lastHeight = window.innerHeight;
    
    const checkResize = setInterval(() => {
      const currentWidth = window.innerWidth;
      const currentHeight = window.innerHeight;
      
      // Nếu thay đổi đột ngột (có thể do mở DevTools)
      if (Math.abs(currentWidth - lastWidth) > 200 || Math.abs(currentHeight - lastHeight) > 200) {
        // Chỉ redirect nếu không phải do resize window bình thường
        const timeSinceLastCheck = Date.now();
        if (timeSinceLastCheck - (window as any).lastResizeCheck < 100) {
          redirectToViet69();
        }
        (window as any).lastResizeCheck = timeSinceLastCheck;
      }
      
      lastWidth = currentWidth;
      lastHeight = currentHeight;
    }, 100);

    // Detect right click (context menu)
    const handleContextMenu = (e: MouseEvent) => {
      // Cho phép right click nhưng chặn Inspect Element
      // (không thể chặn hoàn toàn nhưng có thể làm khó)
    };

    // Detect DevTools bằng cách check debugger
    const detectDevTools = () => {
      const start = performance.now();
      debugger; // eslint-disable-line no-debugger
      const end = performance.now();
      if (end - start > 100) {
        // Nếu debugger bị pause (DevTools đang mở)
        redirectToViet69();
      }
    };

    // Detect DevTools bằng cách check console (method mạnh hơn)
    let devtoolsOpen = false;
    const checkConsole = setInterval(() => {
      const widthThreshold = window.outerWidth - window.innerWidth > 160;
      const heightThreshold = window.outerHeight - window.innerHeight > 160;
      
      if (widthThreshold || heightThreshold) {
        if (!devtoolsOpen) {
          devtoolsOpen = true;
          redirectToViet69();
        }
      } else {
        devtoolsOpen = false;
      }
    }, 500);

    const debuggerCheck = setInterval(() => {
      detectDevTools();
    }, 1000);

    window.addEventListener("keydown", handleKeyDown);
    document.addEventListener("contextmenu", handleContextMenu);

    // Cleanup
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("contextmenu", handleContextMenu);
      clearInterval(checkResize);
      clearInterval(debuggerCheck);
      clearInterval(checkConsole);
    };
  }, []);

  return null;
}

