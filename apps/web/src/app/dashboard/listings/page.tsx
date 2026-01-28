"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  Plus, 
  MoreVertical, 
  Eye, 
  ShoppingBag, 
  Edit, 
  Trash2, 
  ExternalLink,
  Code,
  TrendingUp,
  BarChart3,
  Calendar,
  AlertCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiClient, queries } from "@/lib/api-client";

export default function MyListingsPage() {
  const { data: listings, isLoading } = useQuery({
    queryKey: ["myListings"],
    queryFn: async () => {
      const response = await apiClient.graphql<{ myListings: any[] }>(queries.myListings);
      return response.myListings;
    },
  });

  return (
    <div className="p-8 space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">My <span className="gradient-text">Listings</span></h1>
          <p className="text-gray-500">Manage your creator products and monitor their market performance.</p>
        </div>
        <Button asChild className="gradient-bg hover:opacity-90 text-white border-0 glow-orange-sm h-12 px-6 rounded-xl font-bold">
          <Link href="/sell">
            <Plus className="mr-2 h-5 w-5" />
            Create Listing
          </Link>
        </Button>
      </div>

      {/* Analytics Summary Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in stagger-1">
         <div className="glass p-4 rounded-2xl flex items-center gap-4 border-white/5">
            <div className="p-3 rounded-xl bg-orange-500/10 text-orange-500"><Eye className="h-5 w-5" /></div>
            <div>
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Total Impressions</p>
               <p className="text-xl font-black text-white">1,492</p>
            </div>
         </div>
         <div className="glass p-4 rounded-2xl flex items-center gap-4 border-white/5">
            <div className="p-3 rounded-xl bg-green-500/10 text-green-500"><TrendingUp className="h-5 w-5" /></div>
            <div>
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Market Conversion</p>
               <p className="text-xl font-black text-white">4.2%</p>
            </div>
         </div>
         <div className="glass p-4 rounded-2xl flex items-center gap-4 border-white/5">
            <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500"><BarChart3 className="h-5 w-5" /></div>
            <div>
               <p className="text-[10px] font-bold text-gray-600 uppercase tracking-widest">Active Revenue</p>
               <p className="text-xl font-black text-white">$0.00</p>
            </div>
         </div>
      </div>

      {/* Listings Table */}
      <div className="glass-card rounded-3xl overflow-hidden animate-in stagger-2">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] w-1/3">Listing</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Engagements</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-right">Settings</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-6 bg-white/5 rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : listings && listings.length > 0 ? (
                listings.map((listing) => (
                  <tr key={listing.id} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500/10 to-transparent flex items-center justify-center border border-orange-500/10 text-orange-500 group-hover:scale-110 transition-transform duration-500">
                          <Code className="h-6 w-6" />
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-white group-hover:text-orange-400 transition-colors uppercase text-sm tracking-tight truncate">{listing.title}</p>
                          <div className="flex items-center gap-2 text-[10px] text-gray-600 font-bold">
                             <Calendar className="h-3 w-3" />
                             {new Date(listing.createdAt).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6">
                       {listing.status === 'PUBLISHED' ? (
                          <Badge className="bg-green-500/10 text-green-500 border-none px-2 py-0.5 text-[10px] uppercase font-black tracking-widest">Active</Badge>
                       ) : (
                          <Badge className="bg-gray-500/10 text-gray-500 border-none px-2 py-0.5 text-[10px] uppercase font-black tracking-widest">{listing.status}</Badge>
                       )}
                    </td>
                    <td className="px-8 py-6">
                       <div className="flex items-center gap-6">
                          <div className="space-y-1">
                             <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Views</p>
                             <p className="text-sm font-bold text-white">{listing.stats?.viewsCount || 0}</p>
                          </div>
                          <div className="space-y-1">
                             <p className="text-[10px] text-gray-600 font-bold uppercase tracking-tighter">Sales</p>
                             <p className="text-sm font-bold text-white">{listing.stats?.purchasesCount || 0}</p>
                          </div>
                       </div>
                    </td>
                    <td className="px-8 py-6">
                       <p className="text-white font-mono font-bold">${(listing.pricing?.price?.amount / 100).toFixed(2)}</p>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-gray-600 hover:text-white hover:bg-white/10 transition-all rounded-xl border border-transparent">
                             <Link href={`/listings/${listing.slug}`}>
                                <ExternalLink className="h-4 w-4" />
                             </Link>
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-600 hover:text-orange-500 hover:bg-orange-500/10 transition-all rounded-xl">
                             <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-600 hover:text-red-500 hover:bg-red-500/10 transition-all rounded-xl">
                             <Trash2 className="h-4 w-4" />
                          </Button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                     <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <AlertCircle className="h-8 w-8 text-gray-800" />
                     </div>
                     <p className="text-gray-500 font-medium italic">You haven't created any code listings yet.</p>
                     <Button asChild className="mt-6 gradient-bg hover:opacity-90 text-white border-0 px-8 h-12">
                        <Link href="/sell">Create New Listing</Link>
                     </Button>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
