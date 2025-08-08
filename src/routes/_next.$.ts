import type { LoaderFunctionArgs } from "react-router";

// Catch Next.js static files that should go through proxy
export async function loader({ params, request }: LoaderFunctionArgs) {
  console.log("Next.js static file intercepted:", request.url);
  return new Response("Not Found - Static files should go through proxy", { 
    status: 404 
  });
}