import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Download, Upload } from "lucide-react";

// Define prop types
interface StorageStatisticsProps {
  farmerCount: number;
  incomingOrdersCount: number;
  outgoingOrdersCount: number;
}

const StorageStatisticsSection: React.FC<StorageStatisticsProps> = ({
  farmerCount,
  incomingOrdersCount,
  outgoingOrdersCount,
}) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Storage Statistics</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Registered Farmers */}
          <div className="flex items-center border-b pb-4">
            <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-4">
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-gray-500">Registered Farmers</p>
              <p className="text-2xl font-bold">{farmerCount}</p>
            </div>
          </div>

          {/* Active Incoming Orders */}
          <div className="flex items-center border-b pb-4">
            <div className="h-10 w-10 rounded-full bg-green-100 flex items-center justify-center mr-4">
              <Download className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-gray-500">Active Incoming Orders</p>
              <p className="text-2xl font-bold">{incomingOrdersCount}</p>
            </div>
          </div>

          {/* Recent Outgoing Orders */}
          <div className="flex items-center">
            <div className="h-10 w-10 rounded-full bg-indigo-100 flex items-center justify-center mr-4">
              <Upload className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <p className="text-gray-500">Recent Outgoing Orders</p>
              <p className="text-2xl font-bold">{outgoingOrdersCount}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageStatisticsSection;
