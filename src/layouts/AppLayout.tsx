import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import CommandMenu from "src/components/command";
import type { Config, SanitizedService } from "../../shared/types/config";
import { KeyboardInterceptor } from "../components/keyboard-interceptor/KeyboardInterceptor";
import { ServiceManager } from "../components/service-manager/ServiceManager";
import { Sidebar } from "../components/sidebar/Sidebar";
import "../assets/command.css";

interface SanitizedConfig {
	app: Config["app"];
	services: SanitizedService[];
}

export default function AppLayout() {
	console.log("AppLayout component rendering!");
	const [config, setConfig] = useState<SanitizedConfig | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
	const [commandOpen, setCommandOpen] = useState(false);

	useEffect(() => {
		console.log("AppLayout useEffect running!");
		const controller = new AbortController();

		fetch("/api/config", {
			signal: controller.signal,
			headers: {
				"Content-Type": "application/json",
			},
		})
			.then((res) => {
				console.log("Got response:", res.status);
				if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
				return res.json();
			})
			.then((data) => {
				console.log("Config loaded:", data);
				setConfig(data);
				setLoading(false);
			})
			.catch((err) => {
				if (err.name !== "AbortError") {
					console.error("Failed to fetch config:", err);
					setError(err.message);
					setLoading(false);
				}
			});

		return () => controller.abort();
	}, []);

	if (loading) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-950">
				<div className="text-center">
					<div className="inline-block animate-spin rounded-full h-12 w-1w"></div>
					<p className="mt-4 text-gray-400">Loading configuration...</p>
				</div>
			</div>
		);
	}

	if (error || !config) {
		return (
			<div className="flex items-center justify-center h-screen bg-gray-950">
				<div className="text-center">
					<div className="text-4xl mb-4">❌</div>
					<p className="text-red-400">Failed to load configuration</p>
					<p className="text-gray-500 mt-2">{error}</p>
					<button
						onClick={() => window.location.reload()}
						className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
						type="button"
					>
						Retry
					</button>
				</div>
			</div>
		);
	}

	return (
		<KeyboardInterceptor
			onToggleSidebar={() => setSidebarCollapsed((prev) => !prev)}
			onOpenCommand={() => setCommandOpen((prev) => !prev)}
		>
			<div className="flex h-screen w-screen linear">
				<Sidebar
					services={config.services}
					app={config.app}
					collapsed={sidebarCollapsed}
					onToggleCollapsed={() => setSidebarCollapsed((prev) => !prev)}
				/>
				<main
					className={`flex-1 w-full transition-all duration-300 ${sidebarCollapsed ? "ml-0" : "ml-12"}`}
				>
					<Outlet context={{ config }} />
					<ServiceManager services={config.services} />
				</main>
			</div>
			<CommandMenu
				config={config}
				open={commandOpen}
				onOpenChange={setCommandOpen}
			/>
		</KeyboardInterceptor>
	);
}
