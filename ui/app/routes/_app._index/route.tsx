import {
  addToast,
  Button,
  Chip,
  Code,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  NumberInput,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { API_URL } from "~/constants";

interface Product {
  id: string;
  name: string;
  availableQuantity: number;
  stockQuantity: number;
  price: number;
  warningType: "None" | "OutOfStock" | "LowStock";
}

export default function Products() {
  const { data, isLoading } = useQuery({
    queryKey: ["products"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/products`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });
      if (!res.ok) throw Error(res.statusText);
      return (await res.json()) as Product[];
    },
  });

  const [selectedProduct, setSelectedProduct] = useState<Product>();
  const addToCartModal = useDisclosure();
  const [addToCartLoading, setAddToCartLoading] = useState(false);
  const [quantity, setQuantity] = useState(1);

  const qc = useQueryClient();

  async function addToCart() {
    setAddToCartLoading(true);

    const res = await fetch(`${API_URL}/carts/items`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({
        productId: selectedProduct?.id,
        quantity,
      }),
    });
    if (!res.ok) {
      addToast({
        title: "Error adding to cart",
        description: res.status === 500 ? await res.text() : await res.json(),
        color: "danger",
      });
      setAddToCartLoading(false);
      return;
    }
    qc.setQueryData(["cart"], await res.json());
    qc.refetchQueries({
      queryKey: ["products"],
    });
    addToast({
      title: "Successfully added to cart",
      color: "success",
    });
    addToCartModal.onClose();
  }

  return (
    <>
      <h1 className="text-center mt-12 text-3xl font-semibold">Products</h1>

      <div className="m-8">
        <div className="w-full max-w-full overflow-x-auto mt-12">
          <table className="w-full **:p-2.5 bg-content1 [&_td]:border [&_th]:border **:border-content3">
            <thead className="bg-content2 text-lg">
              <tr className="*:font-semibold">
                <th>Product</th>
                <th>Available</th>
                <th>Stock</th>
                <th>Price</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {data?.map((product) => (
                <tr key={product.id}>
                  <td>{product.name}</td>
                  <td align="right">{product.availableQuantity}</td>
                  <td align="right">{product.stockQuantity}</td>
                  <td align="right">
                    <Code>${product.price}</Code>
                  </td>
                  <td align="center">
                    {product.warningType === "None" && (
                      <Chip variant="flat">In stock</Chip>
                    )}
                    {product.warningType === "LowStock" && (
                      <Chip color="warning" variant="flat">
                        Low stock
                      </Chip>
                    )}
                    {product.warningType === "OutOfStock" && (
                      <Chip color="danger" variant="flat">
                        Out of stock
                      </Chip>
                    )}
                  </td>
                  <td align="center">
                    <Button
                      isDisabled={product.warningType === "OutOfStock"}
                      onPress={() => {
                        setSelectedProduct(product);
                        setAddToCartLoading(false);
                        setQuantity(1);
                        addToCartModal.onOpen();
                      }}
                      className="w-full"
                    >
                      Add to cart
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        onClose={addToCartModal.onClose}
        onOpenChange={addToCartModal.onOpenChange}
        isOpen={addToCartModal.isOpen}
      >
        <ModalContent>
          <ModalHeader>Add to cart</ModalHeader>
          <ModalBody>
            <span className="font-semibold">Name: {selectedProduct?.name}</span>
            <span className="">Price: ${selectedProduct?.price}</span>
            <NumberInput
              label="Quantity"
              labelPlacement="outside"
              value={quantity}
              onValueChange={setQuantity}
              minValue={1}
              maxValue={selectedProduct?.availableQuantity}
            />
            <div className="flex justify-between items-center">
              <span>Available: {selectedProduct?.availableQuantity} units</span>
              <span>Total: ${(selectedProduct?.price ?? 0) * quantity}</span>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={addToCartModal.onClose}>
              Cancel
            </Button>
            <Button
              onPress={addToCart}
              color="primary"
              isLoading={addToCartLoading}
            >
              Add to cart
            </Button>
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
