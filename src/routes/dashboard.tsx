import { useOutletContext } from "react-router";
import type { Config, SanitizedService } from "../../shared/types/config";

interface ContextType {
	config: {
		app: Config["app"];
		services: SanitizedService[];
	};
}

export default function Dashboard() {
	const context = useOutletContext<ContextType>();

	console.log("Dashboard component rendering!");

	if (!context || !context.config) {
		return (
			<div className="flex items-center justify-center h-screen">
				<div className="animate-spin rounded-full h-12 w-12"></div>
			</div>
		);
	}

	const { config } = context;

	return (
		<div className="flex items-center justify-center h-full">
			<div className="text-center">
				<div className="text-8xl mb-4">⛩️</div>
				<h1 className="text-4xl font-bold text-gray-100 mb-2">{config.app.title}</h1>
				<p className="text-gray-400">Select a service from the sidebar or press ⌘K to search</p>
			</div>
		</div>
	);
}
