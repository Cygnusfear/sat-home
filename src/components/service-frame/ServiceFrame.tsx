import { useCallback, useEffect, useRef, useState } from "react";

interface ServiceFrameProps {
	serviceId: string;
	serviceName: string;
	serviceUrl: string;
	useProxy?: boolean;
	onCommandOpen: () => void;
	onSidebarOpen: () => void;
}

export function ServiceFrame({
	serviceId,
	serviceName,
	serviceUrl,
	useProxy = false,
	onCommandOpen,
	onSidebarOpen,
}: ServiceFrameProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Use proxy URL if configured, otherwise direct URL
	const iframeUrl = useProxy ? `/api/proxy/${serviceId}/` : serviceUrl;

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			const isMod = e.metaKey || e.ctrlKey;
			if (isMod && e.key === "k") {
				e.preventDefault();
				e.stopPropagation();
				onCommandOpen();

				// Blur iframe if it has focus
				const activeElement = document.activeElement;
				if (activeElement?.tagName === "IFRAME") {
					(activeElement as HTMLIFrameElement).blur();
				}
			} else if (isMod && e.key === "b") {
				e.preventDefault();
				e.stopPropagation();
				onSidebarOpen();
			}
		},
		[onCommandOpen, onSidebarOpen],
	);

	// Setup keyboard listener on main document
	useEffect(() => {
		document.addEventListener("keydown", handleKeyDown);
		
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [handleKeyDown]);

	// Listen for messages from iframes (for Traefik-injected script)
	useEffect(() => {
		const handleMessage = (event: MessageEvent) => {
			// Validate the message
			if (event.data?.type === "keyboard-shortcut") {
				const { key, metaKey, ctrlKey } = event.data;
				const isMod = metaKey || ctrlKey;
				
				if (isMod && key === "k") {
					onCommandOpen();
					// Blur iframe
					if (iframeRef.current) {
						iframeRef.current.blur();
					}
				} else if (isMod && key === "b") {
					onSidebarOpen();
				}
			}
		};

		window.addEventListener("message", handleMessage);
		return () => {
			window.removeEventListener("message", handleMessage);
		};
	}, [onCommandOpen, onSidebarOpen]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <trigger on serviceId only>
	useEffect(() => {
		setLoading(true);
		setError(null);
	}, [serviceId]);

	const handleLoad = () => {
		setLoading(false);
	};

	const handleError = () => {
		setLoading(false);
		setError(`Failed to load ${serviceName}`);
	};

	return (
		<div className="relative w-full h-full">
			{loading && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-900">
					<div className="text-center">
						<div className="inline-block animate-spin rounded-full h-12 w-12"></div>
						<p className="mt-4 text-gray-400">Loading {serviceName}...</p>
					</div>
				</div>
			)}

			{error && (
				<div className="absolute inset-0 flex items-center justify-center bg-gray-900">
					<div className="text-center">
						<div className="text-4xl mb-4">⚠️</div>
						<p className="text-red-400">{error}</p>
						<button
							onClick={() => {
								setError(null);
								setLoading(true);
								if (iframeRef.current) {
									iframeRef.current.src = iframeUrl;
								}
							}}
							type="button"
							className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						>
							Retry
						</button>
					</div>
				</div>
			)}

			<iframe
				ref={iframeRef}
				src={iframeUrl}
				className={`w-full h-full border-0 ${loading || error ? "invisible" : ""}`}
				onLoad={handleLoad}
				onError={handleError}
				title={serviceName}
				// Remove sandbox to allow all features
				allow="fullscreen"
			/>
		</div>
	);
}
