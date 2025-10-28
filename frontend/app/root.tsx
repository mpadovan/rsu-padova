import type { LinksFunction, LoaderFunctionArgs, MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  Links,
  LiveReload,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useLoaderData,
  useRouteError,
  isRouteErrorResponse,
  useRouteLoaderData
} from "@remix-run/react";
import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import tailwindStylesheetUrl from "~/styles/tailwind.css?url";

type Env = {
  firebaseApiKey: string;
  firebaseAuthDomain: string;
  firebaseProjectId: string;
  firebaseAppId: string;
  allowedGoogleDomains: string[];
  apiBaseUrl: string;
};

export type RootContext = Env;

export const links: LinksFunction = () => [
  { rel: "stylesheet", href: tailwindStylesheetUrl },
  { rel: "manifest", href: "/manifest.webmanifest" },
  { rel: "icon", href: "/icons/icon.svg" }
];

export const meta: MetaFunction = () => [{ title: "RSU Padova Dashboard" }];

export async function loader({ context }: LoaderFunctionArgs) {
  const env = (context as { env?: Partial<Env> } | undefined)?.env ?? {};
  return json<Env>({
    firebaseApiKey: env.firebaseApiKey ?? process.env.FIREBASE_API_KEY ?? "",
    firebaseAuthDomain: env.firebaseAuthDomain ?? process.env.FIREBASE_AUTH_DOMAIN ?? "",
    firebaseProjectId: env.firebaseProjectId ?? process.env.FIREBASE_PROJECT_ID ?? "",
    firebaseAppId: env.firebaseAppId ?? process.env.FIREBASE_APP_ID ?? "",
    allowedGoogleDomains: env.allowedGoogleDomains ?? (process.env.ALLOWED_GOOGLE_DOMAINS?.split(",") ?? []),
    apiBaseUrl: env.apiBaseUrl ?? process.env.BACKEND_API_BASE_URL ?? "http://localhost:3000"
  });
}

export function useRootContext() {
  const data = useRouteLoaderData<typeof loader>("root");
  if (!data) {
    throw new Error("Root context non disponibile");
  }
  return data;
}

export default function App() {
  const env = useLoaderData<typeof loader>();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 30,
            refetchOnWindowFocus: false
          }
        }
      })
  );

  return (
    <html lang="en" className="bg-slate-950 text-slate-100">
      <head>
        <Meta />
        <Links />
      </head>
      <body>
        <QueryClientProvider client={queryClient}>
          <Outlet />
        </QueryClientProvider>
        <ScrollRestoration />
        <Scripts />
        <script
          dangerouslySetInnerHTML={{
            __html: `window.ENV = ${JSON.stringify(env)};`
          }}
        />
        <LiveReload />
      </body>
    </html>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();
  const message = isRouteErrorResponse(error)
    ? `${error.status} ${error.statusText}`
    : error instanceof Error
    ? error.message
    : "Unknown error";

  return (
    <html lang="en">
      <head>
        <Meta />
        <Links />
        <title>Errore</title>
      </head>
      <body className="bg-rose-950 text-rose-50">
        <main className="container mx-auto py-12">
          <h1 className="text-3xl font-semibold">Qualcosa è andato storto</h1>
          <p className="mt-4 text-lg">{message}</p>
        </main>
        <Scripts />
      </body>
    </html>
  );
}
