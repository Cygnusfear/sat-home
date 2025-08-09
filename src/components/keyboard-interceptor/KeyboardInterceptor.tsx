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
      } else if (isMod && e.key === "b") {
        e.preventDefault();
        e.stopPropagation();
        onToggleSidebar();
      }
    };

    // Listen at the highest level with capture
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("keydown", handleKeyDown, true);

    // Listen for messages from iframes
    const handleMessage = (e: MessageEvent) => {
      if (e.data?.type === "keyboard-shortcut") {
        if (e.data.key === "k") {
          onOpenCommand();
        } else if (e.data.key === "b") {
          onToggleSidebar();
        }
      }
    };

    window.addEventListener("message", handleMessage);

    return () => {
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("message", handleMessage);
    };
  }, [onOpenCommand, onToggleSidebar]);

  return <>{children}</>;
}