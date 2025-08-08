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

	return (
		<div className="p-8">
			<h1 className="text-3xl font-bold text-white mb-8">
				Welcome to {config.app.title}
			</h1>

			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
				{config.services.map((service) => (
					<a
						key={service.id}
						href={`/service/${service.id}`}
						className="block p-6 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
					>
						<div className="flex items-center gap-4 mb-3">
							<span className="text-3xl">{service.icon || "📦"}</span>
							<h2 className="text-xl font-semibold text-white">
								{service.name}
							</h2>
						</div>
						{service.description && (
							<p className="text-gray-400">{service.description}</p>
						)}
						{service.tags && service.tags.length > 0 && (
							<div className="flex gap-2 mt-3">
								{service.tags.map((tag) => (
									<span
										key={tag}
										className="px-2 py-1 text-xs bg-gray-700 text-gray-300 rounded"
									>
										{tag}
									</span>
								))}
							</div>
						)}
					</a>
				))}
			</div>

			{config.services.length === 0 && (
				<div className="text-center py-12">
					<div className="text-4xl mb-4">📦</div>
					<p className="text-gray-400">No services configured yet</p>
					<p className="text-gray-500 mt-2">Edit config.json to add services</p>
				</div>
			)}
		</div>
	);
}
