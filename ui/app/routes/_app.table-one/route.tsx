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

  const [sort, setSort] = useState("");

  const { data, isFetching } = useQuery({
    queryKey: ["table-1-data"],
    queryFn: async () => {
      const res = await fetch(`${API_URL}/customers/search?searchTerm=a`);
      if (!res.ok) return [];
      return (await res.json()) as CustomerSearchResult[];
    },
  });

  return (
    <div className="px-8 py-12">
      <h1 className="text-center text-3xl font-semibold mb-8">
        Table practice 1
      </h1>

      <div className="overflow-x-auto max-w-full">
        <table className="w-full bg-content1 **:border-content3 **:border-2 **:p-2 ">
          <thead className="bg-content2">
            <tr className="*:hover:bg-content3 *:cursor-pointer">
              <th
                onClick={() => {
                  if (sort === "id") setSort("-id");
                  else setSort("id");
                }}
              >
                ID {sort === "id" && "(ASC)"} {sort === "-id" && "(DESC)"}
              </th>
              <th
                onClick={() => {
                  if (sort === "firstName") setSort("-firstName");
                  else setSort("firstName");
                }}
              >
                First name {sort === "firstName" && "(ASC)"}{" "}
                {sort === "-firstName" && "(DESC)"}
              </th>
              <th
                onClick={() => {
                  if (sort === "lastName") setSort("-lastName");
                  else setSort("lastName");
                }}
              >
                Last name {sort === "lastName" && "(ASC)"}{" "}
                {sort === "-lastName" && "(DESC)"}
              </th>
              <th
                onClick={() => {
                  if (sort === "email") setSort("-email");
                  else setSort("email");
                }}
              >
                Email {sort === "email" && "(ASC)"}{" "}
                {sort === "-email" && "(DESC)"}
              </th>
              <th
                onClick={() => {
                  if (sort === "discount") setSort("-discount");
                  else setSort("discount");
                }}
              >
                Discount {sort === "discount" && "(ASC)"}{" "}
                {sort === "-discount" && "(DESC)"}
              </th>
              <th
                onClick={() => {
                  if (sort === "ordersCount") setSort("-ordersCount");
                  else setSort("ordersCount");
                }}
              >
                Orders count {sort === "ordersCount" && "(ASC)"}{" "}
                {sort === "-ordersCount" && "(DESC)"}
              </th>
            </tr>
          </thead>
          <tbody>
            {data?.map((customer) => (
              <>
                <tr>
                  <td>{customer.id}</td>
                  <td>{customer.firstName}</td>
                  <td>{customer.lastName}</td>
                  <td>{customer.email}</td>
                  <td>{customer.discount}</td>
                  <td>{customer.ordersCount}</td>
                </tr>
              </>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
