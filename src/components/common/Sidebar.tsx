import React from "react";
import { Home, Settings, Users, Package, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";

interface SidebarProps {
  isSidebarOpen: boolean;
}

const Sidebar: React.FC<SidebarProps> = ({ isSidebarOpen }) => {
  return (
    <aside
      className={`bg-indigo-800 text-white w-64 fixed h-full transition-transform duration-300 ease-in-out z-20 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      } md:translate-x-0 md:relative md:z-0`}
    >
      <div className="p-4 border-b border-indigo-700">
        <h2 className="text-xl font-bold">Coldop Admin</h2>
      </div>
      <nav className="mt-6">
        <Link to="/">
          <div className="px-4 py-3 flex items-center hover:bg-indigo-700 cursor-pointer rounded mx-2 mb-1">
            <Home className="h-5 w-5 mr-3" />
            <span>Dashboard</span>
          </div>
        </Link>
        <Link to="/cold-storages">
          <div className="px-4 py-3 flex items-center hover:bg-indigo-700 cursor-pointer rounded mx-2 mb-1">
            <Warehouse className="h-5 w-5 mr-3" />
            <span>Cold-storages</span>
          </div>
        </Link>
        <div className="px-4 py-3 flex items-center hover:bg-indigo-700 cursor-pointer rounded mx-2 mb-1">
          <Users className="h-5 w-5 mr-3" />
          <span>Farmers</span>
        </div>
        <div className="px-4 py-3 flex items-center hover:bg-indigo-700 cursor-pointer rounded mx-2 mb-1">
          <Package className="h-5 w-5 mr-3" />
          <span>Inventory</span>
        </div>
        <div className="px-4 py-3 flex items-center hover:bg-indigo-700 cursor-pointer rounded mx-2 mb-1">
          <Settings className="h-5 w-5 mr-3" />
          <span>Settings</span>
        </div>
      </nav>
    </aside>
  );
};

export default Sidebar;
