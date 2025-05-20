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

import {
  addToast,
  Button,
  HeroUIProvider,
  Input,
  ToastProvider,
} from "@heroui/react";
import type { Route } from "./+types/root";
import "./app.css";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState, type FormEvent } from "react";
import { API_URL } from "./constants";

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
  const navigate = useNavigate();

  const [loggedIn, setLoggedIn] = useState(
    !!localStorage.getItem("accessToken")
  );

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    console.log(loggedIn);
  }, [loggedIn]);

  async function logIn(e: FormEvent) {
    e.preventDefault();
    setLoading(true);

    const res = await fetch(`${API_URL}/authentication/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      }),
    });
    if (!res.ok) {
      addToast({
        title: "Failed to log in",
        color: "danger",
      });
      setLoading(false);
      return;
    }
    const token = (await res.json()) as string;
    localStorage.setItem("accessToken", token);
    setLoggedIn(true);
    setLoading(false);
    addToast({
      title: "Logged in successfully",
      color: "success",
    });
  }

  return (
    <QueryClientProvider client={queryClient}>
      <HeroUIProvider
        className="h-[100dvh] w-full"
        navigate={navigate}
        useHref={useHref}
      >
        <ToastProvider />
        {loggedIn ? (
          <Outlet />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <form
              onSubmit={logIn}
              className="flex flex-col gap-4 p-12 items-center bg-content1 rounded-2xl w-full max-w-lg"
            >
              <h1 className="text-4xl font-semibold">Welcome back!</h1>
              <p className="mb-6">Please enter your credentials to log in</p>

              <Input
                label="Username"
                labelPlacement="outside"
                placeholder="Enter your username"
                value={username}
                onValueChange={setUsername}
              />

              <Input
                label="Password"
                labelPlacement="outside"
                placeholder="Enter your password"
                value={password}
                onValueChange={setPassword}
              />

              <Button
                type="submit"
                color="primary"
                className="w-full mt-6"
                isLoading={loading}
              >
                Sign in
              </Button>
            </form>
          </div>
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
