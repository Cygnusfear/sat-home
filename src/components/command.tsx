"use client";

import { Command } from "cmdk";
import type { Config } from "shared/types/config";
import "../assets/command.css";
import React from "react";

const CommandMenu = ({ config }: { config: Config }) => {
	const [open, setOpen] = React.useState(false);

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

	return (
		<Command.Dialog
			open={open}
			onOpenChange={setOpen}
			label="Global Command Menu"
		>
			<Command.Input />
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>
				<Command.Group heading="Letters">
					{config.services.map((service) => (
						<Command.Item key={service.id}>{service.name}</Command.Item>
					))}
				</Command.Group>
			</Command.List>
		</Command.Dialog>
	);
};

export default CommandMenu;
