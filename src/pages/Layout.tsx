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
        {/* Professional Sidebar - Landing Page Style */}
        <Sidebar className="border-r border-[#ECE8FF]/60">
          {/* Logo Section */}
          <div className="p-6 border-b border-[#ECE8FF]/60">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#A26BFF] to-[#7A57FF] flex items-center justify-center shadow-lg">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <span className="font-bold text-xl text-brand-700 tracking-tight">
                Ask Johnny
              </span>
            </div>
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
                            className={`relative w-full justify-start h-11 px-4 rounded-xl font-semibold transition-all duration-200 ${
                              active
                                ? "bg-gradient-to-r from-[#A26BFF] to-[#7A57FF] text-white shadow-lg shadow-purple-500/25 hover:shadow-xl hover:shadow-purple-500/30"
                                : "text-[#6A6F7A] hover:bg-gray-50 hover:text-[#0C0F1A]"
                            }`}
                          >
                            <Icon className="h-5 w-5 mr-3" />
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
            <div className="mt-auto p-4 border-t border-[#ECE8FF]/60">
              <div className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-br from-purple-50 to-pink-50 border border-[#ECE8FF]/40">
                <UserButton afterSignOutUrl="/" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-[#6A6F7A] font-semibold">Account</p>
                </div>
              </div>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Main content */}
        <main className="flex-1 overflow-hidden" style={{
          background: 'radial-gradient(125% 125% at 50% 10%, #FFFFFF 35%, #E9D5FF 75%, #C4B5FD 100%)'
        }}>
          <header className="border-b border-[#ECE8FF]/60 bg-white/80 backdrop-blur-md">
            <div className="flex items-center justify-between px-6 py-4">
              <div className="flex items-center gap-4">
                <SidebarTrigger />
                <h1 className="text-2xl font-bold text-[#0C0F1A]">
                  {sidebarItems.find((i) => i.url === location.pathname)
                    ?.title || "Dashboard"}
                </h1>
              </div>
              <UserButton afterSignOutUrl="/" />
            </div>
          </header>

          <div className="h-[calc(100vh-73px)] overflow-y-auto">
            {children}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default Layout;
