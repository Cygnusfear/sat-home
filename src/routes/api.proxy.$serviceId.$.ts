import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

export async function loader({ params, request }: LoaderFunctionArgs) {
  const serviceId = params.serviceId;
  const path = params["*"] || "";
  
  // Forward to the backend API
  const url = new URL(request.url);
  const apiUrl = `http://localhost:3001/api/proxy/${serviceId}/${path}${url.search}`;
  
  const fetchOptions: RequestInit = {
    method: request.method,
    headers: request.headers,
  };
  
  // Only add body for methods that support it
  if (request.method !== "GET" && request.method !== "HEAD") {
    fetchOptions.body = await request.text();
  }
  
  const response = await fetch(apiUrl, fetchOptions);
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}

export async function action({ params, request }: ActionFunctionArgs) {
  const serviceId = params.serviceId;
  const path = params["*"] || "";
  
  // Forward to the backend API
  const url = new URL(request.url);
  const apiUrl = `http://localhost:3001/api/proxy/${serviceId}/${path}${url.search}`;
  
  const response = await fetch(apiUrl, {
    method: request.method,
    headers: request.headers,
    body: await request.text(),
  });
  
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}