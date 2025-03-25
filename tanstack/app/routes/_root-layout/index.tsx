import {
  Input,
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Code,
  Button,
  Spinner,
  Card,
} from "@heroui/react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import {
  createFileRoute,
  useLocation,
  useNavigate,
} from "@tanstack/react-router";
import { useState, useEffect } from "react";
import { LuList } from "react-icons/lu";
import { PiMagicWand } from "react-icons/pi";
import { API_URL } from "../../constants";

export const Route = createFileRoute("/_root-layout/")({
  component: RouteComponent,
  ssr: false,
});

export interface CustomerSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  discount: number;
  ordersCount: number;
}

function RouteComponent() {
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

      <Table
        aria-label="asd"
        isHeaderSticky
        isStriped
        classNames={{
          base: "max-w-6xl mx-auto relative",
        }}
      >
        <TableHeader>
          <TableColumn className="max-w-24">ID #</TableColumn>
          <TableColumn>First Name</TableColumn>
          <TableColumn>Last Name</TableColumn>
          <TableColumn>E-mail</TableColumn>
          <TableColumn align="end">Discount %</TableColumn>
          <TableColumn align="end">Order Count</TableColumn>
          <TableColumn align="end">Action</TableColumn>
        </TableHeader>
        <TableBody className="max-h-[calc(100%-40rem)]">
          {data?.map((customer) => (
            <TableRow key={customer.id} className="">
              <TableCell
                title={customer.id}
                className="max-w-24 truncate whitespace-nowrap"
              >
                {customer.id}
              </TableCell>
              <TableCell>{customer.firstName}</TableCell>
              <TableCell>{customer.lastName}</TableCell>
              <TableCell>{customer.email}</TableCell>
              <TableCell>
                <Code>{Math.round(customer.discount * 100 * 100) / 100}%</Code>
              </TableCell>
              <TableCell>
                <Code>{customer.ordersCount}</Code>
              </TableCell>
              <TableCell align="right">
                <Button
                  onPress={() =>
                    navigate({
                      to: "/customer-orders/$id",
                      params: { id: customer.id },
                    })
                  }
                  variant="faded"
                  startContent={<LuList size={20} />}
                >
                  Orders
                </Button>
              </TableCell>
            </TableRow>
          )) || <></>}
        </TableBody>
      </Table>
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
