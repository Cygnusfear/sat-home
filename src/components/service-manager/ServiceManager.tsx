import { useState, useEffect } from "react";
import { useParams, useLocation } from "react-router";
import type { SanitizedService } from "../../../shared/types/config";
import { ServiceFrame } from "../service-frame/ServiceFrame";

interface ServiceManagerProps {
	services: SanitizedService[];
}

export function ServiceManager({ services }: ServiceManagerProps) {
	const params = useParams();
	const location = useLocation();
	const [loadedServices, setLoadedServices] = useState<Set<string>>(new Set());
	
	// Get the service ID from the URL
	const id = params.id || params['*'];

	// Track which services have been accessed
	useEffect(() => {
		if (id && !loadedServices.has(id)) {
			setLoadedServices(prev => new Set(prev).add(id));
		}
	}, [id, loadedServices]);

	// Only show on service routes
	const isServiceRoute = location.pathname.startsWith('/service/');
	if (!isServiceRoute) {
		return null;
	}

	// Filter out services that open in new tab
	const iframeServices = services.filter(s => !s.openInNewTab);

	return (
		<div className="relative w-full h-full">
			{iframeServices.map((service) => {
				const isActive = service.id === id;
				const hasBeenLoaded = loadedServices.has(service.id);
				
				// Only render the iframe if it's been accessed at least once
				if (!hasBeenLoaded && !isActive) {
					return null;
				}

				return (
					<div
						key={service.id}
						className={`absolute inset-0 w-full h-full ${
							isActive ? "block" : "hidden"
						}`}
					>
						<ServiceFrame
							serviceId={service.id}
							serviceName={service.name}
							serviceUrl={service.url}
							useProxy={service.useProxy}
						/>
					</div>
				);
			})}
			
			{/* Show message for new tab services */}
			{services.find(s => s.id === id && s.openInNewTab) && (
				<div className="flex items-center justify-center h-full">
					<div className="text-center">
						<div className="text-6xl mb-4">🚀</div>
						<p className="text-gray-300 text-lg mb-2">
							{services.find(s => s.id === id)?.name} opens in a new tab
						</p>
						<p className="text-gray-500">Click the sidebar link to open</p>
					</div>
				</div>
			)}
			
			{/* Show not found if service doesn't exist */}
			{id && !services.find(s => s.id === id) && (
				<div className="flex items-center justify-center h-full">
					<div className="text-center">
						<div className="text-4xl mb-4">❓</div>
						<p className="text-gray-400">Service not found</p>
					</div>
				</div>
			)}
		</div>
	);
}