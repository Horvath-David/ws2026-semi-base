import {
  isRouteErrorResponse,
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
  useHref,
  useNavigate,
} from "react-router";

import { Button, HeroUIProvider, Input } from "@heroui/react";
import type { Route } from "./+types/root";
import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState } from "react";

export const links: Route.LinksFunction = () => [
  { rel: "preconnect", href: "https://fonts.googleapis.com" },
  {
    rel: "preconnect",
    href: "https://fonts.gstatic.com",
    crossOrigin: "anonymous",
  },
  {
    rel: "stylesheet",
    href: "https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap",
  },
];

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body className="dark text-foreground bg-background">
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

const queryClient = new QueryClient();

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  const navigate = useNavigate();

  const [error, setError] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider
        className="h-[100dvh] flex flex-col overflow-y-auto"
        navigate={navigate}
        useHref={useHref}
      >
        {isLoggedIn ? (
          <Outlet />
        ) : (
          <>
            <div className="w-[100dvw] h-[100dvh] flex flex-col gap-6 items-center justify-center">
              <h1 className="text-2xl font-semibold">Please log in</h1>
              <Input
                label="Username"
                className="w-md"
                value={username}
                onValueChange={setUsername}
              />
              <Input
                label="Password"
                className="w-md"
                value={password}
                onValueChange={setPassword}
              />
              <Button
                className="w-md"
                color="primary"
                onPress={async () => {
                  const res = await fetch(
                    "http://authentication.skills.local/authentication/login",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({
                        username,
                        password,
                      }),
                    }
                  );
                  if (!res.ok) {
                    setError("failed to log in");
                    return;
                  }
                  setIsLoggedIn(true);
                }}
              >
                Log in
              </Button>
              <span className="w-md text-center">{error}</span>
            </div>
          </>
        )}
      </HeroUIProvider>
    </QueryClientProvider>
  );
}

export function ErrorBoundary({ error }: Route.ErrorBoundaryProps) {
  let message = "Oops!";
  let details = "An unexpected error occurred.";
  let stack: string | undefined;

  if (isRouteErrorResponse(error)) {
    message = error.status === 404 ? "404" : "Error";
    details =
      error.status === 404
        ? "The requested page could not be found."
        : error.statusText || details;
  } else if (import.meta.env.DEV && error && error instanceof Error) {
    details = error.message;
    stack = error.stack;
  }

  return (
    <main className="pt-16 p-4 container mx-auto">
      <h1>{message}</h1>
      <p>{details}</p>
      {stack && (
        <pre className="w-full p-4 overflow-x-auto">
          <code>{stack}</code>
        </pre>
      )}
    </main>
  );
}
