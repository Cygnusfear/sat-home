import type { LoaderFunctionArgs } from "react-router";

// Catch WebSocket requests
export async function loader({ params, request }: LoaderFunctionArgs) {
  console.log("WebSocket request intercepted:", request.url);
  return new Response("WebSocket connections not supported through this proxy", { 
    status: 404 
  });
}