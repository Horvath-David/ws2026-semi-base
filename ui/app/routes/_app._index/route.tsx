import {
  Button,
  Card,
  Code,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import type { Route } from "./+types/route";
import { PiMagicWand } from "react-icons/pi";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { API_URL } from "~/constants";
import { LuList, LuListCheck } from "react-icons/lu";
import { useLocation, useNavigate } from "react-router";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "New React Router App" },
    { name: "description", content: "Welcome to React Router!" },
  ];
}

export interface CustomerSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  discount: number;
  ordersCount: number;
}

export default function Home() {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState(
    new URLSearchParams(location.search).get("search") ?? ""
  );
  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["customers", search],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/customers/search?searchTerm=${search}`
      );
      if (!res.ok) {
        return [];
      }
      return (await res.json()) as CustomerSearchResult[];
    },
    placeholderData: keepPreviousData,
  });

  useEffect(() => {
    const url = new URL(window.location.href);
    if (search) {
      url.searchParams.set("search", search);
    } else {
      url.searchParams.delete("search");
    }
    history.replaceState({}, "", url.toString());
  }, [search]);

  return (
    <div className="px-8 py-12">
      <h1 className="text-center text-3xl font-semibold mb-8">
        Customer search
      </h1>

      <Input
        className="w-full max-w-lg mx-auto mb-8"
        placeholder="Search for anything..."
        size="lg"
        startContent={<PiMagicWand size={24} className="mr-2" />}
        value={search}
        onValueChange={setSearch}
      />

      <div className="max-w-full w-full overflow-x-auto">
        <table
          aria-label="asd"
          // isHeaderSticky
          // isStriped
          // classNames={
          //   {
          //     // base: "max-w-6xl mx-auto relative",
          //   }
          // }
          className="max-w-full w-full overflow-x-scroll"
        >
          <thead className="w-full">
            <tr className="w-full bg-content3 rounded-xl">
              <th className="p-2">ID #</th>
              <th className="p-2">First Name</th>
              <th className="p-2">Last Name</th>
              <th className="p-2">E-mail</th>
              <th align="right" className="p-2">
                Discount %
              </th>
              <th align="right" className="p-2">
                Order Count
              </th>
              <th align="right" className="p-2">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="bg-content1 [&_tr]:even:bg-content2">
            {data?.map((customer) => (
              <tr key={customer.id} className="">
                <td
                  title={customer.id}
                  className="max-w-48 p-2 truncate whitespace-nowrap"
                >
                  {customer.id}
                </td>
                <td className="p-2">{customer.firstName}</td>
                <td className="p-2">{customer.lastName}</td>
                <td className="p-2">{customer.email}</td>
                <td align="right" className="p-2">
                  <Code>
                    {Math.round(customer.discount * 100 * 100) / 100}%
                  </Code>
                </td>
                <td align="right" className="p-2">
                  <Code>{customer.ordersCount}</Code>
                </td>
                <td className="p-2" align="right">
                  <Button
                    onPress={() => navigate(`/customer-orders/${customer.id}`)}
                    variant="faded"
                    size="sm"
                    startContent={<LuList size={20} />}
                  >
                    Orders
                  </Button>
                </td>
              </tr>
            )) || <></>}
          </tbody>
        </table>
      </div>

      {(isLoading || isFetching) && (
        <div className="bg-black/50 absolute inset-0 top-[16rem] flex items-center justify-center">
          <Spinner variant="simple" size="lg" />
        </div>
      )}

      {!data?.length && !isFetching && (
        <Card className="w-full max-w-lg mx-auto flex flex-col text-foreground/70 gap-4 items-center justify-center mt-12 px-8 py-12">
          {!search ? (
            <>
              <span className="text-2xl font-semibold">
                Start searching for something
              </span>
              <span>The results will appear here</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-semibold">No results</span>
              <span>Try searching for something different</span>
            </>
          )}
        </Card>
      )}
    </div>
  );
}
