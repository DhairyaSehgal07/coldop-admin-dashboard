import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// Define the storage stats structure
interface StorageStats {
  temperature: string;
  floors: number;
  rowsPerFloor: number;
  lastMaintenance: string;
}

// Define the prop type for the component
interface StorageDetailsProps {
  storageStats: StorageStats;
}

const StorageDetailsSection: React.FC<StorageDetailsProps> = ({ storageStats }) => {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Storage Details</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Temperature */}
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-500">Temperature</span>
            <span className="font-medium">{storageStats.temperature}</span>
          </div>

          {/* Floors */}
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-500">Floors</span>
            <span className="font-medium">{storageStats.floors}</span>
          </div>

          {/* Rows Per Floor */}
          <div className="flex justify-between items-center border-b pb-2">
            <span className="text-gray-500">Rows Per Floor</span>
            <span className="font-medium">{storageStats.rowsPerFloor}</span>
          </div>

          {/* Last Maintenance */}
          <div className="flex justify-between items-center">
            <span className="text-gray-500">Last Maintenance</span>
            <span className="font-medium">{storageStats.lastMaintenance}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageDetailsSection;
