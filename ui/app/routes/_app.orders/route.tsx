import {
  useDisclosure,
  addToast,
  Button,
  Chip,
  Code,
  Spinner,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
} from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { API_URL } from "~/constants";

interface Order {
  id: string;
  orderedAt: string;
  status: string;
  totalPrice: number;
  items: OrderItem[];
}

interface OrderItem {
  productName: string;
  quantity: number;
  price: number;
  totalPrice: number;
}

export default function Orders() {
  const { data, isLoading } = useQuery({
    queryKey: ["orders"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/orders`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!res.ok) throw Error(res.statusText);
      return (await res.json()) as Order[];
    },
  });

  const [selectedOrder, setSelectedOrder] = useState<Order>();
  const detailsModal = useDisclosure();

  return (
    <>
      <h1 className="text-center mt-12 text-3xl font-semibold">Orders</h1>

      <div className="m-8">
        <div className="w-full max-w-full overflow-x-auto mt-12">
          <table className="w-full **:p-2.5 bg-content1 [&_td]:border [&_th]:border **:border-content3">
            <thead className="bg-content2 text-lg">
              <tr className="*:font-semibold">
                <th>Order ID</th>
                <th>Order Date</th>
                <th>Status</th>
                <th>Total Price</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{new Date(order.orderedAt).toLocaleString()}</td>
                  <td>{order.status}</td>
                  <td align="right">
                    <Code>${order.totalPrice}</Code>
                  </td>
                  <td align="center">
                    <Button
                      onPress={() => {
                        setSelectedOrder(order);
                        detailsModal.onOpen();
                      }}
                      className="w-full"
                    >
                      Details
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        onClose={detailsModal.onClose}
        onOpenChange={detailsModal.onOpenChange}
        isOpen={detailsModal.isOpen}
      >
        <ModalContent className="max-w-2xl">
          <ModalHeader>Order Details</ModalHeader>
          <ModalBody>
            <span className="font-semibold">Order ID: {selectedOrder?.id}</span>
            <span className="">
              Date: {new Date(selectedOrder?.orderedAt ?? "").toLocaleString()}
            </span>
            <span className="">Status: {selectedOrder?.status}</span>

            <table className="w-full **:p-2.5 bg-content1 [&_td]:border [&_th]:border **:border-content3">
              <thead className="bg-content2">
                <tr className="*:font-semibold">
                  <th>Product</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {selectedOrder?.items.map((item) => (
                  <tr key={item.productName}>
                    <td>{item.productName}</td>
                    <td align="right">{item.quantity}</td>
                    <td align="right">
                      <Code>${item.price}</Code>
                    </td>
                    <td align="right">
                      <Code>${item.totalPrice}</Code>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-between items-center">
              <span>Total: ${selectedOrder?.totalPrice}</span>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button onPress={detailsModal.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      {isLoading && (
        <div className="w-fit mx-auto">
          <Spinner size="lg" className="mx-auto mt-4" />
        </div>
      )}
    </>
  );
}
