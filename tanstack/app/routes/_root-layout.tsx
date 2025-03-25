import appCss from "../app.css?url";
import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Nav } from "./-nav";

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
  return (
    <div className="w-screen h-screen overflow-y-scroll flex flex-col">
      <Nav />
      <Outlet />
    </div>
  );
}
