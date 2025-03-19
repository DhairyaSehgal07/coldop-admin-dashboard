import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import TopBar from "@/components/common/TopBar";
import Sidebar from "@/components/common/Sidebar";

import OverviewTab from "./overview";
import FarmersTab from "./farmers";
import IncomingOrdersTab from "./incoming-orders";
import OutgoingOrdersTab from "./outgoing-orders";

const SingleColdStorageScreen = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Store data with a default fallback object to prevent undefined errors
  const [coldStorageData] = useState(location.state?.coldStorage || {
    coldStorageDetails: { 
      coldStorageName: "Loading...",
      capacity: "N/A" 
    },
    location: "Unknown",
    occupancy: 0,
    _id: id
  });

  // Add error handling - if we don't have essential data, redirect or show error
  useEffect(() => {
    if (!location.state?.coldStorage) {
      // Option 1: Fetch data if not provided in state
      // fetchColdStorageData(id);
      
      // Option 2: Redirect to cold storages list with error message
      // navigate('/cold-storages', { state: { error: "Cold storage data not found" } });
      
      // For now we're using default values, but one of the above options would be better
      console.warn("Cold storage data not available in route state");
    }
  }, [id, location.state, navigate]);

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(`coldStorage_${id}_activeTab`);
    return savedTab || "overview";
  });

  useEffect(() => {
    localStorage.setItem(`coldStorage_${id}_activeTab`, activeTab);
  }, [activeTab, id]);

  const handleOutsideClick = (e) => {
    if (isSidebarOpen && !(e.target).closest("aside")) {
      setIsSidebarOpen(false);
    }
  };

  return (
    <div
      className="flex h-screen bg-gray-100"
      onClick={handleOutsideClick} // Fixed: this was incorrectly passing a function reference
    >
      {/* Sidebar Component */}
      <Sidebar isSidebarOpen={isSidebarOpen} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-y-auto">
        {/* TopBar Component */}
        <TopBar
          isSidebarOpen={isSidebarOpen}
          setIsSidebarOpen={setIsSidebarOpen}
          title="Cold Storage Details"
        />

        {/* Back Button and Title */}
        <div className="px-6 py-4 flex items-center">
          <Link
            to="/cold-storages"
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Cold Storages</span>
          </Link>
        </div>

        {/* Cold Storage Info Card */}
        <div className="px-6 pb-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {coldStorageData.coldStorageDetails.coldStorageName}
                  </h2>
                  <div className="flex items-center text-gray-500 mt-1">
                    <span className="flex items-center">
                      {coldStorageData.location}
                    </span>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-sm text-gray-500">Capacity</span>
                    <span className="font-semibold text-gray-800">
                      {coldStorageData.coldStorageDetails.capacity}
                    </span>
                  </div>
                  <div className="flex flex-col items-center sm:items-end">
                    <span className="text-sm text-gray-500">Occupancy</span>
                    <div className="flex items-center">
                      <Badge
                        variant={
                          coldStorageData.occupancy < 50 ? "outline" : "default"
                        }
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        {coldStorageData.occupancy}%
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Component using shadcn/ui */}
        <div className="px-6 mb-2">
          <Tabs
            defaultValue={activeTab}
            value={activeTab}
            onValueChange={setActiveTab}
            className="w-full"
          >
            <TabsList className="grid grid-cols-4 mb-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="farmers">Farmers</TabsTrigger>
              <TabsTrigger value="incoming">Incoming Orders</TabsTrigger>
              <TabsTrigger value="outgoing">Outgoing Orders</TabsTrigger>
            </TabsList>

            {/* Overview Tab Content */}
            <TabsContent value="overview" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <OverviewTab />
              </div>
            </TabsContent>

            {/* Other Tab Contents */}
            <TabsContent value="farmers">
              <FarmersTab />
            </TabsContent>

            <TabsContent value="incoming">
              <IncomingOrdersTab id={coldStorageData._id} />
            </TabsContent>

            <TabsContent value="outgoing">
              <OutgoingOrdersTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SingleColdStorageScreen;