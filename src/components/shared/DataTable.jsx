import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export default function DataTable({
  columns,
  data,
  isLoading,
  onRowClick,
  emptyMessage = "No records found",
}) {
  if (isLoading) {
    return (
      <div className="border border-border overflow-hidden rounded-sm">
        <Table>
          <TableHeader>
            <TableRow className="bg-primary hover:bg-primary">
              {columns.map((col, i) => (
                <TableHead
                  key={i}
                  className="text-white text-[12px] font-semibold py-2 h-8"
                >
                  {col.header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array(6)
              .fill(0)
              .map((_, i) => (
                <TableRow
                  key={i}
                  className={i % 2 === 0 ? "bg-white" : "bg-blue-50/40"}
                >
                  {columns.map((_, j) => (
                    <TableCell key={j} className="py-1.5">
                      <Skeleton className="h-3.5 w-24" />
                    </TableCell>
                  ))}
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  return (
    <div className="border border-border overflow-hidden rounded-sm">
      <Table>
        <TableHeader>
          <TableRow className="bg-primary hover:bg-primary">
            {columns.map((col, i) => (
              <TableHead
                key={i}
                className="text-white text-[12px] font-semibold py-2 h-8 border-r border-blue-400/30 last:border-r-0"
              >
                {col.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="text-center text-muted-foreground py-8 text-sm"
              >
                {emptyMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow
                key={row.id || i}
                className={`
                  ${i % 2 === 0 ? "bg-white" : "bg-blue-50/30"}
                  ${onRowClick ? "cursor-pointer hover:bg-primary/10" : "hover:bg-muted/40"}
                  border-b border-border/60
                `}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((col, j) => (
                  <TableCell
                    key={j}
                    className="text-[12px] py-1.5 border-r border-border/30 last:border-r-0"
                  >
                    {col.cell ? col.cell(row) : row[col.accessorKey]}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}
