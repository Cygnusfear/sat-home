import { useOutletContext, useParams } from "react-router";
import type { Config, SanitizedService } from "../../shared/types/config";
import { ServiceFrame } from "../components/service-frame/ServiceFrame";
import type { Route } from "./+types/service.$id";

interface ContextType {
	config: {
		app: Config["app"];
		services: SanitizedService[];
	};
}

export function meta(_: Route.MetaArgs) {
	const { id } = useParams();
	const title = id
		? `⛩️ ${id?.substring(0, 1).toUpperCase() + id.substring(1)}`
		: "Satsang";
	return [{ title }];
}

export default function ServicePage() {
	const { id } = useParams();
	const context = useOutletContext<ContextType>();

	if (!context || !context.config) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
			</div>
		);
	}

	const { config } = context;

	const service = config.services.find((s) => s.id === id);

	if (!service) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<div className="text-4xl mb-4">❓</div>
					<p className="text-gray-400">Service not found</p>
				</div>
			</div>
		);
	}

	// If service is configured to open in new tab, show a message
	if (service.openInNewTab) {
		return (
			<div className="flex items-center justify-center h-full">
				<div className="text-center">
					<div className="text-6xl mb-4">🚀</div>
					<p className="text-gray-300 text-lg mb-2">{service.name} opens in a new tab</p>
					<p className="text-gray-500">Click the sidebar link to open</p>
				</div>
			</div>
		);
	}

	return <ServiceFrame serviceId={service.id} serviceName={service.name} serviceUrl={service.url} />;
}
