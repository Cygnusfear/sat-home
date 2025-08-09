import { Link, useParams } from "react-router";
import { cn } from "src/lib/utils";
import type { Config, SanitizedService } from "../../../shared/types/config";

interface SidebarProps {
	services: SanitizedService[];
	app: Config["app"];
	collapsed?: boolean;
}

export function Sidebar({ services, app, collapsed = false }: SidebarProps) {
	const params = useParams();
	const currentServiceId = params.serviceId;

	const sortedServices = [...services].sort((a, b) => {
		if (a.order !== undefined && b.order !== undefined) {
			return a.order - b.order;
		}
		return a.name.localeCompare(b.name);
	});

	return (
		<aside
			className={cn(
				"fixed left-0 top-0 h-full bg-black border-r border-gray-800/10 overflow-y-auto transition-all duration-300",
				collapsed ? "w-0 -translate-x-full" : "w-12"
			)}
			data-collapsed={collapsed}
		>
			<nav className="flex flex-col gap-1 p-1">
				{sortedServices.map((service) => {
					const ServiceIcon = () => (
						service.icon && (
							service.icon.startsWith("/") || service.icon.startsWith("http") ? (
								<img src={service.icon} className="h-6 w-6 flex-shrink-0" alt={service.name} />
							) : (
								<span className="text-2xl flex-shrink-0">{service.icon}</span>
							)
						)
					);

					if (service.openInNewTab) {
						// For services that open in new tab, use an anchor tag
						return (
							<a
								key={service.id}
								href={service.url}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									"flex items-center justify-center p-2 rounded-lg text-gray-300 transition-colors hover:bg-gray-800/50",
									currentServiceId === service.id && "bg-gray-800 text-white"
								)}
								title={service.name}
							>
								<ServiceIcon />
							</a>
						);
					}
					
					// Default behavior - open in iframe
					return (
						<Link
							key={service.id}
							to={`/service/${service.id}`}
							className={cn(
								"flex items-center justify-center p-2 rounded-lg text-gray-300 transition-colors hover:bg-gray-800/50",
								currentServiceId === service.id && "bg-gray-800 text-white"
							)}
							title={service.name}
						>
							<ServiceIcon />
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
