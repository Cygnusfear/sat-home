import type { LoaderFunctionArgs, ActionFunctionArgs } from "react-router";

// This catches direct API calls from iframes and returns 404
// The iframe content should be rewritten to use proxy paths instead
export async function loader({ params, request }: LoaderFunctionArgs) {
  console.log("Direct API call intercepted:", request.url);
  return new Response("Not Found - API calls should go through proxy", { 
    status: 404 
  });
}

export async function action({ params, request }: ActionFunctionArgs) {
  console.log("Direct API POST intercepted:", request.url);
  return new Response("Not Found - API calls should go through proxy", { 
    status: 404 
  });
}