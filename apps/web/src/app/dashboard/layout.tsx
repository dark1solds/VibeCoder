"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Code, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Menu, 
  X,
  User as UserIcon,
  ChevronRight,
  Bell,
  Sparkles,
  Search,
  MessageSquare
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, isLoading, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (!isLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (!mounted || isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const navItems = [
    { label: "Overview", icon: LayoutDashboard, href: "/dashboard" },
    { label: "My Listings", icon: Code, href: "/dashboard/listings" },
    { label: "Purchases", icon: ShoppingBag, href: "/dashboard/purchases" },
    { label: "Messages", icon: MessageSquare, href: "/dashboard/messages", badge: "2" },
    { label: "Settings", icon: Settings, href: "/dashboard/settings" },
  ];

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  return (
    <div className="min-h-screen bg-background text-foreground relative flex overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="fixed -top-40 right-0 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="fixed -bottom-40 left-0 w-[500px] h-[500px] bg-orange-500/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Sidebar for Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-72 glass border-r border-white/5 transform transition-transform duration-500 ease-in-out lg:relative lg:translate-x-0 ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}>
        <div className="h-full flex flex-col p-6">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 mb-12 group">
            <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-orange-sm">
              <Code className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
              VibeCoder
            </span>
          </Link>

          {/* User Profile Summary */}
          <div className="mb-10 px-2">
            <div className="flex items-center gap-3">
               <div className="w-12 h-12 rounded-full gradient-bg flex items-center justify-center text-white font-bold text-lg border-2 border-white/10 glow-orange-sm">
                  {user?.username?.[0]?.toUpperCase()}
               </div>
               <div>
                  <h3 className="font-bold text-white truncate w-32">{user?.username}</h3>
                  <Badge variant="outline" className="text-[10px] py-0 border-white/10 text-orange-500 uppercase tracking-widest font-bold">
                    {user?.role}
                  </Badge>
               </div>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 group ${
                    isActive
                      ? "gradient-bg text-white shadow-[0_0_20px_rgba(249,115,22,0.2)]"
                      : "text-gray-400 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <item.icon className={`h-5 w-5 transition-transform group-hover:scale-110 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                    <span className="font-medium">{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${isActive ? 'bg-white/20 text-white' : 'bg-orange-500 text-white'}`}>
                      {item.badge}
                    </span>
                  )}
                  {isActive && <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />}
                </Link>
              );
            })}
          </nav>

          {/* Sell Button */}
          <div className="mt-6 mb-12">
            <Button asChild className="w-full h-12 gradient-bg hover:opacity-90 text-white border-0 glow-orange-sm relative overflow-hidden group">
               <Link href="/sell">
                 <div className="absolute inset-0 bg-white/10 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700 pointer-events-none" />
                 <PlusCircle className="mr-2 h-5 w-5" />
                 Create Listing
               </Link>
            </Button>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-4 rounded-xl text-gray-500 hover:text-red-400 hover:bg-red-400/5 transition-all w-full mt-auto group"
          >
            <LogOut className="h-5 w-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>

        {/* Mobile Close Button */}
        <button
          className="lg:hidden absolute top-4 right-[-3rem] p-2 glass rounded-lg border-white/5"
          onClick={() => setIsSidebarOpen(false)}
        >
          <X className="h-6 w-6 text-white" />
        </button>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Topbar */}
        <header className="h-20 glass border-b border-white/5 flex items-center justify-between px-8 relative z-40">
           <div className="flex items-center gap-4">
              <button 
                className="lg:hidden p-2 text-gray-400 hover:text-white"
                onClick={() => setIsSidebarOpen(true)}
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="hidden md:flex items-center gap-2 glass px-4 py-1.5 rounded-full border border-white/5 opacity-60 hover:opacity-100 transition-opacity">
                 <Sparkles className="h-3 w-3 text-orange-400" />
                 <span className="text-xs text-gray-400 font-medium tracking-tight">AI Credits: <span className="text-white">Unlimited</span></span>
              </div>
           </div>

           <div className="flex items-center gap-6">
              <div className="hidden sm:flex relative">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                 <input 
                  type="text" 
                  placeholder="Global search..." 
                  className="bg-white/5 border border-white/10 rounded-full pl-10 pr-4 py-1.5 text-sm text-white placeholder:text-gray-600 focus:outline-none focus:border-orange-500/50 w-64"
                 />
              </div>

              <div className="flex items-center gap-4">
                 <button className="relative p-2 text-gray-400 hover:text-white transition-colors group">
                    <Bell className="h-5 w-5 group-hover:scale-110 transition-transform" />
                    <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-orange-500 border-2 border-background" />
                 </button>
                 <div className="h-8 w-px bg-white/5" />
                 <div className="flex items-center gap-3">
                    <div className="hidden sm:block text-right">
                       <span className="block text-sm font-bold text-white line-clamp-1">{user?.username}</span>
                       <span className="block text-[10px] text-gray-500 uppercase tracking-widest font-black">Pro Member</span>
                    </div>
                    <div className="w-10 h-10 rounded-xl glass border border-white/10 flex items-center justify-center glow-orange-sm overflow-hidden p-0.5">
                       {user?.profile?.avatarUrl ? (
                         <img src={user.profile.avatarUrl} alt="" className="w-full h-full rounded-lg object-cover" />
                       ) : (
                         <UserIcon className="h-5 w-5 text-gray-600" />
                       )}
                    </div>
                 </div>
              </div>
           </div>
        </header>

        {/* Internal Content Area */}
        <main className="flex-1 overflow-y-auto relative z-10 custom-scrollbar">
           {children}
        </main>
      </div>

      {/* Overlay for mobile sidebar */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
