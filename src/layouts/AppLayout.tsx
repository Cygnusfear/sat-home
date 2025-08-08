import { useEffect, useState } from "react";
import { Outlet } from "react-router";
import type { Config, SanitizedService } from "../../shared/types/config";
import { Sidebar } from "../components/sidebar/Sidebar";

interface SanitizedConfig {
	app: Config["app"];
	services: SanitizedService[];
}

export default function AppLayout() {
	console.log("AppLayout component rendering!");
	const [config, setConfig] = useState<SanitizedConfig | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

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
					<div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
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
		<div className="flex h-screen bg-gray-950">
			<Sidebar services={config.services} app={config.app} />
			<main className="flex-1 ml-64">
				<Outlet context={{ config }} />
			</main>
		</div>
	);
}
