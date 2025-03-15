import { useState } from "react";
import TopBar from "../components/common/TopBar";
import Sidebar from "../components/common/Sidebar";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "../utils/const";
import Loader from "../components/common/Loader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Building, Users, BadgeCheck } from "lucide-react";
import { PaymentsPage } from "@/test/payments";

// Define types for the API response
interface ColdStorageDetails {
  coldStorageName: string;
  coldStorageAddress: string;
  coldStorageContactNumber: string;
  capacity: number;
}

interface StoreAdmin {
  _id: string;
  name: string;
  coldStorageDetails: ColdStorageDetails;
  registeredFarmers: string[];
  personalAddress: string;
  mobileNumber: string;
  storeAdminId: number;
  isActive: boolean;
}

const ColdStorageScreen = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["coldStorages"],
    queryFn: async () => {
      const response = await axios.get(`${BASE_URL}/cold-storages`, {
        withCredentials: true,
      });
      if (response.status !== 200) {
        throw new Error("Failed to fetch cold storages");
      }
      return response.data;
    },
  });

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSidebarOpen && !(e.target as HTMLElement).closest("aside")) {
      setIsSidebarOpen(false);
    }
  };

  // Calculate summary metrics
  const totalColdStorages = data?.storeAdmins?.length || 0;

  // Calculate total registered farmers
  const totalRegisteredFarmers =
    data?.storeAdmins?.reduce(
      (total: number, admin: StoreAdmin) =>
        total + admin.registeredFarmers.length,
      0
    ) || 0;

  // Calculate total active store admins
  const totalActiveStoreAdmins =
    data?.storeAdmins?.filter((admin: StoreAdmin) => admin.isActive).length ||
    0;

  return (
    <div className="flex h-screen bg-muted/20" onClick={handleOutsideClick}>
      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* TopBar Component */}
        <TopBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          title="Cold Storages"
        />

        {/* Cold Storage Content */}
        <main className="flex-1 overflow-y-auto p-4 bg-muted/20">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : isError ? (
            <div className="bg-destructive/10 p-4 rounded-lg text-destructive text-center">
              Failed to load cold storage data. Please try again later.
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Cold Storages
                    </CardTitle>
                    <Building className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {totalColdStorages}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Total Registered Farmers
                    </CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {totalRegisteredFarmers.toLocaleString()}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                      Active Store Admins
                    </CardTitle>
                    <BadgeCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {totalActiveStoreAdmins}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Cold Storages */}
              <PaymentsPage />
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ColdStorageScreen;
