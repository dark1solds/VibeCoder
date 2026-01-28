"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  TrendingUp, 
  ShoppingBag, 
  Eye, 
  Code, 
  ArrowUpRight, 
  DollarSign, 
  User, 
  ChevronRight,
  Package,
  Calendar,
  Sparkles,
  Zap,
  MoreVertical,
  Activity,
  Star
} from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient, queries } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";

export default function DashboardPage() {
  const { user } = useAuthStore();

  const { data: listingsData, isLoading: isLoadingListings } = useQuery({
    queryKey: ["myListings"],
    queryFn: async () => {
      const response = await apiClient.graphql<{ myListings: any[] }>(queries.myListings);
      return response.myListings;
    },
  });

  const { data: purchasesData, isLoading: isLoadingPurchases } = useQuery({
    queryKey: ["myPurchases"],
    queryFn: async () => {
      const response = await apiClient.graphql<{ myPurchases: any[] }>(queries.myPurchases);
      return response.myPurchases;
    },
  });

  const stats = [
    {
      label: "Total Revenue",
      value: "$0.00",
      change: "+0%",
      icon: DollarSign,
      color: "text-green-500",
      bg: "bg-green-500/10",
    },
    {
      label: "Code Listings",
      value: listingsData?.length || "0",
      change: "+0%",
      icon: Code,
      color: "text-orange-500",
      bg: "bg-orange-500/10",
    },
    {
      label: "Total Purchases",
      value: purchasesData?.length || "0",
      change: "+0%",
      icon: ShoppingBag,
      color: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    {
      label: "Profile Views",
      value: "142",
      change: "+12.5%",
      icon: Eye,
      color: "text-purple-500",
      bg: "bg-purple-500/10",
    },
  ];

  return (
    <div className="p-8 space-y-12 pb-24">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in">
        <div>
          <div className="flex items-center gap-2 mb-2">
             <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
             <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">System Operational</span>
          </div>
          <h1 className="text-4xl font-extrabold text-white mb-2">
            Welcome back, <span className="gradient-text italic">{user?.username}</span>
          </h1>
          <p className="text-gray-500 max-w-xl">
            Here's what's happening with your VibeCoder empire today. Your listings are reaching 14 countries.
          </p>
        </div>
        <div className="flex items-center gap-3">
           <Button variant="outline" className="glass border-white/5 text-gray-400 hover:text-white">
              <Calendar className="mr-2 h-4 w-4" />
              This Month
           </Button>
           <Button asChild className="gradient-bg hover:opacity-90 text-white border-0 glow-orange-sm">
              <Link href="/sell">
                <PlusIcon className="mr-2 h-4 w-4" />
                New Listing
              </Link>
           </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 animate-in stagger-1">
        {stats.map((stat, index) => (
          <div key={stat.label} className="group glass-card rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-500">
            <div className="flex items-start justify-between mb-4">
              <div className={`p-3 rounded-xl ${stat.bg} ${stat.color} transition-transform group-hover:scale-110 duration-300`}>
                <stat.icon className="h-6 w-6" />
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-500 bg-green-500/10 px-2 py-0.5 rounded-full">
                <TrendingUp className="h-3 w-3" />
                {stat.change}
              </div>
            </div>
            <h3 className="text-gray-500 text-sm font-medium mb-1">{stat.label}</h3>
            <div className="flex items-end gap-2 text-3xl font-bold text-white uppercase tabular-nums tracking-tighter">
              {stat.value}
            </div>
          </div>
        ))}
      </div>

      {/* Main Dashboard Content */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        
        {/* Left: Recent Activity & Listings */}
        <div className="xl:col-span-2 space-y-8 animate-in stagger-2">
          
          {/* Active Listings Preview */}
          <div className="glass-card rounded-3xl p-8">
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center">
                  <Package className="h-5 w-5 text-orange-500" />
                </div>
                <div>
                   <h2 className="text-xl font-bold text-white">My Active Listings</h2>
                   <p className="text-xs text-gray-500">Managing {listingsData?.length || 0} products</p>
                </div>
              </div>
              <Button variant="link" asChild className="text-orange-400 hover:text-orange-300">
                 <Link href="/dashboard/listings">View All</Link>
              </Button>
            </div>

            {isLoadingListings ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 glass rounded-2xl shimmer" />
                ))}
              </div>
            ) : listingsData && listingsData.length > 0 ? (
              <div className="space-y-4">
                {listingsData.slice(0, 3).map((listing) => (
                  <div key={listing.id} className="group glass hover:bg-white/5 rounded-2xl p-4 flex items-center justify-between transition-colors border-white/5">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                        <Code className="h-6 w-6 text-orange-500" />
                      </div>
                      <div>
                        <h4 className="font-bold text-white group-hover:text-orange-400 transition-colors">{listing.title}</h4>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                           <span className="flex items-center gap-1"><Eye className="h-3 w-3" /> {listing.stats?.viewsCount || 0}</span>
                           <span className="flex items-center gap-1"><ShoppingBag className="h-3 w-3" /> {listing.stats?.purchasesCount || 0}</span>
                           <Badge className="bg-green-500/10 text-green-500 border-none px-1.5 py-0 text-[10px] h-4">{listing.status}</Badge>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                       <span className="font-bold text-white">${(listing.pricing?.price?.amount / 100).toFixed(2)}</span>
                       <Button variant="ghost" size="icon" className="text-gray-600 hover:text-white h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                       </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 glass rounded-2xl border-white/5">
                 <p className="text-gray-500 italic mb-4">No listings created yet.</p>
                 <Button asChild variant="outline" className="border-white/10 text-white">
                    <Link href="/sell">Create First Listing</Link>
                 </Button>
              </div>
            )}
          </div>

          {/* Activity Graph Placeholder */}
          <div className="glass-card rounded-3xl p-8 h-80 relative overflow-hidden flex flex-col">
             <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl glass border border-white/5 flex items-center justify-center">
                    <Activity className="h-5 w-5 text-orange-500" />
                  </div>
                  <div>
                   <h2 className="text-xl font-bold text-white">Sales & Performance</h2>
                   <p className="text-xs text-gray-500">Real-time engagement tracking</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                   <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                      <div className="w-2 h-2 rounded-full bg-orange-500" />
                      Sales
                   </div>
                   <div className="flex items-center gap-1 text-[10px] text-gray-500 font-bold uppercase">
                      <div className="w-2 h-2 rounded-full bg-blue-500" />
                      Views
                   </div>
                </div>
             </div>
             
             {/* Simple Visualization Placeholder */}
             <div className="flex-1 flex items-end justify-between gap-2 px-2 mt-4">
                {[40, 70, 45, 90, 65, 80, 50, 60, 85, 40, 55, 75, 95, 60].map((h, i) => (
                  <div key={i} className="flex-1 space-y-2 group cursor-pointer relative">
                     <div 
                      className="w-full bg-white/5 hover:bg-white/10 rounded-t-lg transition-all duration-500 hover:h-[105%]" 
                      style={{ height: `${h}%` }}
                     />
                     <div 
                      className="absolute bottom-0 w-full bg-orange-500/40 rounded-t-lg group-hover:bg-orange-500 transition-all duration-700" 
                      style={{ height: `${h * 0.4}%` }}
                     />
                     <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 -translate-x-1/2 glass px-2 py-1 rounded text-[10px] text-white font-bold transition-opacity whitespace-nowrap pointer-events-none">
                        Day {i+1}: {Math.floor(h/5)} sales
                     </div>
                  </div>
                ))}
             </div>
             <div className="flex justify-between items-center mt-6 text-[10px] text-gray-600 font-bold uppercase tracking-tighter">
                <span>Jan 14</span>
                <span>Jan 21</span>
                <span>Jan 28</span>
             </div>
          </div>

        </div>

        {/* Right: Sidebar Components */}
        <div className="space-y-8 animate-in stagger-3">
          
          {/* Quick Actions Card */}
          <div className="glass-card rounded-3xl p-8 relative overflow-hidden group">
             <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl -z-10 group-hover:bg-orange-500/10 transition-colors" />
             <h2 className="text-xl font-bold text-white mb-6">Quick Insights</h2>
             <div className="space-y-6">
                <div className="flex items-center gap-4">
                   <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-orange-sm">
                      <Zap className="h-5 w-5 text-white" />
                   </div>
                   <div className="flex-1">
                      <p className="text-sm font-bold text-white mb-0.5">Power User Tip</p>
                      <p className="text-xs text-gray-500 leading-relaxed">Adding keywords to your AI metadata can increase search visibility by 65%.</p>
                   </div>
                </div>

                <div className="h-px bg-white/5" />

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Market Reliability</span>
                      <span className="font-bold text-green-500">100% Secure</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[100%] gradient-bg animate-pulse" />
                   </div>
                </div>

                <div className="space-y-4">
                   <div className="flex items-center justify-between text-xs">
                      <span className="text-gray-500 font-medium">Profile Completion</span>
                      <span className="font-bold text-orange-400">85%</span>
                   </div>
                   <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full w-[85%] gradient-bg" />
                   </div>
                </div>
             </div>
          </div>

          {/* Recent Purchases Mini Grid */}
          <div className="glass-card rounded-3xl p-8">
             <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-white">Recent Buys</h2>
                <Link href="/dashboard/purchases" className="text-xs text-orange-500 hover:text-white font-bold transition-colors">See all</Link>
             </div>
             
             {isLoadingPurchases ? (
               <div className="space-y-4">
                  {[1, 2].map(i => <div key={i} className="h-14 glass rounded-xl shimmer" />)}
               </div>
             ) : purchasesData && purchasesData.length > 0 ? (
               <div className="space-y-4">
                  {purchasesData.slice(0, 4).map((purchase) => (
                    <div key={purchase.id} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded-xl transition-colors group">
                       <div className="w-10 h-10 rounded-lg glass flex items-center justify-center border-white/5">
                          <ShoppingBag className="h-5 w-5 text-gray-700 group-hover:text-orange-500 transition-colors" />
                       </div>
                       <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-white truncate">{purchase.listing?.title}</p>
                          <p className="text-[10px] text-gray-600 font-medium">{new Date(purchase.purchasedAt).toLocaleDateString()}</p>
                       </div>
                       <ChevronRight className="h-3 w-3 text-gray-800" />
                    </div>
                  ))}
               </div>
             ) : (
               <div className="text-center py-6 text-xs text-gray-600 italic">No purchases yet. Start exploring the marketplace!</div>
             )}
          </div>

          {/* Feedback Card */}
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-white/[0.03] to-orange-500/[0.03]">
             <div className="flex items-center justify-between mb-2">
                <span className="text-[10px] font-bold text-orange-500 uppercase tracking-tighter">Community Feedback</span>
                <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
             </div>
             <p className="text-sm font-medium text-white mb-4">"Your components are elite. Keep them coming!"</p>
             <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-white/10" />
                <span className="text-[10px] text-gray-500">Verified Buyer</span>
             </div>
          </div>

        </div>

      </div>
    </div>
  );
}

function PlusIcon({ className }: { className?: string }) {
  return (
    <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="M12 5v14"/>
    </svg>
  );
}
