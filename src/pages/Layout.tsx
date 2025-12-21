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
  Bot,
  ChevronLeft,
} from "lucide-react";
import { UserButton } from "@clerk/clerk-react";
import { Link, useLocation } from "react-router-dom";

const sidebarItems = [
  { title: "Home", url: "/dashboard", icon: Home },
  { title: "Agent", url: "/dashboard/agent", icon: Bot },
  { title: "Calls", url: "/dashboard/calls", icon: Phone },
  { title: "Analytics", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "Outbound Calls", url: "/dashboard/outbound", icon: PhoneOutgoing },
  { title: "Voices", url: "/dashboard/voices", icon: Mic },
  { title: "Knowledge Base", url: "/dashboard/knowledge", icon: BookOpen },
  { title: "Integrations", url: "/dashboard/integrations", icon: Settings },
];

export const Layout: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-white">
        {/* Professional Sidebar */}
        <Sidebar className="border-r border-gray-200 bg-white">
          {/* Logo Section - Matches navbar height */}
          <div className="h-[61px] px-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-indigo-600 flex items-center justify-center shadow-sm">
                <Phone className="h-4 w-4 text-white" />
              </div>
              <span className="font-bold text-base text-gray-900 tracking-tight">
                Ask Johnny
              </span>
            </div>
            <SidebarTrigger className="p-1.5 hover:bg-gray-100 rounded-md transition-colors">
              <ChevronLeft className="h-4 w-4 text-gray-600" />
            </SidebarTrigger>
          </div>

          <SidebarContent className="px-3 py-4">
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu className="space-y-1">
                  {sidebarItems.map((item) => {
                    const Icon = item.icon;
                    const active = location.pathname === item.url;
                    return (
                      <SidebarMenuItem key={item.url}>
                        <Link to={item.url} className="block">
                          <SidebarMenuButton
                            className={`relative w-full justify-start h-10 px-3 rounded-lg font-medium transition-all duration-200 ${
                              active
                                ? "bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-sm hover:from-purple-700 hover:to-indigo-700"
                                : "text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                            }`}
                          >
                            <Icon className="h-4 w-4 mr-3" />
                            <span className="text-sm">{item.title}</span>
                          </SidebarMenuButton>
                        </Link>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            {/* User Section */}
            <div className="mt-auto p-3 border-t border-gray-200">
              <div className="flex items-center gap-3 p-2.5 rounded-lg bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer">
                <UserButton afterSignOutUrl="/" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-gray-600 font-medium">My Account</p>
                </div>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main content */}
        <main className="flex-1 overflow-hidden" style={{
          background: 'radial-gradient(125% 125% at 50% 10%, #FFFFFF 35%, #E9D5FF 75%, #C4B5FD 100%)'
        }}>
          <header className="h-[61px] border-b border-gray-200 bg-white/90 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 h-full">
              <div className="flex items-center gap-3">
                <h1 className="text-lg font-bold text-gray-900">
                  {sidebarItems.find((i) => i.url === location.pathname)
                    ?.title || "Dashboard"}
                </h1>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>

          <div className="h-[calc(100vh-61px)] overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
