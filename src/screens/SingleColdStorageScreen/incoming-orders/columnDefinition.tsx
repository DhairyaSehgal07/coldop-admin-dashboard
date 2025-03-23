import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

// Type definitions for the incoming orders data
export interface BagSize {
  quantity: {
    initialQuantity: number;
    currentQuantity: number;
  };
  size: string;
}

export interface OrderDetail {
  variety: string;
  bagSizes: BagSize[];
  location: string;
}

export interface IncomingOrder {
  _id: string;
  voucher: {
    type: string;
    voucherNumber: number;
  };
  coldStorageId: string;
  farmerId: string;
  dateOfSubmission: string;
  currentStockAtThatTime?: number;
  fulfilled: boolean;
  remarks: string;
  orderDetails: OrderDetail[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface IncomingOrdersResponse {
  status: string;
  message: string;
  data: IncomingOrder[];
}

// Helper function to calculate total bags
const calculateTotalBags = (orderDetails: OrderDetail[]): number => {
  return orderDetails.reduce((total, detail) => {
    const detailTotal = detail.bagSizes.reduce((sum, bag) => {
      return sum + bag.quantity.initialQuantity;
    }, 0);
    return total + detailTotal;
  }, 0);
};

// Column definitions
export const columns: ColumnDef<IncomingOrder>[] = [
  {
    accessorKey: "voucher.voucherNumber",
    header: "Voucher Number",
    cell: ({ row }) => (
      <div className="font-medium">
        {row.original.voucher.voucherNumber.toString()}
      </div>
    ),
    filterFn: (row, columnId, filterValue) => {
      const rowValue = String(row.getValue(columnId));
      const searchValue = String(filterValue);
      return rowValue === searchValue;
    },
  },
  {
    accessorKey: "dateOfSubmission",
    header: "Submission Date",
    cell: ({ row }) => <div>{row.original.dateOfSubmission}</div>,
  },
  {
    accessorKey: "orderDetails",
    header: "Variety",
    cell: ({ row }) => (
      <div>
        {row.original.orderDetails.map((detail, index) => (
          <span key={index}>
            {detail.variety}
            {index < row.original.orderDetails.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    ),
    filterFn: (row,  filterValue) => {
      const varieties = row.original.orderDetails.map((detail) =>
        detail.variety.toLowerCase()
      );
      return varieties.some((variety) =>
        variety.includes(String(filterValue).toLowerCase())
      );
    },
  },
  {
    id: "totalBags",
    header: "Total Bags",
    cell: ({ row }) => {
      const totalBags = calculateTotalBags(row.original.orderDetails);
      return <div className="font-medium">{totalBags}</div>;
    },
  },
  {
    id: "bagSizes",
    header: "Bag Details",
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.orderDetails.map((detail) =>
          detail.bagSizes.map((bag, idx) => (
            <Badge key={idx} variant="outline" className="mr-1">
              {bag.size}: {bag.quantity.currentQuantity}
            </Badge>
          ))
        )}
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.orderDetails.map((detail, index) => (
          <span key={index}>
            {detail.location}
            {index < row.original.orderDetails.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    ),
    filterFn: (row,filterValue) => {
      const locations = row.original.orderDetails.map((detail) =>
        detail.location.toLowerCase()
      );
      return locations.some((location) =>
        location.includes(String(filterValue).toLowerCase())
      );
    },
  },
  {
    accessorKey: "fulfilled",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant="secondary"
        className={row.original.fulfilled ? "bg-green-100 text-green-800" : ""}
      >
        {row.original.fulfilled ? "Fulfilled" : "Pending"}
      </Badge>
    ),
    filterFn: (row,  filterValue) => {
      const status = row.original.fulfilled ? "fulfilled" : "pending";
      return status.includes(String(filterValue).toLowerCase());
    },
  },
  {
    accessorKey: "remarks",
    header: "Remarks",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground max-w-[200px] truncate">
        {row.original.remarks}
      </div>
    ),
  },
];
