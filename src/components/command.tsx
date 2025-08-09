import { Command } from "cmdk";
import * as React from "react";
import { useNavigate } from "react-router";
import type { Config, SanitizedService } from "shared/types/config";
import "../assets/command.css";

interface CommandMenuProps {
	config: Config;
	open: boolean;
	onOpenChange: (open: boolean) => void;
}

const CommandMenu = ({ config, open, onOpenChange }: CommandMenuProps) => {
	const navigate = useNavigate();

	console.log("CommandMenu render, open:", open);

	const handleServiceSelect = (service: SanitizedService) => {
		onOpenChange(false);
		if (service.openInNewTab) {
			window.open(service.url, "_blank");
		} else {
			navigate(`/service/${service.id}`);
		}
	};

	return (
		<Command.Dialog
			open={open}
			onOpenChange={onOpenChange}
			label="Global Command Menu"
		>
			<Command.Input autoFocus placeholder="Search services or tags..." />
			<hr {...({ "cmdk-raycast-loader": "" } as any)} />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>

				<Command.Group heading="Services">
					{config.services.map((service) => {
						// Include tags in the searchable value
						const searchValue = [
							service.name,
							service.description || "",
							...(service.tags || [])
						].join(" ");
						
						return (
							<Command.Item
								key={service.id}
								value={searchValue}
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
								{service.tags && service.tags.length > 0 && (
									<span {...({ "cmdk-raycast-meta": "" } as any)}>
										{service.tags.join(", ")}
									</span>
								)}
							</Command.Item>
						);
					})}
				</Command.Group>

				<Command.Separator />

				<Command.Group heading="Actions">
					<Command.Item
						value="home dashboard"
						onSelect={() => {
							onOpenChange(false);
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

			<div
				{...({ "cmdk-raycast-footer": "" } as any)}
				className="flex flex-row gap-2 justify-end"
			>
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
