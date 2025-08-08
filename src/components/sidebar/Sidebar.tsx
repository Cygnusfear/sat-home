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
				<Link
					to="/"
					className={cn(
						`flex items-center gap-3 px-3 py-2 rounded-lg text-gray-300 hover:bg-gray-800 hover:text-white transition-colors`,
						!currentServiceId && "bg-gray-800 text-white",
						"group-data-[minimized=true]/root:hidden",
					)}
				>
					<img src={app.icon} className="h-6 w-6" alt={app.title} />
					<span>Dashboard</span>
				</Link>

				{sortedServices.map((service) => (
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
				))}
			</nav>
		</aside>
	);
}
