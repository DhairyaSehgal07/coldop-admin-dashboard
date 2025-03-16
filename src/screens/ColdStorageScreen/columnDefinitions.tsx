import { ArrowUpDown, Pencil, Trash2 } from "lucide-react";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

// Define types for the API response
export interface ColdStorageDetails {
  coldStorageName: string;
  coldStorageAddress: string;
  coldStorageContactNumber: string;
  capacity: number;
}

export interface StoreAdmin {
  _id: string;
  name: string;
  coldStorageDetails: ColdStorageDetails;
  registeredFarmers: string[];
  personalAddress: string;
  mobileNumber: string;
  storeAdminId: number;
  isActive: boolean;
  isPaid: boolean;
}

export interface ColdStorageResponse {
  status: string;
  storeAdmins: StoreAdmin[];
}

// Define columns for the data table
export const columns: ColumnDef<StoreAdmin>[] = [
  {
    accessorFn: (row) => row.coldStorageDetails.coldStorageName,
    id: "storageName",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        NAME
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>{row.original.coldStorageDetails.coldStorageName}</div>
    ),
  },
  {
    accessorFn: (row) => row.coldStorageDetails.coldStorageAddress,
    id: "location",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        LOCATION
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>{row.original.coldStorageDetails.coldStorageAddress}</div>
    ),
  },
  {
    accessorFn: (row) => row.coldStorageDetails.capacity,
    id: "capacity",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        CAPACITY
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div>{row.original.coldStorageDetails.capacity} bags</div>
    ),
  },
  {
    accessorKey: "name",
    id: "ownerName", // Added unique id
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        OWNER
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div>{row.original.name}</div>, // Explicitly use cell to be safe
  },
  {
    accessorFn: (row) => row.coldStorageDetails.coldStorageContactNumber,
    id: "contact",
    header: "CONTACT",
    cell: ({ row }) => (
      <div>{row.original.coldStorageDetails.coldStorageContactNumber}</div>
    ),
  },
  {
    accessorKey: "isActive",
    id: "status", // Added unique id
    header: "STATUS",
    cell: ({ row }) => (
      <div
        className={`inline-block px-3 py-1 rounded-md ${
          row.original.isActive
            ? "bg-green-100 text-green-800"
            : "bg-red-100 text-red-800"
        }`}
      >
        {row.original.isActive ? "Active" : "Inactive"}
      </div>
    ),
  },
  {
    id: "actions",
    header: "ACTIONS",
    cell: () => (
      <div className="flex space-x-2">
        <Button
          variant="ghost"
          size="icon"
          className="text-indigo-600"
          aria-label="Edit"
        >
          <Pencil className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="text-red-600"
          aria-label="Delete"
        >
          <Trash2 className="h-5 w-5" />
        </Button>
      </div>
    ),
  },
];
