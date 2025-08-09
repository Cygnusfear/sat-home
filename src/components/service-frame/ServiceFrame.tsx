import { useEffect, useRef, useState } from "react";

interface ServiceFrameProps {
	serviceId: string;
	serviceName: string;
	serviceUrl: string;
	useProxy?: boolean;
	onKeyboardShortcut?: (key: string, metaKey: boolean) => void;
}

export function ServiceFrame({
	serviceId,
	serviceName,
	serviceUrl,
	useProxy = false,
	onKeyboardShortcut,
}: ServiceFrameProps) {
	const iframeRef = useRef<HTMLIFrameElement>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	// Use proxy URL if configured, otherwise direct URL
	const iframeUrl = useProxy ? `/api/proxy/${serviceId}/` : serviceUrl;

	// biome-ignore lint/correctness/useExhaustiveDependencies: <trigger on serviceId only>
	useEffect(() => {
		setLoading(true);
		setError(null);
	}, [serviceId]);

	useEffect(() => {
		const iframe = iframeRef.current;
		if (!iframe) return;

		// Try to inject a script into the iframe to capture keyboard events
		const handleIframeLoad = () => {
			try {
				// This will only work for same-origin iframes
				const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document;
				if (iframeDoc) {
					const script = iframeDoc.createElement("script");
					script.textContent = `
						document.addEventListener('keydown', function(e) {
							if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'b')) {
								e.preventDefault();
								// Send message to parent
								parent.postMessage({
									type: 'keyboard-shortcut',
									key: e.key,
									metaKey: e.metaKey || e.ctrlKey
								}, '*');
							}
						}, true);
					`;
					iframeDoc.body.appendChild(script);
				}
			} catch (e) {
				// Cross-origin iframe, can't inject script
				console.log("Cannot inject script into cross-origin iframe");
			}
		};

		iframe.addEventListener("load", handleIframeLoad);
		
		return () => {
			iframe.removeEventListener("load", handleIframeLoad);
		};
	}, []);

	// Listen for messages from iframe
	useEffect(() => {
		const handleMessage = (e: MessageEvent) => {
			if (e.data?.type === "keyboard-shortcut" && onKeyboardShortcut) {
				onKeyboardShortcut(e.data.key, e.data.metaKey);
			}
		};

		window.addEventListener("message", handleMessage);
		return () => window.removeEventListener("message", handleMessage);
	}, [onKeyboardShortcut]);

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