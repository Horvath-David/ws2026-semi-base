import appCss from "../app.css?url";
import { createFileRoute, Outlet, useLocation } from "@tanstack/react-router";
import { Nav } from "./-nav";
import { Button, Divider, Link } from "@heroui/react";
import { LuEarth } from "react-icons/lu";

export const Route = createFileRoute("/_root-layout")({
  head: () => ({
    links: [
      {
        rel: "stylesheet",
        href: appCss,
        suppressHydrationWarning: true,
      },
    ],
  }),
  component: RootLayout,
});

function RootLayout() {
  const location = useLocation();

  return (
    <div className="w-[100dvw] h-[100dvh] bg-content1 overflow-hidden flex">
      <nav className="p-3 w-full max-w-1/6 flex flex-col gap-4 items-center justify-start h-full">
        <Link href={"/"}>
          <LuEarth size={24} />
          <span className="ml-4 text-lg font-semibold">WS 2026</span>
        </Link>
        <Divider orientation="horizontal" />
        <Button
          as={Link}
          className="w-full"
          variant={location.pathname === "/" ? "flat" : "bordered"}
          href="/"
        >
          Home
        </Button>
      </nav>

      <div className="w-full h-full p-3 pl-0">
        <div className="bg-background rounded-xl shadow-lg w-full h-full">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
