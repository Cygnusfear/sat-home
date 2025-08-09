import { LuChevronsLeft } from "react-icons/lu";
import { Link, useParams } from "react-router";
import { cn } from "src/lib/utils";
import type { Config, SanitizedService } from "../../../shared/types/config";

interface SidebarProps {
	services: SanitizedService[];
	app: Config["app"];
	collapsed?: boolean;
	onToggleCollapsed?: () => void;
}

export function Sidebar({
	services,
	app,
	collapsed = false,
	onToggleCollapsed,
}: SidebarProps) {
	const params = useParams();
	const currentServiceId = params.serviceId;

	const sortedServices = [...services].sort((a, b) => {
		if (a.order !== undefined && b.order !== undefined) {
			return a.order - b.order;
		}
		return a.name.localeCompare(b.name);
	});

	return (
		<>
			<aside
				className={cn(
					"fixed left-0 bottom-0 h-11 bg-black/10 z-100 rounded-tr-xl transition-all duration-300 hover:bg-black opacity-5 hover:opacity-100",
					!collapsed ? "w-0 -translate-x-full" : "w-11",
				)}
				data-collapsed={collapsed}
			>
				<Link
					key={"bar"}
					to={`#`}
					className={cn(
						"flex items-center justify-center p-2 rounded-lg text-gray-300 transition-colors",
					)}
					title={"Toggle Sidebar"}
					onClick={onToggleCollapsed}
				>
					<img
						src={app.icon}
						className="h-6 w-6 flex-shrink-0"
						alt={"Toggle Sidebar"}
					/>
				</Link>
			</aside>
			<aside
				className={cn(
					"fixed left-0 top-0 h-full bg-black border-r border-gray-800/10 overflow-y-auto transition-all duration-300",
					collapsed ? "w-0 -translate-x-full" : "w-12",
				)}
				data-collapsed={collapsed}
			>
				<nav className="flex flex-col gap-1 p-1 h-full -mb-2 overflow-hidden">
					{sortedServices.map((service) => {
						const ServiceIcon = () =>
							service.icon &&
							(service.icon.startsWith("/") ||
							service.icon.startsWith("http") ? (
								<img
									src={service.icon}
									className="h-6 w-6 flex-shrink-0"
									alt={service.name}
								/>
							) : (
								<span className="text-2xl flex-shrink-0">{service.icon}</span>
							));
						return (
							<Link
								key={service.id}
								to={
									service.openInNewTab ? service.url : `/service/${service.id}`
								}
								target={service.openInNewTab ? "_blank" : "_self"}
								className={cn(
									"flex items-center justify-center p-2 rounded-lg text-gray-300 transition-colors brightness-75 hover:brightness-125",
									currentServiceId === service.id && "bg-gray-800 text-white",
								)}
								title={service.name}
							>
								<ServiceIcon />
							</Link>
						);
					})}
					<div className="flex-grow" />
					<Link
						key={"bar"}
						to={`#`}
						className={cn(
							"flex items-center justify-center p-2 rounded-lg text-gray-300 transition-colors",
						)}
						title={"Toggle Sidebar"}
						onClick={onToggleCollapsed}
					>
						<LuChevronsLeft
							className="h-4 w-4 flex-shrink-0"
							title={"Toggle Sidebar"}
						/>
					</Link>
				</nav>
			</aside>
		</>
	);
}
