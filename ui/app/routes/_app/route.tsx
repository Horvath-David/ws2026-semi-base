import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { LuEarth } from "react-icons/lu";
import { Link, Outlet, useLocation } from "react-router";

export default function AppLayout() {
  const location = useLocation();

  return (
    <>
      <Navbar isBordered>
        <NavbarBrand as={Link} to={"/"} className="flex-1">
          <LuEarth size={24} />
          <span className="ml-2 text-lg font-semibold">WS 2026</span>
        </NavbarBrand>
        <NavbarContent className="flex-1 justify-center!">
          <NavbarItem
            as={Link}
            className="data-[active=true]:text-primary"
            isActive={location.pathname === "/"}
          >
            Home
          </NavbarItem>
          <NavbarItem
            as={Link}
            className="data-[active=true]:text-primary"
            to="/table-test"
            isActive={location.pathname.startsWith("/table-test")}
          >
            Table test
          </NavbarItem>
        </NavbarContent>
        <div className="flex-1 max-h-full" aria-hidden="true"></div>
      </Navbar>
      <main className="flex-1 overflow-hidden">
        <div className="w-full h-full">
          <Outlet />
        </div>
      </main>
    </>
  );
}
