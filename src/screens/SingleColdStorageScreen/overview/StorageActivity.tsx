import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload } from "lucide-react";

const StorageActivitySection = ({ activities }) => {
  // Function to get the appropriate icon based on activity type
  const getActivityIcon = (type) => {
    switch (type) {
      case "incoming":
        return <Download className="h-5 w-5 text-green-600" />;
      case "outgoing":
        return <Upload className="h-5 w-5 text-indigo-600" />;
      default:
        return null;
    }
  };

  // Function to get color classes based on activity type
  const getActivityColorClasses = (type) => {
    switch (type) {
      case "incoming":
        return "bg-green-100 text-green-600";
      case "outgoing":
        return "bg-indigo-100 text-indigo-600";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle>Storage Activity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {activities.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent activity</p>
          ) : (
            activities.map((activity, index) => (
              <div key={index} className="flex items-start">
                <div
                  className={`h-8 w-8 rounded-full flex items-center justify-center mr-4 ${getActivityColorClasses(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                <div className="flex-1">
                  <p className="font-medium">{activity.description}</p>
                  <p className="text-sm text-gray-500">{activity.timestamp}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default StorageActivitySection;
