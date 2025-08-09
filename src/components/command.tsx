import { Command } from "cmdk";
import * as React from "react";
import { useNavigate } from "react-router";
import type { Config, SanitizedService } from "shared/types/config";
import "../assets/command.css";

const CommandMenu = ({ config }: { config: Config }) => {
	const [open, setOpen] = React.useState(false);
	const navigate = useNavigate();

	// Toggle the menu when ⌘K is pressed
	React.useEffect(() => {
		const down = (e: KeyboardEvent) => {
			if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
				e.preventDefault();
				setOpen((open) => !open);
			}
		};

		document.addEventListener("keydown", down);
		return () => document.removeEventListener("keydown", down);
	}, []);

	const handleServiceSelect = (service: SanitizedService) => {
		setOpen(false);
		if (service.openInNewTab) {
			window.open(service.url, "_blank");
		} else {
			navigate(`/service/${service.id}`);
		}
	};

	return (
		<Command.Dialog
			open={open}
			onOpenChange={setOpen}
			label="Global Command Menu"
			className="min-w-140"
		>
			<div {...({ "cmdk-raycast-top-shine": "" } as any)} />
			<Command.Input autoFocus placeholder="Search services..." />
			<hr {...({ "cmdk-raycast-loader": "" } as any)} />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>

				<Command.Group heading="Services">
					{config.services.map((service) => (
						<Command.Item
							key={service.id}
							value={`${service.name} ${service.description || ""}`}
							onSelect={() => handleServiceSelect(service)}
						>
							{service.icon &&
								(service.icon.startsWith("/") ||
								service.icon.startsWith("http") ? (
									<img
										src={service.icon}
										alt=""
										style={{ width: "18px", height: "18px" }}
									/>
								) : (
									<span>{service.icon}</span>
								))}
							<span>{service.name}</span>
							{service.description && (
								<span {...({ "cmdk-raycast-meta": "" } as any)}>
									{service.description}
								</span>
							)}
						</Command.Item>
					))}
				</Command.Group>

				<Command.Separator />

				<Command.Group heading="Actions">
					<Command.Item
						value="home dashboard"
						onSelect={() => {
							setOpen(false);
							navigate("/");
						}}
					>
						<span>🏠</span>
						<span>Go Home</span>
						<span {...({ "cmdk-raycast-meta": "" } as any)}>
							Return to dashboard
						</span>
					</Command.Item>
				</Command.Group>
			</Command.List>

			<div {...({ "cmdk-raycast-footer": "" } as any)}>
				<button {...({ "cmdk-raycast-open-trigger": "" } as any)}>
					<kbd>↵</kbd>
					<span>Open</span>
				</button>

				<hr />
				<button {...({ "cmdk-raycast-open-trigger": "" } as any)}>
					<kbd>↑</kbd>
					<kbd>↓</kbd>
					<span>Navigate</span>
				</button>
			</div>
		</Command.Dialog>
	);
};

export default CommandMenu;
