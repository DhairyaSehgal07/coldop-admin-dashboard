import { useState, useEffect } from "react";
import { useLocation, Link } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  User,
  Truck,
  Warehouse,
  CheckCircle,
  ClipboardList,
  Edit,
  X,
  Loader2,
} from "lucide-react";
import toast from "react-hot-toast";
import TopBar from "../components/common/TopBar";
import Sidebar from "../components/common/Sidebar";
import { BASE_URL } from "../utils/const";

// Define types based on your data structure
interface BagSize {
  quantity: {
    initialQuantity: number;
    currentQuantity: number;
  };
  size: string;
}

interface OrderDetail {
  variety: string;
  bagSizes: BagSize[];
  location: string;
}

interface IncomingOrder {
  _id: string;
  coldStorageId: string;
  farmerId: string;
  dateOfSubmission: string;
  fulfilled: boolean;
  remarks: string;
  orderDetails: OrderDetail[];
  createdAt: string;
  updatedAt: string;
  __v: number;
  voucher: {
    type: string;
    voucherNumber: number;
  };
}

const IncomingReceiptScreen = () => {
  const routerLocation = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [receipt, setReceipt] = useState<IncomingOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [farmerName, setFarmerName] = useState("Farmer Name"); // This would come from API in real app
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState<IncomingOrder | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSidebarOpen && !(e.target as HTMLElement).closest("aside")) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (routerLocation.state?.incomingOrder) {
      setReceipt(routerLocation.state.incomingOrder);
      setEditedReceipt(JSON.parse(JSON.stringify(routerLocation.state.incomingOrder)));
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
      // Ensuring only one variety entry in orderDetails
      const firstOrderDetail = editedReceipt.orderDetails[0];
      
      const updateData = {
        remarks: editedReceipt.remarks,
        fulfilled: editedReceipt.fulfilled,
        dateOfSubmission: editedReceipt.dateOfSubmission,
        orderDetails: [{
          variety: firstOrderDetail.variety,
          location: firstOrderDetail.location,
          bagSizes: firstOrderDetail.bagSizes.map(bag => ({
            size: bag.size,
            quantity: {
              initialQuantity: bag.quantity.initialQuantity,
              currentQuantity: bag.quantity.currentQuantity
            }
          }))
        }]
      };
      
      // Send the update request to the backend
      const response = await fetch(`${BASE_URL}/incoming-orders/${editedReceipt._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updateData),
        credentials: 'include'
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

  const handleFarmerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFarmerName(e.target.value);
  };

  const handleFulfilledChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editedReceipt) {
      setEditedReceipt({
        ...editedReceipt,
        fulfilled: e.target.checked,
      });
    }
  };

  const handleOrderDetailChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    orderIndex: number,
    field: string
  ) => {
    if (editedReceipt) {
      const updatedOrderDetails = [...editedReceipt.orderDetails];
      updatedOrderDetails[orderIndex] = {
        ...updatedOrderDetails[orderIndex],
        [field]: e.target.value,
      };
      setEditedReceipt({
        ...editedReceipt,
        orderDetails: updatedOrderDetails,
      });
    }
  };

  const handleBagSizeChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    orderIndex: number,
    bagIndex: number,
    field: string,
    subField?: string
  ) => {
    if (editedReceipt) {
      const updatedOrderDetails = [...editedReceipt.orderDetails];
      const updatedBagSizes = [...updatedOrderDetails[orderIndex].bagSizes];
      
      if (subField) {
        updatedBagSizes[bagIndex] = {
          ...updatedBagSizes[bagIndex],
          quantity: {
            ...updatedBagSizes[bagIndex].quantity,
            [subField]: parseInt(e.target.value) || 0,
          },
        };
      } else {
        updatedBagSizes[bagIndex] = {
          ...updatedBagSizes[bagIndex],
          [field]: e.target.value,
        };
      }
      
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

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-2 text-gray-700">Loading receipt...</p>
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
            to={`/cold-storages/${receipt?.coldStorageId}`}
            state={{ coldStorage: routerLocation.state?.coldStorage }} // Pass the coldStorage data
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
  const location = receipt.orderDetails[0]?.location || "Not specified";

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
          title="Incoming Receipt Details"
        />

        {/* Back Button, Title, and Edit Button */}
        <div className="px-6 py-4 flex items-center justify-between">
          <Link
            to={`/cold-storages/${receipt?.coldStorageId}`}
            state={{ coldStorage: routerLocation.state?.coldStorage }}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cold Storage
          </Link>
          
          <button
            onClick={handleOpenEditModal}
            className="inline-flex items-center rounded-md bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 focus:outline-none"
          >
            <Edit className="mr-2 h-4 w-4" />
            Edit Receipt
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 pb-6">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            {/* Receipt Header */}
            <div className="p-6 border-b border-gray-200 bg-indigo-50">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-2xl font-bold text-gray-800">
                    Receipt #{receipt.voucher.voucherNumber}
                  </h2>
                  <div className="flex items-center mt-1 text-gray-600">
                    <Calendar className="h-4 w-4 mr-1" />
                    <span>{formatDate(receipt.dateOfSubmission)}</span>
                  </div>
                </div>
                <div className="mt-4 md:mt-0">
                  <span
                    className={`px-3 py-1 inline-flex items-center rounded-full text-sm font-medium ${
                      receipt.fulfilled
                        ? "bg-green-100 text-green-800"
                        : "bg-yellow-100 text-yellow-800"
                    }`}
                  >
                    {receipt.fulfilled ? (
                      <>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Fulfilled
                      </>
                    ) : (
                      <>
                        <ClipboardList className="h-4 w-4 mr-1" />
                        Pending
                      </>
                    )}
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
                    <User className="h-5 w-5 mr-2 text-indigo-600" />
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
                      <p className="font-medium">Not provided</p>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center">
                    <Truck className="h-5 w-5 mr-2 text-indigo-600" />
                    Order Details
                  </h3>
                  <div className="space-y-2">
                    <div>
                      <p className="text-sm text-gray-500">Variety</p>
                      <p className="font-medium">{mainVariety}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Grade</p>
                      <p className="font-medium">Standard</p>
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
                    <Warehouse className="h-5 w-5 mr-2 text-indigo-600" />
                    Inventory Details
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
                          Initial Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Current Quantity
                        </th>
                        <th
                          scope="col"
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                        >
                          Removed
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {receipt.orderDetails.flatMap((orderDetail, orderIndex) =>
                        orderDetail.bagSizes.map((bag, bagIndex) => (
                          <tr
                            key={`${orderIndex}-${bagIndex}`}
                            className="hover:bg-gray-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                              {bag.size}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bag.quantity.initialQuantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bag.quantity.currentQuantity}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                              {bag.quantity.initialQuantity -
                                bag.quantity.currentQuantity}
                            </td>
                          </tr>
                        ))
                      )}
                      <tr className="bg-gray-50">
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          Total
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {receipt.orderDetails.reduce(
                            (total, orderDetail) =>
                              total +
                              orderDetail.bagSizes.reduce(
                                (subtotal, bag) =>
                                  subtotal + bag.quantity.initialQuantity,
                                0
                              ),
                            0
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {receipt.orderDetails.reduce(
                            (total, orderDetail) =>
                              total +
                              orderDetail.bagSizes.reduce(
                                (subtotal, bag) =>
                                  subtotal + bag.quantity.currentQuantity,
                                0
                              ),
                            0
                          )}
                        </td>
                        <td className="px-6 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                          {receipt.orderDetails.reduce(
                            (total, orderDetail) =>
                              total +
                              orderDetail.bagSizes.reduce(
                                (subtotal, bag) =>
                                  subtotal +
                                  (bag.quantity.initialQuantity -
                                    bag.quantity.currentQuantity),
                                0
                              ),
                            0
                          )}
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
                {!receipt.fulfilled && (
                  <button className="inline-flex items-center justify-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none">
                    Mark as Fulfilled
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      {isEditModalOpen && editedReceipt && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-screen overflow-hidden">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-indigo-50">
              <h2 className="text-xl font-bold text-gray-800">
                Edit Receipt #{editedReceipt.voucher.voucherNumber}
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
                    </div>
                  </div>
                  
                  {/* Editable Order Information */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-800">Order Information</h3>
                    
                    <div>
                      <label htmlFor="dateOfSubmission" className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Submission (DD.MM.YY)
                      </label>
                      <input
                        type="text"
                        id="dateOfSubmission"
                        value={editedReceipt.dateOfSubmission}
                        onChange={(e) => handleInputChange(e, 'dateOfSubmission')}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                      />
                    </div>
                    
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="fulfilled"
                        checked={editedReceipt.fulfilled}
                        onChange={handleFulfilledChange}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                      />
                      <label htmlFor="fulfilled" className="ml-2 block text-sm text-gray-700">
                        Fulfilled
                      </label>
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
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>
                  
                  {/* Order Details */}
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Order Details</h3>
                    
                    {/* Single Variety and Location Section - Show only one time */}
                    <div className="border border-gray-200 rounded-lg p-4 mb-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div>
                          <label htmlFor="variety" className="block text-sm font-medium text-gray-700 mb-1">
                            Potato Variety <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="variety"
                            value={editedReceipt.orderDetails[0]?.variety || ""}
                            onChange={(e) => {
                              // Update variety in all orderDetails entries 
                              // (though we'll only use the first one when saving)
                              const updatedOrderDetails = editedReceipt.orderDetails.map(detail => ({
                                ...detail,
                                variety: e.target.value
                              }));
                              setEditedReceipt({
                                ...editedReceipt,
                                orderDetails: updatedOrderDetails,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                          <p className="text-xs text-gray-500 mt-1">This variety applies to all bag sizes below</p>
                        </div>
                        
                        <div>
                          <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                            Storage Location <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            id="location"
                            value={editedReceipt.orderDetails[0]?.location || ""}
                            onChange={(e) => {
                              // Update location in all orderDetails entries
                              const updatedOrderDetails = editedReceipt.orderDetails.map(detail => ({
                                ...detail,
                                location: e.target.value
                              }));
                              setEditedReceipt({
                                ...editedReceipt,
                                orderDetails: updatedOrderDetails,
                              });
                            }}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    {/* Bag Sizes Section */}
                    <div className="border border-gray-200 rounded-lg p-4">
                      <h5 className="text-md font-medium text-gray-700 mb-3">
                        Bag Sizes for {editedReceipt.orderDetails[0]?.variety || ""}
                      </h5>
                      
                      {editedReceipt.orderDetails[0]?.bagSizes.map((bag, bagIndex) => (
                        <div key={bagIndex} className="grid grid-cols-3 gap-3 mb-3 p-3 bg-gray-50 rounded-md">
                          <div>
                            <label htmlFor={`size-${bagIndex}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Size
                            </label>
                            <input
                              type="text"
                              id={`size-${bagIndex}`}
                              value={bag.size}
                              onChange={(e) => handleBagSizeChange(e, 0, bagIndex, 'size')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor={`initialQuantity-${bagIndex}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Initial Quantity
                            </label>
                            <input
                              type="number"
                              id={`initialQuantity-${bagIndex}`}
                              value={bag.quantity.initialQuantity}
                              onChange={(e) => handleBagSizeChange(e, 0, bagIndex, 'quantity', 'initialQuantity')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                          
                          <div>
                            <label htmlFor={`currentQuantity-${bagIndex}`} className="block text-xs font-medium text-gray-700 mb-1">
                              Current Quantity
                            </label>
                            <input
                              type="number"
                              id={`currentQuantity-${bagIndex}`}
                              value={bag.quantity.currentQuantity}
                              onChange={(e) => handleBagSizeChange(e, 0, bagIndex, 'quantity', 'currentQuantity')}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                            />
                          </div>
                        </div>
                      ))}
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
                    className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none disabled:bg-indigo-400"
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
    </div>
  );
};

export default IncomingReceiptScreen;