import React from "react";
import { Home, Settings, Users, Package, Warehouse } from "lucide-react";
import { Link } from "react-router-dom";

// Import Shadcn components
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

interface SidebarProps {
  isSidebarOpen: boolean;
  setIsSidebarOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}

const Sidebar: React.FC<SidebarProps> = ({
  isSidebarOpen,
  setIsSidebarOpen,
}) => {
  // Navigation items
  const navItems = [
    { icon: <Home className="h-5 w-5 mr-3" />, label: "Dashboard", path: "/" },
    {
      icon: <Warehouse className="h-5 w-5 mr-3" />,
      label: "Cold-storages",
      path: "/cold-storages",
    },
    {
      icon: <Users className="h-5 w-5 mr-3" />,
      label: "Farmers",
      path: "/farmers",
    },
    {
      icon: <Package className="h-5 w-5 mr-3" />,
      label: "Inventory",
      path: "/inventory",
    },
    {
      icon: <Settings className="h-5 w-5 mr-3" />,
      label: "Settings",
      path: "/settings",
    },
  ];

  // SidebarContent component to avoid duplication
  const SidebarContent = () => (
    <>
      <nav className="mt-6 px-2">
        {navItems.map((item, index) => (
          <Link key={index} to={item.path} className="block mb-1">
            <Button
              variant="ghost"
              className="w-full justify-start text-white hover:bg-primary-foreground/20"
              onClick={() => setIsSidebarOpen && setIsSidebarOpen(false)}
            >
              {item.icon}
              <span>{item.label}</span>
            </Button>
          </Link>
        ))}
      </nav>
    </>
  );

  // Mobile view uses Sheet component
  const MobileSidebar = () => (
    <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
      <SheetContent
        side="left"
        className="p-0 bg-primary text-white border-r-0 w-64"
      >
        <SheetHeader className="p-4 border-b border-primary-foreground/20">
          <SheetTitle className="text-white text-xl">Coldop Admin</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-4rem)]">
          <SidebarContent />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );

  // Desktop view uses fixed sidebar
  const DesktopSidebar = () => (
    <aside className="bg-primary text-white w-64 h-full hidden md:block">
      <div className="p-4 border-b border-primary-foreground/20">
        <h2 className="text-xl font-bold">Coldop Admin</h2>
      </div>
      <ScrollArea className="h-[calc(100vh-4rem)]">
        <SidebarContent />
      </ScrollArea>
    </aside>
  );

  return (
    <>
      <MobileSidebar />
      <DesktopSidebar />
    </>
  );
};

export default Sidebar;
