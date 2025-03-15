import { useState } from "react";
import { Search, PlusCircle, MapPin, Edit, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/common/TopBar";
import Sidebar from "../components/common/Sidebar";
import toast from "react-hot-toast";
import Loader from "../components/common/Loader";
import { BASE_URL } from "../utils/const";
import { useQuery } from "@tanstack/react-query";

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

// Transformed type for display
interface ColdStorage {
  id: string;
  name: string;
  location: string;
  capacity: string;
  occupancy: number;
  adminName: string;
  contactNumber: string;
  isActive: boolean;
}

const ColdStorageScreen = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Fetch cold storage data with React Query
  const { data, isLoading, isError } = useQuery({
    queryKey: ["coldStorages"],
    queryFn: async () => {
      const response = await fetch(`${BASE_URL}/cold-storages`);
      if (!response.ok) {
        throw new Error("Failed to fetch cold storages");
      }
      return response.json();
    },
  });

  // Transform API data to the format needed for display
  const transformedData: ColdStorage[] =
    data?.storeAdmins.map((admin: StoreAdmin) => ({
      id: admin._id,
      name: admin.coldStorageDetails.coldStorageName,
      location: admin.coldStorageDetails.coldStorageAddress,
      capacity: `${admin.coldStorageDetails.capacity} bags`,
      // Generate a random occupancy for demo purposes
      occupancy: Math.floor(Math.random() * 100),
      adminName: admin.name,
      contactNumber: admin.coldStorageDetails.coldStorageContactNumber,
      isActive: admin.isActive,
    })) || [];

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSidebarOpen && !(e.target as HTMLElement).closest("aside")) {
      setIsSidebarOpen(false);
    }
  };

  const filteredColdStorages = transformedData.filter((storage) =>
    storage.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Navigate to cold storage detail page
  const handleRowClick = (storage: ColdStorage) => {
    navigate(`/cold-storages/${storage.id}`, {
      state: { coldStorage: storage },
    });
  };

  // Handle action button clicks without triggering row navigation
  const handleActionClick = (
    e: React.MouseEvent,
    action: string,
    id: string
  ) => {
    e.stopPropagation(); // Prevent the row click event from firing

    if (action === "edit") {
      // Handle edit logic or navigation
      console.log(`Edit cold storage ${id}`);
      navigate(`/cold-storage/${id}/edit`);
    } else if (action === "delete") {
      // Handle delete logic
      console.log(`Delete cold storage ${id}`);
      // Show confirmation dialog, etc.
      toast.success("Delete functionality would be implemented here");
    }
  };

  // Calculate summary metrics
  const totalColdStorages = transformedData.length;

  // Calculate total registered farmers
  const totalRegisteredFarmers =
    data?.storeAdmins.reduce(
      (total: number, admin: StoreAdmin) =>
        total + admin.registeredFarmers.length,
      0
    ) || 0;

  // Calculate total active store admins
  const totalActiveStoreAdmins =
    data?.storeAdmins.filter((admin: StoreAdmin) => admin.isActive).length || 0;

  return (
    <div className="flex h-screen bg-gray-100" onClick={handleOutsideClick}>
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
        <main className="flex-1 overflow-y-auto p-4 bg-gray-100">
          {isLoading ? (
            <div className="flex items-center justify-center h-full">
              <Loader />
            </div>
          ) : isError ? (
            <div className="bg-red-50 p-4 rounded-lg text-red-700 text-center">
              Failed to load cold storage data. Please try again later.
            </div>
          ) : (
            <>
              {/* Summary Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Cold Storages
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {totalColdStorages}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Total Registered Farmers
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {totalRegisteredFarmers.toLocaleString()}
                  </p>
                </div>
                <div className="bg-white rounded-lg shadow p-6 flex flex-col">
                  <h3 className="text-gray-500 text-sm font-medium">
                    Active Store Admins
                  </h3>
                  <p className="text-3xl font-bold text-gray-800 mt-2">
                    {totalActiveStoreAdmins}
                  </p>
                </div>
              </div>

              {/* Search and Add Bar */}
              <div className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row justify-between items-center">
                <div className="relative w-full sm:w-64 mb-4 sm:mb-0">
                  <input
                    type="text"
                    placeholder="Search cold storages..."
                    className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                  <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
                </div>
                <button
                  onClick={() => navigate("/add-cold-storage")}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg flex items-center hover:bg-indigo-700 transition-colors"
                >
                  <PlusCircle className="h-5 w-5 mr-2" />
                  Add New Cold Storage
                </button>
              </div>

              {/* Cold Storage List */}
              <div className="bg-white rounded-lg shadow overflow-hidden">
                {filteredColdStorages.length === 0 ? (
                  <div className="py-8 text-center text-gray-500">
                    {searchQuery
                      ? "No cold storages match your search criteria"
                      : "No cold storages available"}
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Name
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Location
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Capacity
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Owner
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Contact
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Status
                          </th>
                          <th
                            scope="col"
                            className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider"
                          >
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {filteredColdStorages.map((storage) => (
                          <tr
                            key={storage.id}
                            className="hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleRowClick(storage)}
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="font-medium text-gray-900">
                                {storage.name}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center text-gray-600">
                                <MapPin className="h-4 w-4 mr-1 text-gray-400" />
                                {storage.location}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {storage.capacity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {storage.adminName}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                              {storage.contactNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                  storage.isActive
                                    ? "bg-green-100 text-green-800"
                                    : "bg-red-100 text-red-800"
                                }`}
                              >
                                {storage.isActive ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 text-center">
                              <div className="flex justify-center space-x-3">
                                <button
                                  className="text-indigo-600 hover:text-indigo-900 transition-colors focus:outline-none"
                                  onClick={(e) =>
                                    handleActionClick(e, "edit", storage.id)
                                  }
                                >
                                  <Edit className="h-5 w-5" />
                                </button>
                                <button
                                  className="text-red-600 hover:text-red-900 transition-colors focus:outline-none"
                                  onClick={(e) =>
                                    handleActionClick(e, "delete", storage.id)
                                  }
                                >
                                  <Trash2 className="h-5 w-5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
};

export default ColdStorageScreen;
