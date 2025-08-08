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
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
			</div>
		);
	}

	const { config } = context;

	return <div className="p-8"></div>;
}
