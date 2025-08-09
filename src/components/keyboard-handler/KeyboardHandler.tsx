import { useHotkeys } from "reakeys";
import { useEffect } from "react";

interface KeyboardHandlerProps {
	onToggleSidebar: () => void;
	onOpenCommand: () => void;
}

export function KeyboardHandler({ onToggleSidebar, onOpenCommand }: KeyboardHandlerProps) {
	// Use reakeys for robust keyboard handling
	useHotkeys([
		{
			name: "Toggle Sidebar",
			keys: "cmd+b",
			callback: (e) => {
				e?.preventDefault();
				onToggleSidebar();
			},
		},
		{
			name: "Open Command Palette",
			keys: "cmd+k",
			callback: (e) => {
				e?.preventDefault();
				onOpenCommand();
			},
		},
		// Also support ctrl for non-Mac users
		{
			name: "Toggle Sidebar (Ctrl)",
			keys: "ctrl+b",
			callback: (e) => {
				e?.preventDefault();
				onToggleSidebar();
			},
		},
		{
			name: "Open Command Palette (Ctrl)",
			keys: "ctrl+k",
			callback: (e) => {
				e?.preventDefault();
				onOpenCommand();
			},
		},
	]);

	// Prevent default browser behavior for these shortcuts
	useEffect(() => {
		const preventDefaults = (e: KeyboardEvent) => {
			// Check for Cmd+K or Ctrl+K
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
			}
			// Check for Cmd+B or Ctrl+B
			if ((e.metaKey || e.ctrlKey) && e.key === "b") {
				e.preventDefault();
			}
		};

		// Add to window to catch before any other handlers
		window.addEventListener("keydown", preventDefaults, true);
		
		return () => {
			window.removeEventListener("keydown", preventDefaults, true);
		};
	}, []);

	return null;
}