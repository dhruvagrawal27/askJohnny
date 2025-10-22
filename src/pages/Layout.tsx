import React from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import {
  Home,
  Phone,
  PhoneOutgoing,
  Calendar,
  BarChart3,
  BookOpen,
  Mic,
  Globe,
  Settings,
} from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";

const sidebarItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Calls", url: "/dashboard/calls", icon: Phone },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Outbound Calls", url: "/dashboard/outbound", icon: PhoneOutgoing },
  { title: "Voices", url: "/dashboard/voices", icon: Mic },
  { title: "Knowledge Base", url: "/dashboard/knowledge", icon: BookOpen },
  // { title: "Call Planning", url: "/dashboard/planning", icon: Calendar },
  // { title: "Website Agent", url: "/dashboard/website", icon: Globe },
  // { title: "Integration", url: "/dashboard/integration", icon: Settings },
  // { title: "Settings", url: "/dashboard/settings", icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        {/* Sidebar */}
        <Sidebar className="border-r border-border">
          <div className="p-4 border-b border-border">
            <div className="flex items-center gap-2">
              <Phone className="h-6 w-6 text-purple-600" />
              <span className="font-bold text-lg text-purple-900">
                CallAgent Pro
              </span>
            </div>
          </div>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.url}>
                        <Link to={item.url}>
                          <SidebarMenuButton
                            className={`${
                              active
                                ? "bg-purple-600 text-white hover:bg-purple-700 hover:text-white"
                                : "hover:bg-purple-50 hover:text-purple-700"
                            }`}
                          >
                            <Icon className="h-4 w-4" />
                            <span>{item.title}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <div className="mt-auto p-4 border-t border-border">
              <UserButton afterSignOutUrl="/" />
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main content */}
        <main className="flex-1 overflow-hidden">
          <header className="border-b border-border bg-white">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-xl font-semibold text-purple-900">
                  {sidebarItems.find((i) => i.url === location.pathname)
                    ?.title || ""}
                </h1>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>

          <div className="h-[calc(100vh-73px)] overflow-y-auto bg-white">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
