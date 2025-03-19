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
} from "lucide-react";
import TopBar from "../components/common/TopBar";
import Sidebar from "../components/common/Sidebar";

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
  const [farmerName] = useState("Farmer Name"); // This would come from API in real app

  const handleOutsideClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isSidebarOpen && !(e.target as HTMLElement).closest("aside")) {
      setIsSidebarOpen(false);
    }
  };

  useEffect(() => {
    if (routerLocation.state?.incomingOrder) {
      setReceipt(routerLocation.state.incomingOrder);
      setLoading(false);
    }
  }, [routerLocation.state]);

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
            to={`/cold-storages/${receipt.coldStorageId}`}
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

        {/* Back Button and Title */}
        <div className="px-6 py-4 flex items-center">
          <Link
            to={`/cold-storages/${receipt?.coldStorageId}`}
            state={{ coldStorage: routerLocation.state?.coldStorage }}
            className="inline-flex items-center rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700 focus:outline-none"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Cold Storage
          </Link>
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
    </div>
  );
};

export default IncomingReceiptScreen;
