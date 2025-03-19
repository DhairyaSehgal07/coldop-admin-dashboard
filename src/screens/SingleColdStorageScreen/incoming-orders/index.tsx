import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/utils/const";
import Loader from "@/components/common/Loader";
import { DataTable } from "@/components/ui/data-table";
import { useNavigate } from "react-router-dom";
import {
  columns,
  IncomingOrder,
  IncomingOrdersResponse,
} from "./columnDefinition";

const IncomingOrdersTab = ({ id }: { id: string }) => {
  const navigate = useNavigate();
  // Fetch incoming orders data
  const { data, isLoading, isError } = useQuery({
    queryKey: ["incomingOrders", id],
    queryFn: async () => {
      const response = await axios.get<IncomingOrdersResponse>(
        `${BASE_URL}/cold-storages/${id}/incoming-orders`,
        {
          withCredentials: true,
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch incoming orders");
      }

      return response.data;
    },
  });

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
      </div>
    );
  }

  // Show error state
  if (isError) {
    return (
      <div className="bg-destructive/10 p-4 rounded-lg text-destructive text-center">
        Failed to load incoming orders. Please try again later.
      </div>
    );
  }

  const handleRowClick = (row: IncomingOrder) => {
    console.log(row);
    navigate(`/cold-storages/${row.coldStorageId}/incoming-orders/${row._id}`, {
      state: { incomingOrder: row },
    });
  };

  return (
    <div>
      {data?.data ? (
        <DataTable
          columns={columns}
          data={data.data}
          onRowClick={handleRowClick}
        />
      ) : null}
    </div>
  );
};

export default IncomingOrdersTab;
