import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

  const [coldStorageData] = useState(location.state?.coldStorage || {});

  console.log("cold storage data is: ", coldStorageData);

  const [activeTab, setActiveTab] = useState(() => {
    const savedTab = localStorage.getItem(`coldStorage_${id}_activeTab`);
    return savedTab || "overview";
  });

  useEffect(() => {
    localStorage.setItem(`coldStorage_${id}_activeTab`, activeTab);
  }, [activeTab, id]);

  const handleOutsideClick = (e) => {
    if (isSidebarOpen && !e.target.closest("aside")) {
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

        {/* Cold Storage Info Cards - Dashboard Style */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 px-6 pb-4">
          {/* Storage Info Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Storage Details
                  </h3>
                  <div className="mt-1">
                    <h2 className="text-xl font-bold text-gray-800">
                      {coldStorageData.coldStorageDetails.coldStorageName}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {coldStorageData.coldStorageDetails.coldStorageAddress}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4V5h12v10z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Owner Info Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Owner</h3>
                  <div className="mt-1">
                    <h2 className="text-xl font-bold text-gray-800">
                      {coldStorageData.name}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {coldStorageData.mobileNumber}
                    </p>
                  </div>
                </div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Capacity/Occupancy Card */}
          <Card className="shadow-sm">
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-sm font-medium text-gray-500">
                    Capacity
                  </h3>
                  <div className="mt-1">
                    <h2 className="text-xl font-bold text-gray-800">
                      {coldStorageData.coldStorageDetails.capacity}
                    </h2>
                    <div className="mt-2">
                      <Badge
                        variant={
                          coldStorageData.occupancy < 50 ? "outline" : "default"
                        }
                        className="bg-green-100 text-green-800 border-green-200"
                      >
                        {coldStorageData.occupancy}% Occupied
                      </Badge>
                    </div>
                  </div>
                </div>
                <div className="p-2 bg-gray-100 rounded-full">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-gray-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h14a1 1 0 001-1V4a1 1 0 00-1-1H3zm0 2h14v10H3V5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs Component using shadcn/ui */}
        <div className="px-6 mb-6">
          <Card className="shadow-md  overflow-hidden">
            <Tabs
              defaultValue={activeTab}
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full"
            >
              <TabsList className="flex w-full bg-white p-0 border-b border-gray-200 rounded-none">
                <TabsTrigger
                  value="overview"
                  className="flex-1 px-6 py-4 text-sm font-medium transition-all relative
                  data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:font-semibold
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-indigo-600 data-[state=inactive]:hover:bg-gray-50"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 10a8 8 0 018-8v8h8a8 8 0 11-16 0z" />
                      <path d="M12 2.252A8.014 8.014 0 0117.748 8H12V2.252z" />
                    </svg>
                    Overview
                  </span>
                  {activeTab === "overview" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="farmers"
                  className="flex-1 px-6 py-4 text-sm font-medium transition-all relative
                  data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:font-semibold
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-indigo-600 data-[state=inactive]:hover:bg-gray-50"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                    </svg>
                    Farmers
                  </span>
                  {activeTab === "farmers" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="incoming"
                  className="flex-1 px-6 py-4 text-sm font-medium transition-all relative
                  data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:font-semibold
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-indigo-600 data-[state=inactive]:hover:bg-gray-50"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-8.707l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13a1 1 0 102 0V9.414l1.293 1.293a1 1 0 001.414-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Incoming Orders
                  </span>
                  {activeTab === "incoming" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                  )}
                </TabsTrigger>
                <TabsTrigger
                  value="outgoing"
                  className="flex-1 px-6 py-4 text-sm font-medium transition-all relative
                  data-[state=active]:bg-white data-[state=active]:text-indigo-700 data-[state=active]:font-semibold
                  data-[state=inactive]:text-gray-600 data-[state=inactive]:hover:text-indigo-600 data-[state=inactive]:hover:bg-gray-50"
                >
                  <span className="flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Outgoing Orders
                  </span>
                  {activeTab === "outgoing" && (
                    <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-indigo-600"></div>
                  )}
                </TabsTrigger>
              </TabsList>

              {/* Tab Contents with improved styling */}
              <div className="bg-white p-4">
                <TabsContent value="overview" className="space-y-4 mt-0">
                  <div className="grid md:grid-cols-2 gap-4">
                    <OverviewTab />
                  </div>
                </TabsContent>

                <TabsContent value="farmers" className="mt-0">
                  <FarmersTab />
                </TabsContent>

                <TabsContent value="incoming" className="mt-0">
                  <IncomingOrdersTab coldStorageData={coldStorageData} />
                </TabsContent>

                <TabsContent value="outgoing" className="mt-0">
                  <OutgoingOrdersTab />
                </TabsContent>
              </div>
            </Tabs>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SingleColdStorageScreen;
