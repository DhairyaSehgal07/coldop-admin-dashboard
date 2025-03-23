import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

// Type definitions for farmers data
export interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  role: string;
  imageUrl: string;
  registeredStoreAdmins: string[];
  farmerId: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface FarmersResponse {
  status: string;
  message: string;
  data: Farmer[];
}

// Column definitions
export const columns: ColumnDef<Farmer>[] = [
  {
    accessorKey: "farmerId",
    header: "Farmer ID",
    cell: ({ row }) => (
      <div className="font-medium">{row.original.farmerId}</div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const rowValue = String(row.getValue(columnId));
      const searchValue = String(filterValue);
      return rowValue.includes(searchValue);
    },
  },
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => <div className="font-medium">{row.original.name}</div>,
    filterFn: (row, columnId, filterValue) => {
      const rowValue = String(row.getValue(columnId)).toLowerCase();
      const searchValue = String(filterValue).toLowerCase();
      return rowValue.includes(searchValue);
    },
  },
  {
    accessorKey: "address",
    header: "Address",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">{row.original.address}</div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const rowValue = String(row.getValue(columnId)).toLowerCase();
      const searchValue = String(filterValue).toLowerCase();
      return rowValue.includes(searchValue);
    },
  },
  {
    accessorKey: "mobileNumber",
    header: "Mobile Number",
    cell: ({ row }) => <div>{row.original.mobileNumber}</div>,
    filterFn: (row, columnId, filterValue) => {
      const rowValue = String(row.getValue(columnId));
      const searchValue = String(filterValue);
      return rowValue.includes(searchValue);
    },
  },
  {
    accessorKey: "isVerified",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className={row.original.isVerified ? "bg-green-100 text-green-800" : ""}
      >
        {row.original.isVerified ? "Verified" : "Unverified"}
      </Badge>
    ),
    filterFn: (row,  filterValue) => {
      const status = row.original.isVerified ? "verified" : "unverified";
      return status.includes(String(filterValue).toLowerCase());
    },
  },
  {
    accessorKey: "createdAt",
    header: "Registration Date",
    cell: ({ row }) => {
      // Format the date for better readability
      const date = new Date(row.original.createdAt);
      return <div>{date.toLocaleDateString()}</div>;
    },
  },
  
];