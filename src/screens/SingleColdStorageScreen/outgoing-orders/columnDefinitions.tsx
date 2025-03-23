import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

// Type definitions for the outgoing orders data
export interface IncomingBagSize {
  size: string;
  currentQuantity: number;
  initialQuantity: number;
  _id: string;
}

export interface IncomingOrderReference {
  _id: string;
  location: string;
  voucher: {
    type: string;
    voucherNumber: number;
  };
  incomingBagSizes: IncomingBagSize[];
}

export interface BagSize {
  size: string;
  quantityRemoved: number;
}

export interface OrderDetail {
  variety: string;
  incomingOrder: IncomingOrderReference;
  bagSizes: BagSize[];
}

export interface OutgoingOrder {
  _id: string;
  coldStorageId: string;
  farmerId: string;
  voucher: {
    type: string;
    voucherNumber: number;
  };
  dateOfExtraction: string;
  remarks: string;
  orderDetails: OrderDetail[];
  createdAt: string;
  updatedAt: string;
  __v: number;
}

export interface OutgoingOrdersResponse {
  status?: string;
  message: string;
  data: OutgoingOrder[];
}

// Helper function to calculate total bags extracted
const calculateTotalBagsExtracted = (orderDetails: OrderDetail[]): number => {
  return orderDetails.reduce((total, detail) => {
    const detailTotal = detail.bagSizes.reduce((sum, bag) => {
      return sum + bag.quantityRemoved;
    }, 0);
    return total + detailTotal;
  }, 0);
};

// Column definitions
export const columns: ColumnDef<OutgoingOrder>[] = [
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
    accessorKey: "dateOfExtraction",
    header: "Extraction Date",
    cell: ({ row }) => <div>{row.original.dateOfExtraction}</div>,
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
    id: "totalBagsExtracted",
    header: "Total Bags Extracted",
    cell: ({ row }) => {
      const totalBags = calculateTotalBagsExtracted(row.original.orderDetails);
      return <div className="font-medium">{totalBags}</div>;
    },
  },
  {
    id: "bagDetails",
    header: "Bag Details",
    cell: ({ row }) => (
      <div className="space-y-1">
        {row.original.orderDetails.map((detail, detailIndex) =>
          detail.bagSizes.map((bag, idx) => (
            <Badge key={`${detailIndex}-${idx}`} variant="outline" className="mr-1">
              {bag.size}: {bag.quantityRemoved}
            </Badge>
          ))
        )}
      </div>
    ),
  },
  {
    id: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="text-sm text-muted-foreground">
        {row.original.orderDetails.map((detail, index) => (
          <span key={index}>
            {detail.incomingOrder.location}
            {index < row.original.orderDetails.length - 1 ? ", " : ""}
          </span>
        ))}
      </div>
    ),
    filterFn: (row,  filterValue) => {
      const locations = row.original.orderDetails.map((detail) =>
        detail.incomingOrder.location.toLowerCase()
      );
      return locations.some((location) =>
        location.includes(String(filterValue).toLowerCase())
      );
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