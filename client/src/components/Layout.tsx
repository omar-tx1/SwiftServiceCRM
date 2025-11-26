import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Calendar, 
  FileText, 
  Briefcase, 
  Users, 
  Settings, 
  Plus,
  Truck,
  Menu,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useState } from "react";

const Sidebar = ({ className = "", onClose }: { className?: string, onClose?: () => void }) => {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Dashboard", href: "/" },
    { icon: Calendar, label: "Schedule", href: "/schedule" },
    { icon: FileText, label: "Quotes", href: "/quotes" },
    { icon: Briefcase, label: "Jobs", href: "/jobs" },
    { icon: Users, label: "Customers", href: "/customers" },
    { icon: Settings, label: "Settings", href: "/settings" },
  ];

  return (
    <div className={`flex flex-col h-full bg-slate-900 text-white w-64 ${className}`}>
      <div className="p-6 flex items-center gap-3 border-b border-slate-800">
        <div className="bg-blue-600 p-2 rounded-lg">
          <Truck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="font-heading font-bold text-2xl tracking-wide leading-none">HAULMATE</h1>
          <p className="text-xs text-slate-400 uppercase tracking-wider">Pro Edition</p>
        </div>
      </div>

      <div className="flex-1 py-6 px-3 space-y-1">
        <div className="px-3 mb-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Menu</div>
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <a 
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-colors group
                  ${isActive 
                    ? "bg-blue-600 text-white shadow-md" 
                    : "text-slate-400 hover:bg-slate-800 hover:text-white"
                  }`}
                onClick={onClose}
              >
                <item.icon className={`h-5 w-5 ${isActive ? "text-white" : "text-slate-500 group-hover:text-white"}`} />
                <span className="font-medium">{item.label}</span>
              </a>
            </Link>
          );
        })}
      </div>

      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center gap-3 p-2 rounded-md bg-slate-800/50 hover:bg-slate-800 transition-colors cursor-pointer">
          <Avatar className="h-9 w-9 border border-slate-600">
            <AvatarImage src="https://github.com/shadcn.png" />
            <AvatarFallback>JD</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">John Doe</p>
            <p className="text-xs text-slate-400 truncate">john@haulmate.com</p>
          </div>
          <LogOut className="h-4 w-4 text-slate-500" />
        </div>
      </div>
    </div>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b bg-white flex items-center justify-between px-4 md:px-8 flex-shrink-0 z-10">
          <div className="flex items-center gap-4">
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild className="md:hidden">
                <Button variant="ghost" size="icon">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0 w-64 border-r-slate-800 bg-slate-900 text-white">
                <Sidebar onClose={() => setSidebarOpen(false)} />
              </SheetContent>
            </Sheet>
            
            <h2 className="text-xl font-semibold text-slate-800 hidden md:block">
              Dashboard
            </h2>
          </div>

          <div className="flex items-center gap-3">
            <Button className="bg-blue-600 hover:bg-blue-700 text-white gap-2 shadow-sm hover:shadow-md transition-all">
              <Plus className="h-4 w-4" />
              <span className="hidden sm:inline">New Job</span>
            </Button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-8 bg-slate-50/50">
          <div className="max-w-7xl mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
