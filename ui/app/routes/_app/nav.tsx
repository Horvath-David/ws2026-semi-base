import { Button } from "@heroui/react";
import { LuEarth } from "react-icons/lu";
import { Link, useLocation } from "react-router";

const activeVariant = "faded";
const inactiveVariant = "bordered";

export function Nav() {
  const location = useLocation();

  return (
    <nav className="flex flex-col h-full items-center bg-content1 border-r border-content3">
      <Link
        to={"/"}
        className="flex items-center justify-center w-full py-4 border-b border-content3"
      >
        <LuEarth size={24} />
        <span className="ml-2 text-lg font-semibold">WS 2026</span>
      </Link>
      <div className="flex-1 flex flex-col w-full p-4 gap-4">
        <Button
          as={Link}
          className="data-[active=true]:text-primary"
          variant={location.pathname === "/" ? activeVariant : inactiveVariant}
        >
          Home
        </Button>
        <Button
          as={Link}
          className="data-[active=true]:text-primary"
          to="/other-page"
          variant={
            location.pathname.startsWith("/other-page")
              ? activeVariant
              : inactiveVariant
          }
        >
          Other page
        </Button>
      </div>
      <div className="flex-1 max-h-full" aria-hidden="true"></div>
    </nav>
  );
}
