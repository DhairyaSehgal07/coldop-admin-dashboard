import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/utils/const";
import Loader from "@/components/common/Loader";
import { DataTable } from "@/components/ui/data-table";
import { useNavigate } from "react-router-dom";
import { columns, Farmer, FarmersResponse } from "./columnDefinition";
import { StoreAdmin } from "@/screens/ColdStorageScreen/columnDefinitions";
import { useSelector } from "react-redux";
import { RootState } from "@/store";

const FarmersTab = ({ coldStorageData }: { coldStorageData: StoreAdmin }) => {
  const navigate = useNavigate();
  
  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const token = adminInfo?.token;
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["farmers", coldStorageData._id],
    queryFn: async () => {
      const response = await axios.get<FarmersResponse>(
        `${BASE_URL}/cold-storages/${coldStorageData._id}/farmers`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch farmers");
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
        Failed to load farmers. Please try again later.
      </div>
    );
  }

  const handleRowClick = (row: Farmer) => {
    console.log(row);
    navigate(`/cold-storages/${coldStorageData._id}/farmers/${row._id}`, {
      state: { farmer: row, coldStorage: coldStorageData },
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

export default FarmersTab;