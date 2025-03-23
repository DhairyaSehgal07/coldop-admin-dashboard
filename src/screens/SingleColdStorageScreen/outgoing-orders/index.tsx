import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/utils/const";
import Loader from "@/components/common/Loader";
import { DataTable } from "@/components/ui/data-table";
import { useNavigate } from "react-router-dom";
import {
  columns,
  OutgoingOrder,
  OutgoingOrdersResponse,
} from "./columnDefinitions";
import { StoreAdmin } from "@/screens/ColdStorageScreen/columnDefinitions";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const OutgoingOrdersTab = ({ coldStorageData }: { coldStorageData: StoreAdmin }) => {
  const navigate = useNavigate();
  
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const token = adminInfo?.token;

  const { data, isLoading, isError } = useQuery({
    queryKey: ["outgoingOrders", coldStorageData._id],
    queryFn: async () => {
      const response = await axios.get<OutgoingOrdersResponse>(
        `${BASE_URL}/cold-storages/${coldStorageData._id}/outgoing-orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch outgoing orders");
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
        Failed to load outgoing orders. Please try again later.
      </div>
    );
  }

  const handleRowClick = (row: OutgoingOrder) => {
    console.log(row);
    navigate(`/cold-storages/${row.coldStorageId}/outgoing-orders/${row._id}`, {
      state: { outgoingOrder: row, coldStorage: coldStorageData },
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

export default OutgoingOrdersTab;