import { useEffect } from "react";

interface KeyboardInterceptorProps {
  onToggleSidebar: () => void;
  onOpenCommand: () => void;
  children: React.ReactNode;
}

export function KeyboardInterceptor({
  onToggleSidebar,
  onOpenCommand,
  children,
}: KeyboardInterceptorProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isMod = e.metaKey || e.ctrlKey;
      
      if (isMod && e.key === "k") {
        e.preventDefault();
        e.stopPropagation();
        onOpenCommand();
        
        // Blur iframe if it has focus
        const activeElement = document.activeElement;
        if (activeElement?.tagName === "IFRAME") {
          (activeElement as HTMLIFrameElement).blur();
        }
      } else if (isMod && e.key === "b") {
        e.preventDefault();
        e.stopPropagation();
        onToggleSidebar();
      }
    };

    // Add listener at the document level with capture
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keydown", handleKeyDown, true);

    // Focus trap that periodically steals focus from iframe
    const focusInterval = setInterval(() => {
      const activeElement = document.activeElement;
      if (activeElement?.tagName === "IFRAME") {
        // Create a temporary invisible input to capture keyboard events
        const trap = document.createElement("input");
        trap.style.position = "fixed";
        trap.style.top = "-9999px";
        trap.style.left = "-9999px";
        trap.style.width = "1px";
        trap.style.height = "1px";
        trap.style.opacity = "0";
        trap.style.pointerEvents = "none";
        trap.tabIndex = -1;
        
        document.body.appendChild(trap);
        
        // Add keyboard listener to the trap
        trap.addEventListener("keydown", (e) => {
          const isMod = e.metaKey || e.ctrlKey;
          if ((isMod && e.key === "k") || (isMod && e.key === "b")) {
            handleKeyDown(e as KeyboardEvent);
          }
        });
        
        // Focus the trap briefly to capture events
        trap.focus();
        
        // Refocus the iframe and remove trap after a short delay
        setTimeout(() => {
          (activeElement as HTMLIFrameElement).focus();
          trap.remove();
        }, 50);
      }
    }, 100);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      clearInterval(focusInterval);
    };
  }, [onOpenCommand, onToggleSidebar]);

  return <>{children}</>;
}