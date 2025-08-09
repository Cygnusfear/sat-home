import { useParams } from "react-router";
import type { Route } from "./+types/service.$id";

export function meta(_: Route.MetaArgs) {
	const { id } = useParams();
	const title = id
		? `⛩️ ${id?.substring(0, 1).toUpperCase() + id.substring(1)}`
		: "Satsang";
	return [{ title }];
}

// ServiceManager in AppLayout handles all the rendering
export default function ServicePage() {
	// This component is now just a placeholder for routing
	// All iframe management happens in ServiceManager
	return null;
}