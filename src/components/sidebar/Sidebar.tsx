import { Link, useParams } from "react-router";
import { cn } from "src/lib/utils";
import type { Config, SanitizedService } from "../../../shared/types/config";

interface SidebarProps {
	services: SanitizedService[];
	app: Config["app"];
}

export function Sidebar({ services, app }: SidebarProps) {
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
			className="fixed left-0 top-0 h-full max-w-13 bg-black border-r border-gray-800/10 overflow-y-auto group/root"
			data-minimized={"true"}
		>
			<nav className="flex flex-col gap-1 p-1">
				{sortedServices.map((service) => {
					if (service.openInNewTab) {
						// For services that open in new tab, use an anchor tag
						return (
							<a
								key={service.id}
								href={`/api/proxy/${service.id}/`}
								target="_blank"
								rel="noopener noreferrer"
								className={cn(
									`flex m-2 gap-4 rounded-lg text-gray-300 transition-colors items-center justify-center hover:brightness-110`,
									currentServiceId === service.id && "bg-gray-800 text-white",
								)}
							>
								<img src={service.icon} className="h-6 w-6" alt={service.name} />
								<div className="flex-1 min-w-0 group-data-[minimized=true]/root:hidden">
									<div className="truncate">{service.name}</div>
									{service.description && (
										<div className="text-xs text-gray-500 truncate">
											{service.description}
										</div>
									)}
								</div>
							</a>
						);
					}
					
					// Default behavior - open in iframe
					return (
						<Link
							key={service.id}
							to={`/service/${service.id}`}
							className={cn(
								`flex m-2 gap-4 rounded-lg text-gray-300 transition-colors items-center justify-center hover:brightness-110`,
								currentServiceId === service.id && "bg-gray-800 text-white",
							)}
						>
							<img src={service.icon} className="h-6 w-6" alt={service.name} />
							<div className="flex-1 min-w-0 group-data-[minimized=true]/root:hidden">
								<div className="truncate">{service.name}</div>
								{service.description && (
									<div className="text-xs text-gray-500 truncate">
										{service.description}
									</div>
								)}
							</div>
						</Link>
					);
				})}
			</nav>
		</aside>
	);
}
