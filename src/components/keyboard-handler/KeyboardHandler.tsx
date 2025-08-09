import { useEffect } from "react";
import { useHotkeys } from "reakeys";

interface KeyboardHandlerProps {
	onToggleSidebar: () => void;
	onOpenCommand: () => void;
}

export function KeyboardHandler({
	onToggleSidebar,
	onOpenCommand,
}: KeyboardHandlerProps) {
	// Keep reakeys for sidebar since it's working
	useHotkeys([
		{
			name: "Toggle Sidebar",
			keys: "MOD+B",
			callback: (e) => {
				e?.preventDefault();
				onToggleSidebar();
			},
		},
	]);

	// Add manual binding for command palette
	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if ((e.metaKey || e.ctrlKey) && e.key === "k") {
				e.preventDefault();
				onOpenCommand();
			}
		};

		window.addEventListener("keydown", handleKeyDown, true);
		
		return () => {
			window.removeEventListener("keydown", handleKeyDown, true);
		};
	}, [onOpenCommand]);

	return null;
}
