import { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Phone,
  User,
  MapPin,
  Edit,
  X,
  Loader2,
  BadgeCheck,
  Clock,
  UserCog,
  Package,
  ChevronDown,
  ChevronUp,
  FileText,
  ShoppingBag,
  MapPinned,
  Tag,
  BarChart2,
  TrendingUp,
  Trash2,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import TopBar from "../components/common/TopBar";
import Sidebar from "../components/common/Sidebar";
import { BASE_URL } from "../utils/const";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  role: string;
  imageUrl: string;
  registeredStoreAdmins: string[];
  farmerId: string;
  isVerified: boolean;
  createdAt: string;
  updatedAt: string;
}

interface BagSize {
  size: string;
  quantity: {
    initialQuantity: number;
    currentQuantity: number;
  };
}

interface OrderDetail {
  variety: string;
  bagSizes: BagSize[];
  location: string;
}

interface Voucher {
  type: string;
  voucherNumber: number;
}

interface Order {
  _id: string;
  coldStorageId: string;
  farmerId: {
    _id: string;
    name: string;
  };
  dateOfSubmission: string;
  remarks: string;
  orderDetails: OrderDetail[];
  voucher: Voucher;
}

interface OrdersResponse {
  status: string;
  message: string;
  data: Order[];
}

// Order frequency interface
interface FrequencyData {
  period: string;
  count: number;
  totalQuantity: number;
}

interface OrderFrequencyResponse {
  status: string;
  message: string;
  data: {
    orderCount: number;
    monthlyFrequency: FrequencyData[];
    quarterlyFrequency: FrequencyData[];
    avgOrderInterval: number;
  };
}

const SingleFarmerScreen = () => {
  const routerLocation = useLocation();
  const navigate = useNavigate();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [editedFarmer, setEditedFarmer] = useState<Farmer | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showOrders, setShowOrders] = useState(false);
  const [expandedOrders, setExpandedOrders] = useState<{[key: string]: boolean}>({});
  const [showOrderFrequency, setShowOrderFrequency] = useState(false);
  const [frequencyPeriod, setFrequencyPeriod] = useState<'monthly' | 'quarterly'>('monthly');

  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const token = adminInfo?.token;
  const coldStorage = routerLocation.state?.coldStorage;
  const coldStorageId = coldStorage?._id;

  const farmerInfo: Farmer = routerLocation.state?.farmer;

  // Use React Query for fetching orders
  const {
    data: ordersData,
    isLoading: loadingOrders,
    isError: isOrdersError,
    error: ordersError,
    refetch: refetchOrders
  } = useQuery<OrdersResponse, Error>({
    queryKey: ["farmerOrders", farmerInfo?._id, coldStorageId],
    queryFn: async () => {
      if (!farmerInfo || !coldStorageId) {
        throw new Error("Cold storage ID not available. Cannot fetch orders.");
      }

      const response = await axios.get<OrdersResponse>(
        `${BASE_URL}/cold-storages/${coldStorageId}/farmers/${farmerInfo._id}/orders`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    enabled: false, // Don't run the query on component mount
  });

  // Use React Query for fetching order frequency data
  const {
    data: orderFrequencyData,
    isLoading: loadingFrequency,
    isError: isFrequencyError,
    error: frequencyError,
    refetch: refetchFrequency
  } = useQuery<OrderFrequencyResponse, Error>({
    queryKey: ["orderFrequency", farmerInfo?._id, coldStorageId],
    queryFn: async () => {
      if (!farmerInfo || !coldStorageId) {
        throw new Error("Required IDs not available. Cannot fetch order frequency data.");
      }

      const response = await axios.get<OrderFrequencyResponse>(
        `${BASE_URL}/cold-storages/${coldStorageId}/farmers/${farmerInfo._id}/order-frequency`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      return response.data;
    },
    enabled: false, // Don't run the query on component mount
  });

  // Initialize expanded state when orders data changes
  useEffect(() => {
    if (ordersData?.data) {
      const initialExpandedState: {[key: string]: boolean} = {};
      ordersData.data.forEach((order: Order) => {
        initialExpandedState[order._id] = false;
      });
      setExpandedOrders(initialExpandedState);
    }
  }, [ordersData]);

  // Handle error display
  useEffect(() => {
    if (isOrdersError && ordersError) {
      const errorMessage = ordersError.message || "An unknown error occurred";
      toast.error(errorMessage);
    }
  }, [isOrdersError, ordersError]);

  const orders = ordersData?.data || [];

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSidebarOpen && !(e.target as HTMLElement).closest("aside")) {
      setIsSidebarOpen(false);
    }
  };

  const handleOpenEditModal = () => {
    setEditedFarmer({ ...farmerInfo });
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteFarmer = async () => {
    setDeleting(true);
    setError(null);

    try {
      const response = await fetch(`${BASE_URL}/farmers/${farmerInfo._id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete farmer");
      }

      // Close the modal first
      setIsDeleteModalOpen(false);

      // Show success toast notification and wait for a short delay
      toast.success("Farmer deleted successfully");

      // Wait for 1.5 seconds to ensure toast is visible before navigation
      await new Promise(resolve => setTimeout(resolve, 1500));

      // Navigate back
      navigate(-1);

    } catch (err) {
      console.error("Error deleting farmer:", err);
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setDeleting(false);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    field: string
  ) => {
    if (editedFarmer) {
      setEditedFarmer({
        ...editedFarmer,
        [field]: e.target.value,
      });
    }
  };

  const handleCheckboxChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    field: string
  ) => {
    if (editedFarmer) {
      setEditedFarmer({
        ...editedFarmer,
        [field]: e.target.checked,
      });
    }
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    if (!editedFarmer) return;

    try {
      // Prepare the data with only allowed fields
      const updateData = {
        name: editedFarmer.name,
        address: editedFarmer.address,
        mobileNumber: editedFarmer.mobileNumber,
        imageUrl: editedFarmer.imageUrl,
        isVerified: editedFarmer.isVerified,
      };

      // Send the update request to the backend
      const response = await fetch(`${BASE_URL}/farmers/${editedFarmer._id}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to update farmer information");
      }

      // Update the local state with the updated farmer
      navigate(0); // Refresh the page to show updated info

      // Show success toast notification
      toast.success("Farmer information updated successfully");
      setIsEditModalOpen(false);
    } catch (err) {
      console.error("Error updating farmer information:", err);
      // Show error toast notification
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred";
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Handle go back
  const handleGoBack = () => {
    // Navigate back - similar to browser back button
    navigate(-1);
  };

  // Toggle order expansion
  const toggleOrderExpansion = (orderId: string) => {
    setExpandedOrders(prev => ({
      ...prev,
      [orderId]: !prev[orderId]
    }));
  };

  // Handle view orders button click
  const handleViewOrders = () => {
    if (showOrders) {
      setShowOrders(false);
    } else {
      setShowOrders(true);
      refetchOrders();
    }
  };

  // Handle view order frequency button click
  const handleViewOrderFrequency = () => {
    if (showOrderFrequency) {
      setShowOrderFrequency(false);
    } else {
      setShowOrderFrequency(true);
      refetchFrequency();
    }
  };

  // Toggle frequency period
  const toggleFrequencyPeriod = () => {
    setFrequencyPeriod(prev => prev === 'monthly' ? 'quarterly' : 'monthly');
  };

  // Function to calculate additional insights
  const calculateFrequencyInsights = () => {
    if (!orderFrequencyData?.data) return null;

    const { monthlyFrequency, quarterlyFrequency, orderCount } = orderFrequencyData.data;

    // Find month/quarter with highest order count
    const highestMonthly = [...monthlyFrequency].sort((a, b) => b.count - a.count)[0];
    const highestQuarterly = [...quarterlyFrequency].sort((a, b) => b.count - a.count)[0];

    // Find month/quarter with highest quantity
    const highestQuantityMonthly = [...monthlyFrequency].sort((a, b) => b.totalQuantity - a.totalQuantity)[0];
    const highestQuantityQuarterly = [...quarterlyFrequency].sort((a, b) => b.totalQuantity - a.totalQuantity)[0];

    // Calculate average quantity per order
    const totalQuantity = monthlyFrequency.reduce((sum, item) => sum + item.totalQuantity, 0);
    const avgQuantityPerOrder = orderCount > 0 ? Math.round(totalQuantity / orderCount) : 0;

    // Calculate growth rate if multiple periods exist
    let growthRate = null;
    if (monthlyFrequency.length >= 2) {
      const current = monthlyFrequency[monthlyFrequency.length - 1];
      const previous = monthlyFrequency[monthlyFrequency.length - 2];
      growthRate = previous.count > 0
        ? ((current.count - previous.count) / previous.count) * 100
        : null;
    }

    return {
      highestMonthly,
      highestQuarterly,
      highestQuantityMonthly,
      highestQuantityQuarterly,
      totalQuantity,
      avgQuantityPerOrder,
      growthRate
    };
  };

  const frequencyInsights = calculateFrequencyInsights();

  if (!farmerInfo) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="rounded-lg bg-white p-8 shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Farmer Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The farmer information you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to="/farmers"
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Farmers List</span>
          </Link>
        </div>
      </div>
    );
  }

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
          title="Farmer Details"
        />

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Back Button and Action Buttons */}
          <div className="py-4 space-y-4 mb-2">
            {/* Back button on top */}
            <div>
              <button
                onClick={handleGoBack}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Farmers List
              </button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-2">
              <button
                onClick={handleOpenEditModal}
                className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors duration-200 shadow-sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Farmer
              </button>

              <button
                onClick={handleOpenDeleteModal}
                className="inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors duration-200 shadow-sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Farmer
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Farmer Header */}
            <div className="p-6 border-b border-gray-200 bg-indigo-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    {farmerInfo.name}
                  </h2>
                  <div className="flex items-center mt-1 text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>Registered on {formatDate(farmerInfo.createdAt)}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span
                    className={`px-3 py-1 inline-flex items-center rounded-full text-sm font-medium ${
                      farmerInfo.isVerified
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {farmerInfo.isVerified ? (
                      <>
                        <BadgeCheck className="h-4 w-4 mr-1" />
                        Verified
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 mr-1" />
                        Unverified
                      </>
                    )}
                  </span>
                </div>
              </div>
            </div>

            {/* Farmer Content */}
            <div className="p-6">
              {/* Basic Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <User className="h-5 w-5 mr-2 text-indigo-600" />
                  Basic Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Farmer ID</p>
                      <p className="font-medium">{farmerInfo.farmerId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Role</p>
                      <p className="font-medium capitalize">{farmerInfo.role}</p>
                    </div>
                    <div className="flex items-start">
                      <Phone className="h-4 w-4 text-gray-400 mt-0.5 mr-1" />
                      <div>
                        <p className="text-sm text-gray-500">Contact Number</p>
                        <p className="font-medium">{farmerInfo.mobileNumber}</p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{farmerInfo.address}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Additional Information */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                  <UserCog className="h-5 w-5 mr-2 text-indigo-600" />
                  Additional Information
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <p className="text-sm text-gray-500">Registration Date</p>
                      <p className="font-medium">{formatDate(farmerInfo.createdAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Last Updated</p>
                      <p className="font-medium">{formatDate(farmerInfo.updatedAt)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Registered Admins</p>
                      <p className="font-medium">
                        {farmerInfo.registeredStoreAdmins?.length || 0} admin(s)
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  onClick={handleViewOrderFrequency}
                  className={`inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none transition-colors ${
                    showOrderFrequency
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {showOrderFrequency ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Hide Frequency Analysis
                    </>
                  ) : (
                    <>
                      <BarChart2 className="mr-2 h-4 w-4" />
                      View Frequency Analysis
                    </>
                  )}
                </button>

                <button
                  type="button"
                  onClick={handleViewOrders}
                  className={`inline-flex items-center justify-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium focus:outline-none transition-colors ${
                    showOrders
                      ? "border-indigo-600 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                      : "border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {showOrders ? (
                    <>
                      <ChevronUp className="mr-2 h-4 w-4" />
                      Hide Orders
                    </>
                  ) : (
                    <>
                      <ChevronDown className="mr-2 h-4 w-4" />
                      View Orders
                    </>
                  )}
                </button>

                {!farmerInfo.isVerified && (
                  <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                    Verify Farmer
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Order Frequency Analysis Section */}
          {showOrderFrequency && (
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <BarChart2 className="h-5 w-5 mr-2 text-indigo-600" />
                      <h3 className="text-lg font-semibold text-gray-800">Order Frequency Analysis</h3>
                    </div>
                    <div>
                      <button
                        onClick={toggleFrequencyPeriod}
                        className="text-sm px-3 py-1 rounded bg-indigo-100 text-indigo-700 hover:bg-indigo-200 transition"
                      >
                        {frequencyPeriod === 'monthly' ? 'Switch to Quarterly' : 'Switch to Monthly'}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="p-6">
                  {loadingFrequency ? (
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      <span className="ml-3 text-gray-600">Loading frequency data...</span>
                    </div>
                  ) : isFrequencyError ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-center">
                      <X className="h-5 w-5 mr-2" />
                      <p>{frequencyError instanceof Error ? frequencyError.message : "Failed to load frequency data"}</p>
                    </div>
                  ) : orderFrequencyData?.data ? (
                    <div className="space-y-8">
                      {/* Key Metrics Cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                          <div className="flex justify-between items-start mb-2">
                            <h3 className="text-sm font-medium text-gray-500">Total Orders</h3>
                            <div className="p-2 rounded-full bg-indigo-50">
                              <Package className="h-4 w-4 text-indigo-600" />
                            </div>
                          </div>
                          <div className="mt-1">
                            <div className="text-2xl font-bold text-gray-800">{orderFrequencyData.data.orderCount}</div>
                            <p className="text-sm text-gray-600 mt-1">Orders placed so far</p>
                          </div>
                        </div>

                        {frequencyInsights && (
                          <>
                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-medium text-gray-500">Avg. Quantity Per Order</h3>
                                <div className="p-2 rounded-full bg-pink-50">
                                  <ShoppingBag className="h-4 w-4 text-pink-600" />
                                </div>
                              </div>
                              <div className="mt-1">
                                <div className="text-2xl font-bold text-gray-800">{frequencyInsights.avgQuantityPerOrder}</div>
                                <p className="text-sm text-gray-600 mt-1">Bags per order</p>
                              </div>
                            </div>

                            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                              <div className="flex justify-between items-start mb-2">
                                <h3 className="text-sm font-medium text-gray-500">
                                  {frequencyPeriod === 'monthly' ? 'Peak Month' : 'Peak Quarter'}
                                </h3>
                                <div className="p-2 rounded-full bg-emerald-50">
                                  <TrendingUp className="h-4 w-4 text-emerald-600" />
                                </div>
                              </div>
                              <div className="mt-1">
                                <div className="text-2xl font-bold text-gray-800">
                                  {frequencyPeriod === 'monthly'
                                    ? frequencyInsights.highestMonthly.period
                                    : frequencyInsights.highestQuarterly.period}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">
                                  {frequencyPeriod === 'monthly'
                                    ? `${frequencyInsights.highestMonthly.count} orders / ${frequencyInsights.highestMonthly.totalQuantity} bags`
                                    : `${frequencyInsights.highestQuarterly.count} orders / ${frequencyInsights.highestQuarterly.totalQuantity} bags`}
                                </p>
                              </div>
                            </div>
                          </>
                        )}
                      </div>

                      {/* Charts Section */}
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Line chart for order count */}
                        <div className="lg:col-span-2 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                          <h4 className="text-base font-semibold text-gray-800 mb-3">
                            Order Frequency Trend ({frequencyPeriod === 'monthly' ? 'Monthly' : 'Quarterly'})
                          </h4>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <LineChart
                                data={frequencyPeriod === 'monthly'
                                  ? orderFrequencyData.data.monthlyFrequency
                                  : orderFrequencyData.data.quarterlyFrequency}
                                margin={{ top: 10, right: 30, left: 10, bottom: 25 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                  dataKey="period"
                                  tick={{ fill: '#4B5563', fontSize: 11 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis
                                  yAxisId="left"
                                  tick={{ fill: '#4B5563', fontSize: 11 }}
                                  orientation="left"
                                  stroke="#8884d8"
                                />
                                <YAxis
                                  yAxisId="right"
                                  orientation="right"
                                  tick={{ fill: '#4B5563', fontSize: 11 }}
                                  stroke="#82ca9d"
                                />
                                <Tooltip />
                                <Legend />
                                <Line
                                  yAxisId="left"
                                  type="monotone"
                                  dataKey="count"
                                  name="Number of Orders"
                                  stroke="#8884d8"
                                  activeDot={{ r: 8 }}
                                  strokeWidth={2}
                                />
                                <Line
                                  yAxisId="right"
                                  type="monotone"
                                  dataKey="totalQuantity"
                                  name="Total Bags"
                                  stroke="#82ca9d"
                                  strokeWidth={2}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        </div>

                        {/* Area chart for total quantity */}
                        <div className="lg:col-span-1 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                          <h4 className="text-base font-semibold text-gray-800 mb-3">Volume Trend</h4>
                          <div className="h-80">
                            <ResponsiveContainer width="100%" height="100%">
                              <AreaChart
                                data={frequencyPeriod === 'monthly'
                                  ? orderFrequencyData.data.monthlyFrequency
                                  : orderFrequencyData.data.quarterlyFrequency}
                                margin={{ top: 10, right: 30, left: 0, bottom: 25 }}
                              >
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                  dataKey="period"
                                  tick={{ fill: '#4B5563', fontSize: 11 }}
                                  angle={-45}
                                  textAnchor="end"
                                  height={60}
                                />
                                <YAxis tick={{ fill: '#4B5563', fontSize: 11 }} />
                                <Tooltip />
                                <Area
                                  type="monotone"
                                  dataKey="totalQuantity"
                                  name="Total Bags"
                                  stroke="#8884d8"
                                  fill="#8884d8"
                                  fillOpacity={0.3}
                                />
                              </AreaChart>
                            </ResponsiveContainer>
                          </div>
                        </div>
                      </div>

                      {/* Insights Box */}
                      {frequencyInsights && (
                        <div className="bg-blue-50 rounded-lg p-4 border border-blue-100">
                          <h4 className="font-medium text-blue-800 mb-3 text-sm">Order Pattern Insights</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <TrendingUp className="h-4 w-4 text-blue-700 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-blue-600">Volume Trend</p>
                                  <p className="text-sm text-blue-800">
                                    {frequencyInsights.growthRate !== null
                                      ? (frequencyInsights.growthRate > 0
                                        ? `${frequencyInsights.growthRate.toFixed(1)}% increase in order frequency`
                                        : `${Math.abs(frequencyInsights.growthRate).toFixed(1)}% decrease in order frequency`)
                                      : "Not enough data to calculate trend"}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="space-y-3">
                              <div className="flex items-start gap-2">
                                <ShoppingBag className="h-4 w-4 text-blue-700 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-blue-600">Order Volume</p>
                                  <p className="text-sm text-blue-800">
                                    Total of {frequencyInsights.totalQuantity.toLocaleString()} bags ordered across {orderFrequencyData.data.orderCount} orders
                                  </p>
                                </div>
                              </div>

                              <div className="flex items-start gap-2">
                                <Package className="h-4 w-4 text-blue-700 mt-0.5" />
                                <div>
                                  <p className="text-xs font-medium text-blue-600">Peak Activity</p>
                                  <p className="text-sm text-blue-800">
                                    Highest activity in {frequencyPeriod === 'monthly'
                                      ? frequencyInsights.highestQuantityMonthly.period
                                      : frequencyInsights.highestQuantityQuarterly.period}
                                    with {frequencyPeriod === 'monthly'
                                      ? frequencyInsights.highestQuantityMonthly.totalQuantity
                                      : frequencyInsights.highestQuantityQuarterly.totalQuantity} bags
                                  </p>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4">
                        <BarChart2 className="h-6 w-6 text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">No Frequency Data Found</h3>
                      <p className="text-gray-600">This farmer's order frequency data is not available.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Orders Section */}
          {showOrders && (
            <div className="mt-6">
              <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200 bg-indigo-50">
                  <div className="flex items-center">
                    <Package className="h-5 w-5 mr-2 text-indigo-600" />
                    <h3 className="text-lg font-semibold text-gray-800">Farmer Orders</h3>
                  </div>
                </div>

                <div className="p-6">
                  {loadingOrders ? (
                    <div className="flex justify-center items-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                      <span className="ml-3 text-gray-600">Loading orders...</span>
                    </div>
                  ) : isOrdersError ? (
                    <div className="p-4 bg-red-50 text-red-700 rounded-md flex items-center">
                      <X className="h-5 w-5 mr-2" />
                      <p>{ordersError instanceof Error ? ordersError.message : "Failed to load orders"}</p>
                    </div>
                  ) : orders.length === 0 ? (
                    <div className="p-6 text-center">
                      <div className="inline-flex items-center justify-center p-3 bg-indigo-50 rounded-full mb-4">
                        <Package className="h-6 w-6 text-indigo-500" />
                      </div>
                      <h3 className="text-lg font-medium text-gray-800 mb-1">No Orders Found</h3>
                      <p className="text-gray-600">This farmer doesn't have any orders yet.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-6">
                      {orders.map((order: Order) => (
                        <div key={order._id} className="bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
                          {/* Order header - always visible */}
                          <div
                            className="p-4 bg-gray-50 flex items-center justify-between cursor-pointer hover:bg-gray-100 transition-colors"
                            onClick={() => toggleOrderExpansion(order._id)}
                          >
                            <div className="flex items-center">
                              <div className="bg-indigo-100 text-indigo-700 rounded-full p-2 mr-3">
                                <FileText className="h-5 w-5" />
                              </div>
                              <div>
                                <div className="flex items-center">
                                  <span className="font-semibold text-gray-800 mr-2">
                                    {order.voucher.type} #{order.voucher.voucherNumber}
                                  </span>
                                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                                    {order.dateOfSubmission}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-600 mt-0.5">
                                  {order.remarks ? `Remarks: ${order.remarks}` : 'No remarks'}
                                </div>
                              </div>
                            </div>
                            <div>
                              {expandedOrders[order._id] ? (
                                <ChevronUp className="h-5 w-5 text-gray-500" />
                              ) : (
                                <ChevronDown className="h-5 w-5 text-gray-500" />
                              )}
                            </div>
                          </div>

                          {/* Order details - visible when expanded */}
                          {expandedOrders[order._id] && (
                            <div className="p-4 border-t border-gray-200">
                              {order.orderDetails.map((detail: OrderDetail, idx: number) => (
                                <div key={idx} className="mb-4 last:mb-0">
                                  <div className="flex items-center mb-2">
                                    <Tag className="h-4 w-4 text-gray-500 mr-1" />
                                    <span className="font-medium text-gray-800">{detail.variety}</span>
                                  </div>

                                  <div className="flex items-center mb-2">
                                    <MapPinned className="h-4 w-4 text-gray-500 mr-1" />
                                    <span className="text-sm text-gray-600">Location: {detail.location || 'Not specified'}</span>
                                  </div>

                                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
                                    {detail.bagSizes.map((bag: BagSize, bagIdx: number) => (
                                      <div key={bagIdx} className="bg-gray-50 rounded-md p-3 border border-gray-200">
                                        <p className="text-xs text-gray-500 uppercase">{bag.size}</p>
                                        <div className="flex items-center mt-1">
                                          <ShoppingBag className="h-4 w-4 text-indigo-600 mr-1" />
                                          <span className="font-medium">{bag.quantity.currentQuantity}</span>
                                          <span className="text-xs text-gray-500 ml-1">/ {bag.quantity.initialQuantity}</span>
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editedFarmer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-screen overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-indigo-50">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Farmer Information
              </h2>
              <button
                onClick={handleCloseEditModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]">
              <form onSubmit={handleSubmitEdit}>
                <div className="space-y-4">
                  {/* Non-editable fields */}
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <h3 className="text-sm font-medium text-gray-700 mb-2">Non-editable Information</h3>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <p className="text-xs text-gray-500">Farmer ID</p>
                        <p className="text-sm font-medium">{editedFarmer.farmerId}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Registration Date</p>
                        <p className="text-sm font-medium">{formatDate(editedFarmer.createdAt)}</p>
                      </div>
                    </div>
                  </div>

                  {/* Name */}
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                      Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="name"
                      value={editedFarmer.name}
                      onChange={(e) => handleInputChange(e, "name")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Mobile Number */}
                  <div>
                    <label htmlFor="mobileNumber" className="block text-sm font-medium text-gray-700 mb-1">
                      Mobile Number <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      id="mobileNumber"
                      value={editedFarmer.mobileNumber}
                      onChange={(e) => handleInputChange(e, "mobileNumber")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Address */}
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Address <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      id="address"
                      value={editedFarmer.address}
                      onChange={(e) => handleInputChange(e, "address")}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      required
                    />
                  </div>

                  {/* Image URL */}
                  <div>
                    <label htmlFor="imageUrl" className="block text-sm font-medium text-gray-700 mb-1">
                      Profile Image URL
                    </label>
                    <input
                      type="text"
                      id="imageUrl"
                      value={editedFarmer.imageUrl}
                      onChange={(e) => handleInputChange(e, "imageUrl")}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  {/* Verification Status */}
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="isVerified"
                      checked={editedFarmer.isVerified}
                      onChange={(e) => handleCheckboxChange(e, "isVerified")}
                      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isVerified" className="ml-2 block text-sm text-gray-700">
                      Verified Farmer
                    </label>
                  </div>
                </div>

                {/* Error message */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                    {error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 flex justify-end space-x-3 border-t border-gray-200 pt-4">
                  <button
                    type="button"
                    onClick={handleCloseEditModal}
                    className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      "Save Changes"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-50">
              <div className="flex items-center">
                <AlertTriangle className="h-6 w-6 text-red-600 mr-2" />
                <h2 className="text-xl font-bold text-gray-800">
                  Delete Farmer
                </h2>
              </div>
              <button
                onClick={handleCloseDeleteModal}
                className="text-gray-500 hover:text-gray-700 focus:outline-none"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              <div className="mb-4">
                <p className="text-gray-700 mb-2">
                  Are you sure you want to delete this farmer?
                </p>
                <p className="text-sm text-gray-500">
                  This action cannot be undone. All associated data will be permanently removed.
                </p>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                  {error}
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={handleCloseDeleteModal}
                  className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                  disabled={deleting}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleDeleteFarmer}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none disabled:bg-red-400"
                  disabled={deleting}
                >
                  {deleting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Deleting...
                    </>
                  ) : (
                    <>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Farmer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SingleFarmerScreen;