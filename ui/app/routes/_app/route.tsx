import { Outlet } from "react-router";
import { Nav } from "./nav";

export default function AppLayout() {
  return (
    <>
      <Nav />
      <main className="flex-1 overflow-hidden">
        <div className="w-full h-full">
          <Outlet />
        </div>
      </main>
    </>
  );
}
