import { useQuery, useQueryClient } from "@tanstack/react-query";
import { API_URL } from "~/constants";
import type { Cart } from "../_app/nav";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Code,
  NumberInput,
  Spinner,
} from "@heroui/react";
import { useState } from "react";

export default function CartPage() {
  const qc = useQueryClient();

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

  const [placeOrderLoading, setPlaceOrderLoading] = useState(false);

  const [loadingIds, setLoadingIds] = useState<string[]>([]);
  async function removeFromCart(itemId: string) {
    setLoadingIds([...loadingIds, itemId]);

    const res = await fetch(`${API_URL}/carts/items/${itemId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!res.ok) {
      addToast({
        title: "Failed to remove item",
        description: res.status === 500 ? await res.text() : await res.json(),
        color: "danger",
      });
      setLoadingIds(loadingIds.filter((x) => x !== itemId));
      return;
    }
    qc.setQueryData(["cart"], await res.json());

    addToast({
      title: "Item removed successfully",
      color: "success",
    });
    setLoadingIds(loadingIds.filter((x) => x !== itemId));
  }

  async function placeOrder() {
    setPlaceOrderLoading(true);

    const res = await fetch(`${API_URL}/carts`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    });
    if (!res.ok) {
      addToast({
        title: "Failed to place order",
        description: res.status === 500 ? await res.text() : await res.json(),
        color: "danger",
      });
      setPlaceOrderLoading(false);
      return;
    }
    qc.refetchQueries({
      queryKey: ["cart"],
    });
    qc.invalidateQueries({
      queryKey: ["orders"],
    });

    addToast({
      title: "Order placed successfully",
      color: "success",
    });
    setPlaceOrderLoading(false);
  }

  return (
    <>
      <h1 className="text-center mt-12 text-3xl font-semibold">Cart</h1>

      <div className="m-8">
        <div className="w-full max-w-full overflow-x-auto mt-12">
          <table className="w-full **:p-2.5 bg-content1 [&_td]:border [&_th]:border **:border-content3">
            <thead className="bg-content2 text-lg">
              <tr className="*:font-semibold">
                <th>Product</th>
                <th>Quantity</th>
                <th>Price</th>
                <th>Subtotal</th>
                <th>Remove</th>
              </tr>
            </thead>
            <tbody>
              {data?.items.map((item) => (
                <tr key={item.id}>
                  <td>{item.productName}</td>
                  <td className="p-0!" align="right">
                    <NumberInput defaultValue={item.quantity} size="sm" />
                  </td>
                  <td align="right">
                    <Code>${item.price}</Code>
                  </td>
                  <td align="right">
                    <Code>${item.totalPrice}</Code>
                  </td>
                  <td>
                    <Button
                      isDisabled={loadingIds.includes(item.id)}
                      onPress={() => {
                        removeFromCart(item.id);
                      }}
                      className="w-full"
                      color="danger"
                      variant="flat"
                    >
                      Remove
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {!isLoading && (
        <>
          <Card className="w-lg mx-auto">
            <CardHeader className="text-xl font-semibold ml-2">
              Order summary
            </CardHeader>
            <CardBody>
              <div className="mx-2 flex justify-between">
                <span className="">Total: </span>
                <span>${data?.totalPrice}</span>
              </div>
            </CardBody>
            <CardFooter>
              <Button
                onPress={placeOrder}
                isLoading={placeOrderLoading}
                className="w-full"
                color="primary"
              >
                Place order
              </Button>
            </CardFooter>
          </Card>
        </>
      )}

      {isLoading && (
        <div className="w-fit mx-auto">
          <Spinner size="lg" className="mx-auto mt-4" />
        </div>
      )}
    </>
  );
}
