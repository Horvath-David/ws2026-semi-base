import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/react";
import { LuEarth } from "react-icons/lu";
import { useLocation, Link } from "react-router";

export function Nav() {
  const location = useLocation();

  return (
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
          to="/other-page"
          isActive={location.pathname.startsWith("/other-page")}
        >
          Other page
        </NavbarItem>
      </NavbarContent>
      <div className="flex-1 max-h-full" aria-hidden="true"></div>
    </Navbar>
  );
}
