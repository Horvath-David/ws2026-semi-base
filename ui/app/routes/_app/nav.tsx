import { Button } from "@heroui/react";
import { useQuery } from "@tanstack/react-query";
import { LuEarth } from "react-icons/lu";
import { Link, useLocation } from "react-router";
import { API_URL } from "~/constants";

const activeVariant = "faded";
const inactiveVariant = "bordered";

export interface Cart {
  id: string;
  createdAt: string;
  totalPrice: number;
  items: CartItem[];
}

export interface CartItem {
  id: string;
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export function Nav() {
  const location = useLocation();

  const { data, isLoading } = useQuery({
    queryKey: ["cart"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/carts`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!res.ok) throw Error(res.statusText);
      return (await res.json()) as Cart;
    },
  });

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
          Products
        </Button>
        <Button
          as={Link}
          className="data-[active=true]:text-primary"
          to="/orders"
          variant={
            location.pathname.startsWith("/orders")
              ? activeVariant
              : inactiveVariant
          }
        >
          Orders
        </Button>

        <Button
          as={Link}
          className="data-[active=true]:text-primary mt-auto"
          to="/cart"
          variant={
            location.pathname.startsWith("/cart")
              ? activeVariant
              : inactiveVariant
          }
        >
          Cart {!isLoading && `(${data?.items.length})`}
        </Button>
        <Button
          onPress={() => {
            localStorage.removeItem("accessToken");
            window.location.reload();
          }}
          variant="solid"
        >
          Log out
        </Button>
      </div>
    </nav>
  );
}
