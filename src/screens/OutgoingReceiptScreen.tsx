import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Truck,
  Warehouse,
  Edit,
  X,
  Loader2,
  Trash2,
} from "lucide-react";
import toast from "react-hot-toast";
import TopBar from "../components/common/TopBar";
import Sidebar from "../components/common/Sidebar";
import { BASE_URL } from "../utils/const";
import { useSelector } from "react-redux";
import { RootState } from "@/store";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Define types based on your data structure
interface BagSize {
  size: string;
  quantityRemoved: number;
}

interface IncomingBagSize {
  size: string;
  currentQuantity: number;
  initialQuantity: number;
  _id: string;
}

interface OrderDetail {
  variety: string;
  incomingOrder: {
    _id: string;
    location: string;
    voucher: {
      type: string;
      voucherNumber: number;
    };
    incomingBagSizes: IncomingBagSize[];
  };
  bagSizes: BagSize[];
}

interface OutgoingOrder {
  _id: string;
  coldStorageId: string;
  farmerId: string;
  dateOfExtraction: string;
  remarks: string;
  orderDetails: OrderDetail[];
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
  voucher: {
    type: string;
    voucherNumber: number;
  };
}

// Define interface for Farmer data
interface Farmer {
  _id: string;
  name: string;
  address: string;
  mobileNumber: string;
  farmerId: string;
  // Add other properties as needed
}

interface FarmerResponse {
  status: string;
  message: string;
  data: Farmer;
}

const OutgoingReceiptScreen = () => {
  const routerLocation = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [receipt, setReceipt] = useState<OutgoingOrder>();
  const [loading, setLoading] = useState(true);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState<OutgoingOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const adminInfo = useSelector((state: RootState) => state.auth.adminInfo);
  const token = adminInfo?.token;

  const navigate = useNavigate();

  // Fetch farmer data using React Query
  const { data: farmerData, isLoading: farmerLoading} = useQuery({
    queryKey: ["farmer", receipt?.farmerId],
    queryFn: async () => {
      if (!receipt?.farmerId) return null;
      
      const response = await axios.get<FarmerResponse>(
        `${BASE_URL}/farmers/${receipt.farmerId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      if (response.status !== 200) {
        throw new Error("Failed to fetch farmer information");
      }

      return response.data;
    },
    enabled: !!receipt?.farmerId, // Only run query if farmerId exists
  });

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSidebarOpen && !(e.target as HTMLElement).closest("aside")) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (routerLocation.state?.outgoingOrder) {
      setReceipt(routerLocation.state.outgoingOrder);
      setEditedReceipt(JSON.parse(JSON.stringify(routerLocation.state.outgoingOrder)));
      setLoading(false);
    }
  }, [routerLocation.state]);

  const handleOpenEditModal = () => {
    setEditedReceipt(JSON.parse(JSON.stringify(receipt)));
    setIsEditModalOpen(true);
  };

  const handleCloseEditModal = () => {
    setIsEditModalOpen(false);
  };

  const handleSubmitEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    if (!editedReceipt) return;
    
    try {
      // Prepare the data object based on the required format
      const updateData = {
        remarks: editedReceipt.remarks,
        dateOfExtraction: editedReceipt.dateOfExtraction,
        orderDetails: editedReceipt.orderDetails.map(detail => ({
          variety: detail.variety,
          incomingOrder: {
            _id: detail.incomingOrder._id,
          },
          bagSizes: detail.bagSizes.map(bag => ({
            size: bag.size,
            quantityRemoved: bag.quantityRemoved
          }))
        }))
      };
      
      // Send the update request to the backend
      const response = await fetch(`${BASE_URL}/outgoing-orders/${editedReceipt._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(updateData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to update receipt');
      }
      
      // Update the local state with the updated receipt
      setReceipt(data.data);
      setIsEditModalOpen(false);
      
      // Show success toast notification
      toast.success("Receipt updated successfully");
    } catch (err) {
      console.error('Error updating receipt:', err);
      // Show error toast notification
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>, field: string) => {
    if (editedReceipt) {
      setEditedReceipt({
        ...editedReceipt,
        [field]: e.target.value,
      });
    }
  };

  const handleBagSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    orderIndex: number,
    bagIndex: number,
    field: 'quantityRemoved'
  ) => {
    if (editedReceipt) {
      const updatedOrderDetails = [...editedReceipt.orderDetails];
      const updatedBagSizes = [...updatedOrderDetails[orderIndex].bagSizes];
      
      updatedBagSizes[bagIndex] = {
        ...updatedBagSizes[bagIndex],
        [field]: parseInt(e.target.value) || 0,
      };
      
      updatedOrderDetails[orderIndex] = {
        ...updatedOrderDetails[orderIndex],
        bagSizes: updatedBagSizes,
      };
      
      setEditedReceipt({
        ...editedReceipt,
        orderDetails: updatedOrderDetails,
      });
    }
  };

  // Extract the farmer name
  const farmerName = farmerData?.data?.name || "Farmer Name";
  const farmerContact = farmerData?.data?.mobileNumber || "Not provided";
  const farmerAddress = farmerData?.data?.address || "Not provided";

  const handleOpenDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const handleCloseDeleteModal = () => {
    setIsDeleteModalOpen(false);
  };

  const handleDeleteOrder = async () => {
    if (!receipt) return;
    
    setDeleting(true);
    try {
      const response = await fetch(`${BASE_URL}/outgoing-orders/${receipt._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to delete order');
      }

      toast.success("Order deleted successfully");
      
      navigate(`/cold-storages/${receipt.coldStorageId}`, {
        state: { coldStorage: routerLocation.state?.coldStorage }
      });
    } catch (err) {
      console.error('Error deleting order:', err);
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      toast.error(errorMessage);
      setDeleting(false);
      setIsDeleteModalOpen(false);
    }
  };

  if (loading || farmerLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-700">Loading receipt details...</p>
        </div>
      </div>
    );
  }

  if (!receipt) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="rounded-lg bg-white p-8 shadow-md text-center">
          <h2 className="text-xl font-bold text-red-600 mb-2">
            Receipt Not Found
          </h2>
          <p className="text-gray-600 mb-4">
            The receipt you're looking for doesn't exist or has been removed.
          </p>
          <Link
            to={`/cold-storages/${routerLocation.state?.coldStorageId || ''}`}
            state={{ coldStorage: routerLocation.state?.coldStorage }}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="h-5 w-5 mr-1" />
            <span>Back to Cold Storage</span>
          </Link>
        </div>
      </div>
    );
  }

  // Format date from DD.MM.YY to Month DD, YYYY
  const formatDate = (dateString: string) => {
    if (!dateString) return "N/A";

    // Handle the date format "DD.MM.YY"
    const parts = dateString.split(".");
    if (parts.length === 3) {
      const day = parseInt(parts[0]);
      const month = parseInt(parts[1]) - 1; // JS months are 0-indexed
      const year = parseInt(`20${parts[2]}`); // Assuming 20XX for year

      return new Date(year, month, day).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    }

    // Fallback for other date formats
    return new Date(dateString).toLocaleDateString(undefined, {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  // Extract the main variety from the first order detail
  const mainVariety = receipt.orderDetails[0]?.variety || "Unknown";
  // Use first location from order details
  const location = receipt.orderDetails[0]?.incomingOrder?.location || "Not specified";

  // Calculate total quantities removed
  const totalQuantityRemoved = receipt.orderDetails.reduce(
    (total, orderDetail) =>
      total +
      orderDetail.bagSizes.reduce(
        (subtotal, bag) => subtotal + bag.quantityRemoved,
        0
      ),
    0
  );

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
          title="Outgoing Receipt Details"
        />

        {/* Scrollable Content Area - includes buttons and receipt details */}
        <div className="flex-1 overflow-y-auto px-6 pb-6">
          {/* Back Button, Title, and Edit Button - now inside scrollable area */}
          <div className="py-4 space-y-4 mb-2">
            {/* Back button on top */}
            <div>
              <Link
                to={`/cold-storages/${receipt.coldStorageId}`}
                state={{ coldStorage: routerLocation.state?.coldStorage }}
                className="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-indigo-700 transition-colors duration-200 shadow-sm"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Cold Storage
              </Link>
            </div>
            
            {/* Edit and Delete buttons in a single line below */}
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleOpenEditModal}
                className="inline-flex items-center justify-center rounded-md bg-amber-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors duration-200 shadow-sm"
              >
                <Edit className="mr-2 h-4 w-4" />
                Edit Receipt
              </button>
              
              <button
                onClick={handleOpenDeleteModal}
                className="inline-flex items-center justify-center rounded-md bg-red-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-600 transition-colors duration-200 shadow-sm"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete Receipt
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Receipt Header */}
            <div className="p-6 border-b border-gray-200 bg-amber-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Delivery #{receipt.voucher.voucherNumber}
                  </h2>
                  <div className="flex items-center mt-1 text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(receipt.dateOfExtraction)}</span>
                  </div>
                  <div className="flex items-center mt-1 text-gray-600">
                    <Warehouse className="h-4 w-4 mr-1" />
                    <span>Total Removed: {totalQuantityRemoved} bags</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span className="px-3 py-1 inline-flex items-center rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                    <Truck className="h-4 w-4 mr-1" />
                    Outgoing Delivery
                  </span>
                </div>
              </div>
            </div>

            {/* Receipt Content */}
            <div className="p-6">
              {/* Farmer and Order Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <User className="h-5 w-5 mr-2 text-amber-600" />
                    Farmer Information
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="font-medium">{farmerName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Farmer ID</p>
                      <p className="font-medium">{receipt.farmerId}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Contact</p>
                      <p className="font-medium">{farmerContact}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="font-medium">{farmerAddress}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-amber-600" />
                    Order Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Variety</p>
                      <p className="font-medium">{mainVariety}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Linked Receipt</p>
                      <p className="font-medium">Receipt #{receipt.orderDetails[0]?.incomingOrder?.voucher?.voucherNumber || "N/A"}</p>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5 mr-1" />
                      <div>
                        <p className="text-sm text-gray-500">
                          Storage Location
                        </p>
                        <p className="font-medium">{location}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bag Details */}
              <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-6">
                <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
                  <h3 className="text-lg font-semibold flex items-center text-gray-800">
                    <Truck className="h-5 w-5 mr-2 text-amber-600" />
                    Inventory Removed
                  </h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Bag Size
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Available Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Removed Quantity
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {receipt.orderDetails[0]?.bagSizes.map((bag, bagIndex) => {
                        // Find the corresponding incoming bag
                        const incomingBag = receipt.orderDetails[0]?.incomingOrder?.incomingBagSizes.find(
                          inBag => inBag.size === bag.size
                        );
                        
                        return (
                          <tr
                            key={bagIndex}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {bag.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {incomingBag?.currentQuantity || "N/A"}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bag.quantityRemoved}
                            </td>
                          </tr>
                        );
                      })}
                      <tr className="bg-gray-50">
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {receipt.orderDetails[0]?.incomingOrder?.incomingBagSizes.reduce(
                            (total, bag) => total + bag.currentQuantity,
                            0
                          ) || "N/A"}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {totalQuantityRemoved}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Remarks Section */}
              {receipt.remarks && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-md font-semibold mb-2">Remarks</h3>
                  <p className="text-sm text-gray-700">{receipt.remarks}</p>
                </div>
              )}

              {/* Action Buttons */}
              <div className="mt-6 flex flex-col sm:flex-row sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3">
                <button
                  type="button"
                  className="inline-flex items-center justify-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none"
                >
                  Print Receipt
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-amber-50">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Delivery #{editedReceipt.voucher.voucherNumber}
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
                {/* Basic Information */}
                <div className="space-y-6">
                  {/* Display non-editable Farmer Information */}
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h3 className="text-lg font-semibold text-gray-800 mb-3">Farmer Information (Non-editable)</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Name</p>
                        <p className="font-medium">{farmerName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Farmer ID</p>
                        <p className="font-medium">{editedReceipt.farmerId}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Contact</p>
                        <p className="font-medium">{farmerContact}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="font-medium">{farmerAddress}</p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Editable Order Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Order Information</h3>
                    
                    <div>
                      <label htmlFor="dateOfExtraction" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Extraction (DD.MM.YY)
                      </label>
                      <input
                        type="text"
                        id="dateOfExtraction"
                        value={editedReceipt.dateOfExtraction}
                        onChange={(e) => handleInputChange(e, 'dateOfExtraction')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                      />
                    </div>
                  </div>
                  
                  {/* Remarks */}
                  <div>
                    <label htmlFor="remarks" className="block text-sm font-medium text-gray-700 mb-1">
                      Remarks
                    </label>
                    <textarea
                      id="remarks"
                      value={editedReceipt.remarks}
                      onChange={(e) => handleInputChange(e, 'remarks')}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  {/* Order Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Inventory Removed Details</h3>
                    
                    {/* Single Variety Section - Show only one time */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Potato Variety (Non-editable)
                          </label>
                          <input
                            type="text"
                            value={editedReceipt.orderDetails[0]?.variety || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                            disabled
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Storage Location (Non-editable)
                          </label>
                          <input
                            type="text"
                            value={editedReceipt.orderDetails[0]?.incomingOrder?.location || ""}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                            disabled
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Bag Sizes Section */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-md font-medium text-gray-700 mb-3">
                        Bag Sizes for {editedReceipt.orderDetails[0]?.variety || ""}
                      </h5>
                      
                      {editedReceipt.orderDetails[0]?.bagSizes.map((bag, bagIndex) => {
                        // Find the corresponding incoming bag
                        const incomingBag = editedReceipt.orderDetails[0]?.incomingOrder?.incomingBagSizes.find(
                          inBag => inBag.size === bag.size
                        );
                        
                        return (
                          <div key={bagIndex} className="grid grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-md">
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Size (Non-editable)
                              </label>
                              <input
                                type="text"
                                value={bag.size}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                                disabled
                              />
                            </div>
                            
                            <div>
                              <label className="block text-xs font-medium text-gray-700 mb-1">
                                Available Quantity (Non-editable)
                              </label>
                              <input
                                type="number"
                                value={incomingBag?.currentQuantity || 0}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100"
                                disabled
                              />
                            </div>
                            
                            <div>
                              <label htmlFor={`quantityRemoved-${bagIndex}`} className="block text-xs font-medium text-gray-700 mb-1">
                                Quantity Removed
                              </label>
                              <input
                                type="number"
                                id={`quantityRemoved-${bagIndex}`}
                                value={bag.quantityRemoved}
                                onChange={(e) => handleBagSizeChange(e, 0, bagIndex, 'quantityRemoved')}
                                max={incomingBag?.currentQuantity || 0}
                                min={0}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-amber-500 focus:border-amber-500"
                              />
                              {bag.quantityRemoved > (incomingBag?.currentQuantity || 0) && (
                                <p className="text-xs text-red-500 mt-1">
                                  Cannot exceed available quantity
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
                
                {/* Error message if there is any */}
                {error && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md">
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
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none disabled:bg-amber-400"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : (
                      'Save Changes'
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
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-red-50">
              <h2 className="text-xl font-bold text-gray-800">
                Confirm Deletion
              </h2>
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
                  Are you sure you want to delete this outgoing delivery receipt? This action cannot be undone.
                </p>
                <p className="text-sm text-gray-500">
                  Delivery #{receipt?.voucher.voucherNumber} for {farmerName}
                </p>
              </div>
              
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
                  onClick={handleDeleteOrder}
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
                      Delete
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

export default OutgoingReceiptScreen;