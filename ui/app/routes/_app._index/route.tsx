import { addToast, Button, Pagination } from "@heroui/react";
import {
  keepPreviousData,
  useMutation,
  useMutationState,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { API_URL } from "~/constants";

interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  discount: number;
  ordersCount: number;
}

interface CustomerSearchResponse {
  results: Customer[];
  total: number;
  perPage: number;
}

export default function Home() {
  const [search, setSearch] = useState("a");
  const [page, setPage] = useState(0);

  const { data } = useQuery({
    queryKey: ["asd", { page }],
    queryFn: async () => {
      const res = await fetch(
        `${API_URL}/customers/search?searchTerm=${search}&page=${page}`
      );
      if (!res.ok)
        return {
          results: [],
          perPage: 25,
          total: 0,
        } as CustomerSearchResponse;
      return (await res.json()) as CustomerSearchResponse;
    },
    placeholderData: keepPreviousData,
  });

  const queryClient = useQueryClient();

  const incrementMutation = useMutation({
    mutationKey: ["increment-order"],
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_URL}/customers/${id}/increment-order`, {
        method: "POST",
      });
      if (!res.ok) throw Error("Increment failed");
      return (await res.json()) as Customer;
    },
    onError: (e) => {
      addToast({
        color: "danger",
        title: "Unexpected error",
        description: e.message,
      });
    },
    onSuccess(data, id) {
      queryClient.setQueryData(["asd", { page }], (prev: Customer[]) =>
        prev.map((x) => (x.id === id ? data : x))
      );
      addToast({
        title: "Success",
        description: `Increment successful for ${data.firstName} ${data.lastName}`,
      });
    },
  });

  const incrementMutations = useMutationState({
    filters: {
      mutationKey: ["increment-order"],
    },
  });

  useEffect(() => {
    console.log(incrementMutations);
  }, [incrementMutations]);

  return (
    <>
      <h1 className="text-center mt-12 text-3xl font-semibold">Home</h1>

      <div className="w-full max-w-full overflow-x-auto px-6 mt-8 mb-4">
        <table className="w-full bg-content1 **:p-2 **:border **:border-content4">
          <thead className="bg-content3">
            <tr>
              <th>ID</th>
              <th>First name</th>
              <th>Last name</th>
              <th>Email</th>
              <th>Discount</th>
              <th>Orders count</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody className="*:even:bg-content2">
            {data?.results?.map((customer) => (
              <tr key={customer.id}>
                <td>{customer.id}</td>
                <td>{customer.firstName}</td>
                <td>{customer.lastName}</td>
                <td>{customer.email}</td>
                <td>{customer.discount}</td>
                <td>{customer.ordersCount}</td>
                <td>
                  <Button
                    size="sm"
                    className="w-full"
                    isDisabled={
                      incrementMutations.findLast(
                        (x) => x.variables === customer.id
                      )?.status === "pending"
                    }
                    onPress={() => incrementMutation.mutate(customer.id)}
                  >
                    Increment
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-between m-6 items-center">
        <div>
          Showing {data?.total ? 1 + page * data?.perPage : 0} -{" "}
          {Math.min(
            data?.total ?? 0,
            data?.total ? (page + 1) * data?.perPage : 0
          )}{" "}
          out of {data?.total ?? 0}
        </div>

        <Pagination
          page={page + 1}
          onChange={(val) => setPage(val - 1)}
          total={Math.ceil((data?.total ?? 0) / (data?.perPage ?? 1))}
        />
      </div>
    </>
  );
}
