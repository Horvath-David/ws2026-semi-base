import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
  Checkbox,
  Code,
  Pagination,
  type SortDescriptor,
  Spinner,
} from "@heroui/react";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { useState } from "react";

export default function TableTest() {
  const [page, setPage] = useState(0);
  const [sort, setSort] = useState<SortDescriptor>();
  const { data, isFetching } = useQuery({
    queryKey: [
      "entries",
      {
        page,
        sort,
      },
    ],
    queryFn: async () => {
      const sortString = `${sort?.direction === "descending" ? "-" : ""}${
        sort?.column
      }`;
      const res = await fetch(
        `http://localhost:5239/entries?page=${page}&sort=${sortString}`
      );
      return await res.json();
    },
    placeholderData: keepPreviousData,
  });

  return (
    <div className="p-8 w-full h-full flex flex-col items-center">
      <Table
        sortDescriptor={sort}
        onSortChange={setSort}
        isStriped
        isHeaderSticky
        classNames={{
          base: "max-h-[calc(100%-4rem)] relative",
        }}
        aria-label="Example static collection table"
      >
        <TableHeader>
          <TableColumn allowsSorting key="id">
            ID
          </TableColumn>
          <TableColumn allowsSorting key="name">
            Name
          </TableColumn>
          <TableColumn allowsSorting key="colorHex">
            Color
          </TableColumn>
          <TableColumn allowsSorting key="isSomething">
            Is something
          </TableColumn>
        </TableHeader>
        <TableBody className="">
          {data?.results?.map((row: any) => (
            <TableRow key={row.id}>
              <TableCell>{row.id}</TableCell>
              <TableCell>{row.name}</TableCell>
              <TableCell className="flex gap-2 items-center">
                <div
                  className="size-6 rounded-lg"
                  style={{ backgroundColor: row.colorHex }}
                ></div>
                <Code>{row.colorHex}</Code>
              </TableCell>
              <TableCell>
                <Checkbox isSelected={row.isSomething} isDisabled />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      {isFetching && (
        <div className="bg-black/50 absolute inset-0 flex items-center justify-center">
          <Spinner variant="simple" size="lg" />
        </div>
      )}
      <Pagination
        className="mt-auto"
        total={(data?.total ?? 0) / (data?.itemsPerPage ?? 1) - 1}
        page={page}
        onChange={setPage}
      />
    </div>
  );
}
