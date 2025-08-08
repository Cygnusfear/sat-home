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
	
	// App routes with layout
	layout("./layouts/AppLayout.tsx", [
		index("./routes/dashboard.tsx"),
		route("service/:id", "./routes/service.$id.tsx"),
	]),
] satisfies RouteConfig;
