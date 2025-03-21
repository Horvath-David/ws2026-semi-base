import { Outlet } from "react-router";
import { Nav } from "./nav";

export default function AppLayout() {
  return (
    <div className="w-screen h-screen overflow-hidden flex flex-col">
      <Nav />
      <div className="flex-1">
        <Outlet />
      </div>
    </div>
  );
}
