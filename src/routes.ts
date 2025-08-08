import {
	index,
	layout,
	type RouteConfig,
	route,
} from "@react-router/dev/routes";

export default [
	layout("./layouts/AppLayout.tsx", [
		index("./routes/dashboard.tsx"),
		route("service/:id", "./routes/service.$id.tsx"),
	]),
] satisfies RouteConfig;
