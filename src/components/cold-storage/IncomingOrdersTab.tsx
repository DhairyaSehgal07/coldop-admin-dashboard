import { useState, useMemo } from "react";
import { ArrowDownCircle, Box, Users } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { BASE_URL } from "../../utils/const";
import Table from "../common/Table";
import Loader from "../common/Loader";
import { ColumnDef } from "@tanstack/react-table";

// Define interfaces for the data structures
interface ColdStorageData {
  id: string;
  name: string;
  // Add other properties as needed
}

interface OrderDetails {
  variety?: string;
  location?: string;
  // Add other order detail properties as needed
}

interface Voucher {
  voucherNumber?: string;
  type?: string;
  // Add other voucher properties as needed
}

interface IncomingOrder {
  _id: string;
  farmerId: string;
  farmerName?: string;
  dateOfSubmission: string;
  fulfilled: boolean;
  remarks?: string;
  voucher?: Voucher;
  orderDetails?: OrderDetails[];
  // Add other order properties as needed
}

interface TransformedOrder {
  id: string;
  voucherNumber: string;
  voucherType: string;
  farmerId: string;
  farmerName: string;
  dateOfSubmission: string;
  fulfilled: boolean;
  remarks?: string;
  variety: string;
  location: string;
  fullDetails: IncomingOrder;
}

interface IncomingOrdersTabProps {
  coldStorageData: ColdStorageData;
}

const IncomingOrdersTab = ({ coldStorageData }: IncomingOrdersTabProps) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Fetch incoming orders data with React Query
  const { data, isLoading, isError } = useQuery<{ data: IncomingOrder[] }>({
    queryKey: ["incomingOrders", coldStorageData.id],
    queryFn: async () => {
      const response = await axios.get(
        `${BASE_URL}/cold-storages/${coldStorageData.id}/incoming-orders`,
        { withCredentials: true }
      );
      return response.data;
    },
  });

  // Get the incoming orders from the API response and transform them
  const incomingOrdersData = useMemo<TransformedOrder[]>(() => {
    if (!data) return [];

    // Transform the data to match the column structure
    return data.data.map((order) => ({
      id: order._id,
      voucherNumber: order.voucher?.voucherNumber || "N/A",
      voucherType: order.voucher?.type || "N/A",
      farmerId: order.farmerId,
      // You'll need to fetch farmer names separately or have them in your data
      farmerName: order.farmerName || `Farmer ${order.farmerId.slice(-5)}`,
      dateOfSubmission: order.dateOfSubmission,
      fulfilled: order.fulfilled,
      remarks: order.remarks,
      // Get the first variety and location for display in the table
      variety: order.orderDetails?.[0]?.variety || "N/A",
      location: order.orderDetails?.[0]?.location || "N/A",
      // Include the full details for use elsewhere
      fullDetails: order,
    }));
  }, [data]);

  // Define table columns
  const columns = useMemo<ColumnDef<TransformedOrder, unknown>[]>(
    () => [
      {
        accessorKey: "voucherNumber",
        header: "Voucher",
        cell: ({ row }) => (
          <div className="font-medium text-indigo-600">
            {row.original.voucherType} #{row.original.voucherNumber}
          </div>
        ),
      },
      {
        accessorKey: "farmerName",
        header: "Farmer",
      },
      {
        accessorKey: "dateOfSubmission",
        header: "Date",
        cell: ({ row }) => <div>{row.original.dateOfSubmission}</div>,
      },
      {
        accessorKey: "variety",
        header: "Variety",
      },
      {
        accessorKey: "location",
        header: "Location",
      },
      {
        accessorKey: "remarks",
        header: "Remarks",
        cell: ({ row }) => (
          <div className="truncate max-w-xs" title={row.original.remarks}>
            {row.original.remarks || "No remarks"}
          </div>
        ),
      },
      {
        accessorKey: "fulfilled",
        header: "Status",
        cell: ({ row }) => (
          <span
            className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
              row.original.fulfilled
                ? "bg-green-100 text-green-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {row.original.fulfilled ? "Fulfilled" : "Pending"}
          </span>
        ),
      },
    ],
    []
  );

  // Handle row click to navigate to detail page
  const handleRowClick = (order: TransformedOrder) => {
    navigate(`/cold-storages/${coldStorageData.id}/incoming/${order.id}`);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center">
        Failed to load incoming orders. Please try again later.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <ArrowDownCircle className="h-6 w-6 text-green-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Total Orders</p>
              <p className="text-xl font-bold">{incomingOrdersData.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <Box className="h-6 w-6 text-yellow-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Pending Orders</p>
              <p className="text-xl font-bold">
                {incomingOrdersData.filter((order) => !order.fulfilled).length}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <Users className="h-6 w-6 text-blue-500" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-500">Unique Farmers</p>
              <p className="text-xl font-bold">
                {
                  new Set(incomingOrdersData.map((order) => order.farmerId))
                    .size
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Orders Table using the Table component */}
      <Table
        data={incomingOrdersData}
        columns={columns}
        showSearch={false}
        searchPlaceholder="Search orders..."
        showPagination={true}
        pageSize={10}
        onRowClick={handleRowClick}
        isLoading={isLoading}
        globalFilter={searchQuery}
        setGlobalFilter={setSearchQuery}
        emptyMessage="No incoming orders available"
        className="mt-4"
      />
      {/* Note: currentPage and onPageChange were removed as they're not in the DataTableProps interface */}
    </div>
  );
};

export default IncomingOrdersTab;
