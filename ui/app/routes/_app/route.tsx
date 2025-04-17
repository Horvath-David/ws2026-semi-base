import { Outlet } from "react-router";
import { Nav } from "./nav";
import type { Route } from "./+types/route";

export function meta({}: Route.MetaArgs) {
  return [{ title: "WS 2026 BaseProject" }];
}

export default function AppLayout() {
  return (
    <div className="w-full h-full overflow-hidden flex">
      <div className="w-2xs bg-blue-500">
        <Nav />
      </div>
      <div className="flex-1 overflow-y-auto">
        <Outlet />
      </div>
    </div>
  );
}
