import type { Route } from "./+types/api.config";

export async function loader({ request }: Route.LoaderArgs) {
  // Forward to the backend API
  const response = await fetch("http://localhost:3001/api/config", {
    method: "GET",
    headers: request.headers,
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}