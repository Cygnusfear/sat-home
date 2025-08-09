import { Command } from "cmdk";
import * as React from "react";
import { useNavigate } from "react-router";
import type { Config, SanitizedService } from "shared/types/config";
import "../assets/command.css";

interface CommandMenuProps {
	config: Config;
	open?: boolean;
	onOpenChange?: (open: boolean) => void;
}

const CommandMenu = ({ config, open: controlledOpen, onOpenChange }: CommandMenuProps) => {
	const [internalOpen, setInternalOpen] = React.useState(false);
	const navigate = useNavigate();
	
	// Use controlled or internal state
	const open = controlledOpen !== undefined ? controlledOpen : internalOpen;
	const setOpen = onOpenChange || setInternalOpen;

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
