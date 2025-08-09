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
	const style = config.app.style || "raycast";

	const handleServiceSelect = (service: SanitizedService) => {
		onOpenChange(false);
		if (service.openInNewTab) {
			window.open(service.url, "_blank");
		} else {
			navigate(`/service/${service.id}`);
		}
	};

	// Style-specific attributes
	const getStyleAttributes = (type: string) => {
		switch (style) {
			case "raycast":
				if (type === "loader") return { "cmdk-raycast-loader": "" } as any;
				if (type === "meta") return { "cmdk-raycast-meta": "" } as any;
				if (type === "footer") return { "cmdk-raycast-footer": "" } as any;
				if (type === "trigger") return { "cmdk-raycast-open-trigger": "" } as any;
				break;
			case "vercel":
				if (type === "meta") return { "cmdk-vercel-badge": "" } as any;
				if (type === "shortcuts") return { "cmdk-vercel-shortcuts": "" } as any;
				break;
			case "linear":
				if (type === "meta") return { "cmdk-linear-badge": "" } as any;
				if (type === "shortcuts") return { "cmdk-linear-shortcuts": "" } as any;
				break;
			case "framer":
				if (type === "meta") return { "cmdk-framer-item-subtitle": "" } as any;
				if (type === "icon") return { "cmdk-framer-icon-wrapper": "" } as any;
				break;
		}
		return {};
	};

	// Render loader based on style
	const renderLoader = () => {
		if (style === "raycast") {
			return <hr {...getStyleAttributes("loader")} />;
		}
		return null;
	};

	// Render footer based on style
	const renderFooter = () => {
		if (style === "raycast") {
			return (
				<div
					{...getStyleAttributes("footer")}
					className="flex flex-row gap-2 justify-end"
				>
					<button {...getStyleAttributes("trigger")}>
						<kbd>↵</kbd>
						<span>Open</span>
					</button>
					<hr />
					<button {...getStyleAttributes("trigger")}>
						<kbd>↑</kbd>
						<kbd>↓</kbd>
						<span>Navigate</span>
					</button>
				</div>
			);
		} else if (style === "vercel" || style === "linear") {
			// These styles don't have a footer
			return null;
		} else if (style === "framer") {
			// Framer has a different structure
			return null;
		}
		return null;
	};

	// Render tags/meta based on style
	const renderMeta = (service: SanitizedService) => {
		if (!service.tags || service.tags.length === 0) return null;
		
		const tags = service.tags.join(", ").toLowerCase();
		
		if (style === "raycast") {
			return (
				<span {...getStyleAttributes("meta")}>
					{tags}
				</span>
			);
		} else if (style === "vercel") {
			// Vercel uses badges differently
			return (
				<div {...getStyleAttributes("shortcuts")}>
					<span {...getStyleAttributes("meta")}>
						{tags}
					</span>
				</div>
			);
		} else if (style === "linear") {
			// Linear has its own badge style
			return (
				<div {...getStyleAttributes("shortcuts")}>
					{tags}
				</div>
			);
		} else if (style === "framer") {
			// Framer uses subtitle
			return (
				<span {...getStyleAttributes("meta")}>
					{tags}
				</span>
			);
		}
		return <span>{tags}</span>;
	};

	// Render icon based on style
	const renderIcon = (service: SanitizedService) => {
		if (!service.icon) return null;

		const iconElement = (service.icon.startsWith("/") || service.icon.startsWith("http")) ? (
			<img
				src={service.icon}
				alt=""
				style={{ width: "18px", height: "18px" }}
			/>
		) : (
			<span>{service.icon}</span>
		);

		if (style === "framer") {
			// Framer wraps icons
			return (
				<div {...getStyleAttributes("icon")}>
					{iconElement}
				</div>
			);
		}
		
		return iconElement;
	};

	return (
		<Command.Dialog
			open={open}
			onOpenChange={onOpenChange}
			label="Global Command Menu"
		>
			<Command.Input autoFocus placeholder="Search services..." />
			{renderLoader()}
			<Command.List>
				<Command.Empty>No results found.</Command.Empty>

				<Command.Group heading="Services">
					{config.services.map((service) => {
						// Include tags in the searchable value
						const searchValue = [
							service.name,
							service.description || "",
							...(service.tags || []),
						].join(" ");

						return (
							<Command.Item
								key={service.id}
								value={searchValue}
								onSelect={() => handleServiceSelect(service)}
							>
								{renderIcon(service)}
								<span>{service.name}</span>
								{renderMeta(service)}
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
						{style === "raycast" && (
							<span {...getStyleAttributes("meta")}>
								return to dashboard
							</span>
						)}
					</Command.Item>
				</Command.Group>
			</Command.List>

			{renderFooter()}
		</Command.Dialog>
	);
};

export default CommandMenu;