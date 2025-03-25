import {
  Button,
  Card,
  Checkbox,
  Code,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  useDisclosure,
} from "@heroui/react";
import type { Route } from "./+types/route";
import { PiMagicWand } from "react-icons/pi";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { API_URL } from "~/constants";
import {
  LuBadgeInfo,
  LuFilter,
  LuInfo,
  LuList,
  LuListCheck,
} from "react-icons/lu";
import { useLocation, useNavigate, useParams } from "react-router";
import { BiChevronLeft, BiChevronRight } from "react-icons/bi";

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

interface SearchData {
  page: number;
  pageSize: number;
  customerId: string;
  number: string;
}

interface OrderSearchResult {
  page: number;
  pageSize: number;
  totalCount: number;
  hasPreviousPage: boolean;
  hasNextPage: boolean;
  items: {
    id: string;
    number: number;
    productName: string;
    isTakeaway: boolean;
    orderedAt: string;
    quantity: number;
    totalPrice: number;
  }[];
}

interface OrderDetails {
  id: string;
  productName: string;
  number: number;
  quantity: number;
  isTakeaway: boolean;
  netPrice: number;
  vat: number;
  totalPrice: number;
  totalDiscount: number;
  orderedAt: string;
}

export default function CustomerOrders() {
  const navigate = useNavigate();
  const location = useLocation();
  const { id } = useParams();

  const { data: customer, isLoading: customerLoading } = useQuery({
    queryKey: ["customer", id],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/customers/search?searchTerm=${id}`);
      if (!res.ok) {
        return undefined;
      }
      return ((await res.json()) as CustomerSearchResult[])[0];
    },
  });

  const [searchData, setSearchData] = useState<SearchData>({
    page: 0,
    pageSize: 25,
    customerId: id ?? "",
    number: "",
  });

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ["customers", searchData],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...searchData,
          number: parseInt(searchData.number),
        }),
      });
      if (!res.ok) {
        return {} as OrderSearchResult;
      }
      return (await res.json()) as OrderSearchResult;
    },
    placeholderData: keepPreviousData,
  });

  const [selectedOrder, setSelectedOrder] = useState<string>();
  const popup = useDisclosure();

  const { data: orderDetails, isFetching: orderDetailsLoading } = useQuery({
    queryKey: ["order", selectedOrder],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/orders/${selectedOrder}`);
      if (!res.ok) {
        return undefined;
      }
      return (await res.json()) as OrderDetails;
    },
  });

  if (customerLoading) {
    return (
      <div className="w-full h-52 flex items-center justify-center">
        <Spinner variant="simple" size="lg" />
      </div>
    );
  }
  return (
    <div className="px-8 py-12">
      <h1 className="text-center text-3xl font-semibold mb-8">
        Orders of {customer?.firstName} {customer?.lastName}
      </h1>

      <Input
        className="w-full max-w-lg mx-auto mb-8"
        placeholder="Search for an order number..."
        size="lg"
        startContent={<LuFilter size={24} className="mr-2" />}
        value={searchData.number}
        onValueChange={(value) =>
          setSearchData((prev) => ({
            ...prev,
            number: value,
          }))
        }
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
          <TableColumn>Order Number</TableColumn>
          <TableColumn>Product Name</TableColumn>
          <TableColumn align="center">Is takeaway</TableColumn>
          <TableColumn align="end">Ordered At</TableColumn>
          <TableColumn align="end">Quantity</TableColumn>
          <TableColumn align="end">Total Price</TableColumn>
          <TableColumn align="end">Action</TableColumn>
        </TableHeader>
        <TableBody className="max-h-[calc(100%-40rem)]">
          {data?.items?.map((order) => (
            <TableRow key={order.id} className="">
              <TableCell
                title={order.id}
                className="max-w-24 truncate whitespace-nowrap"
              >
                {order.id}
              </TableCell>
              <TableCell>{order.number}</TableCell>
              <TableCell>{order.productName}</TableCell>
              <TableCell>
                <Checkbox
                  isSelected={order.isTakeaway}
                  isDisabled
                  className="opacity-100"
                />
              </TableCell>
              <TableCell>
                <Code>{new Date(order.orderedAt).toLocaleString()}</Code>
              </TableCell>
              <TableCell>
                <Code>{order.quantity}</Code>
              </TableCell>
              <TableCell>
                <Code>{order.totalPrice}€</Code>
              </TableCell>
              <TableCell align="right">
                <Button
                  onPress={() => {
                    setSelectedOrder(order.id);
                    popup.onOpen();
                  }}
                  variant="faded"
                  startContent={<LuInfo size={20} />}
                >
                  Details
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

      <Modal
        backdrop="blur"
        isOpen={popup.isOpen}
        onOpenChange={popup.onOpenChange}
      >
        <ModalContent>
          <ModalHeader className="text-xl">Order details</ModalHeader>
          <ModalBody>
            {orderDetailsLoading && (
              <div className="w-full h-24 flex justify-center items-center">
                <Spinner variant="simple" />
              </div>
            )}
            {!orderDetailsLoading && (
              <div className="w-full flex flex-col gap-4">
                <div>
                  <span className="font-semibold bg-content2 px-1.5 py-0.5 mr-2 border border-content3 rounded-lg">
                    Order ID:
                  </span>
                  <span>{orderDetails?.id}</span>
                </div>
                <div>
                  <span className="font-semibold bg-content2 px-1.5 py-0.5 mr-2 border border-content3 rounded-lg">
                    Order Number:
                  </span>
                  <span>{orderDetails?.number}</span>
                </div>
                <div>
                  <span className="font-semibold bg-content2 px-1.5 py-0.5 mr-2 border border-content3 rounded-lg">
                    Product Name:
                  </span>
                  <span>{orderDetails?.productName}</span>
                </div>
                <div>
                  <span className="font-semibold bg-content2 px-1.5 py-0.5 mr-2 border border-content3 rounded-lg">
                    Is Takeaway:
                  </span>
                  <span>
                    <Checkbox
                      isDisabled
                      className="opacity-100"
                      isSelected={orderDetails?.isTakeaway}
                    />
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold bg-content2 px-1.5 py-0.5 mr-2 border border-content3 rounded-lg">
                    Net Price:
                  </span>
                  <span>
                    <Code className="">{orderDetails?.netPrice}€</Code>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold bg-content2 px-1.5 py-0.5 mr-2 border border-content3 rounded-lg">
                    VAT:
                  </span>
                  <span>
                    <Code className="">{orderDetails?.vat}€</Code>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold bg-content2 px-1.5 py-0.5 mr-2 border border-content3 rounded-lg">
                    Total Price:
                  </span>
                  <span>
                    <Code className="">{orderDetails?.totalPrice}€</Code>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold bg-content2 px-1.5 py-0.5 mr-2 border border-content3 rounded-lg">
                    Total Discount:
                  </span>
                  <span>
                    <Code className="">{orderDetails?.totalDiscount}€</Code>
                  </span>
                </div>
                <div className="flex items-center">
                  <span className="font-semibold bg-content2 px-1.5 py-0.5 mr-2 border border-content3 rounded-lg">
                    Ordered At:
                  </span>
                  <span>
                    {new Date(orderDetails?.orderedAt ?? "").toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button
              onPress={popup.onClose}
              className="w-full mb-2"
              color="primary"
            >
              Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {!data?.items?.length && !isFetching && (
        <Card className="w-full max-w-lg mx-auto flex flex-col text-foreground/70 gap-4 items-center justify-center mt-12 px-8 py-12">
          {!searchData.number ? (
            <>
              <span className="text-2xl font-semibold">No orders yet</span>
              <span>Come and check later</span>
            </>
          ) : (
            <>
              <span className="text-2xl font-semibold">No results</span>
              <span>Try searching for a different order number</span>
            </>
          )}
        </Card>
      )}

      <div className="flex gap-4 items-center justify-center mt-8">
        <Button
          isIconOnly
          size="sm"
          isDisabled={!data?.hasPreviousPage}
          onPress={() =>
            setSearchData((prev) => ({
              ...prev,
              page: Math.max(0, (prev.page -= 1)),
            }))
          }
        >
          <BiChevronLeft size={24} />
        </Button>
        <span>
          <span className="font-semibold">Page {searchData.page + 1}</span> /{" "}
          {Math.ceil((data?.totalCount ?? 0) / searchData.pageSize)}
        </span>
        <Button
          isIconOnly
          size="sm"
          isDisabled={!data?.hasNextPage}
          onPress={() =>
            setSearchData((prev) => ({
              ...prev,
              page: Math.min(
                (data?.totalCount ?? 0) / searchData.pageSize,
                (prev.page += 1)
              ),
            }))
          }
        >
          <BiChevronRight size={24} />
        </Button>
      </div>
    </div>
  );
}
