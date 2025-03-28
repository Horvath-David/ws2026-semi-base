import * as React from "react";

import { cn } from "@/lib/utils";

export interface TableProps extends React.ComponentProps<"table"> {
  isHeaderSticky?: boolean;
  isStriped?: boolean;
}

function Table({ className, ...props }: TableProps) {
  return (
    <div
      data-slot="table-container"
      className="p-4 z-0 flex flex-col relative justify-between gap-4 bg-content1 overflow-auto rounded-large shadow-small w-full"
    >
      <table
        data-slot="table"
        className={cn("min-w-full h-auto table-auto w-full", className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        "[&>tr]:first:rounded-lg sticky top-0 z-20 [&>tr]:first:shadow-small",
        className
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cn("[&_tr:last-child]:border-0", className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<"tfoot">) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
        className
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        "group/tr outline-hidden data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2",
        className
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<"th">) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        "group/th px-3 h-10 align-middle bg-default-100 whitespace-nowrap text-foreground-500! text-tiny font-semibold first:rounded-s-lg last:rounded-e-lg data-[sortable=true]:cursor-pointer data-[hover=true]:text-foreground-400 outline-hidden data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 text-start",
        className
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<"td">) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        "py-2 px-3 relative align-middle text-small font-normal [&>*]:z-1 [&>*]:relative outline-hidden data-[focus-visible=true]:z-10 data-[focus-visible=true]:outline-2 data-[focus-visible=true]:outline-focus data-[focus-visible=true]:outline-offset-2 before:content-[''] before:absolute before:z-0 before:inset-0 before:opacity-0 data-[selected=true]:before:opacity-100 group-data-[disabled=true]/tr:text-foreground-300 group-data-[disabled=true]/tr:cursor-not-allowed before:bg-default/60 data-[selected=true]:text-default-foreground group-data-[odd=true]/tr:before:bg-default-100 group-data-[odd=true]/tr:before:opacity-100 group-data-[odd=true]/tr:before:-z-10 first:before:rounded-s-lg last:before:rounded-e-lg text-start group-data-[odd=true]/tr:data-[selected=true]/tr:before:bg-default/60 max-w-24 truncate whitespace-nowrap",
        className
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<"caption">) {
  return (
    <caption
      data-slot="table-caption"
      className={cn("text-muted-foreground mt-4 text-sm", className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
