import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	// API routes (no layout)
	route("api/config", "./routes/api/config.ts"),
	route("api/proxy/:serviceId/*", "./routes/api/proxy/$serviceId.$.ts"),
	// Catch-all for direct API calls from iframes (redirect to proxy)
	route("api/v1/*", "./routes/api/v1.$.ts"),
	route("websocket/*", "./routes/websocket.$.ts"),

	// App routes with layout
	layout("./layouts/AppLayout.tsx", [
		index("./routes/dashboard.tsx"),
		route("service/:id", "./routes/service.$id.tsx"),
	]),
] satisfies RouteConfig;
