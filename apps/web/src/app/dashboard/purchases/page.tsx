"use client";

import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  ShoppingBag, 
  Download, 
  ExternalLink, 
  Search, 
  Clock, 
  ChevronRight,
  Code,
  Package,
  Calendar,
  DollarSign
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiClient, queries } from "@/lib/api-client";

export default function PurchasesPage() {
  const { data: purchases, isLoading } = useQuery({
    queryKey: ["myPurchases"],
    queryFn: async () => {
      const response = await apiClient.graphql<{ myPurchases: any[] }>(queries.myPurchases);
      return response.myPurchases;
    },
  });

  return (
    <div className="p-8 space-y-8 pb-24">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 animate-in">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-2">My <span className="gradient-text">Purchases</span></h1>
          <p className="text-gray-500">Manage and download your acquired AI codebase collection.</p>
        </div>
        <div className="relative w-full md:w-72">
           <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-600" />
           <Input 
            placeholder="Search purchases..." 
            className="pl-10 h-11 bg-white/5 border-white/10 text-white placeholder:text-gray-700 rounded-xl focus:border-orange-500/50" 
           />
        </div>
      </div>

      <div className="glass-card rounded-3xl overflow-hidden animate-in stagger-1">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/5 bg-white/[0.02]">
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Product</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hidden md:table-cell">Date</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] hidden sm:table-cell">Price</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em]">Status</th>
                <th className="px-8 py-5 text-[10px] font-black text-gray-600 uppercase tracking-[0.2em] text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {isLoading ? (
                [1, 2, 3].map(i => (
                  <tr key={i} className="animate-pulse">
                    <td colSpan={5} className="px-8 py-8"><div className="h-6 bg-white/5 rounded-lg w-full" /></td>
                  </tr>
                ))
              ) : purchases && purchases.length > 0 ? (
                purchases.map((purchase) => (
                  <tr key={purchase.id} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="px-8 py-6">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-transparent flex items-center justify-center border border-white/5 group-hover:scale-110 transition-transform duration-500">
                          <Package className="h-6 w-6 text-orange-500" />
                        </div>
                        <div>
                          <p className="font-bold text-white group-hover:text-orange-400 transition-colors uppercase text-sm tracking-tight">{purchase.listing?.title}</p>
                          <p className="text-[10px] text-gray-500 font-medium">@{purchase.listing?.creatorUsername}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-6 hidden md:table-cell">
                       <div className="flex items-center gap-2 text-gray-500 text-xs">
                          <Calendar className="h-3 w-3" />
                          {new Date(purchase.purchasedAt).toLocaleDateString()}
                       </div>
                    </td>
                    <td className="px-8 py-6 hidden sm:table-cell">
                       <span className="text-white font-mono text-sm">${(purchase.amountCents / 100).toFixed(2)}</span>
                    </td>
                    <td className="px-8 py-6">
                       <Badge className="bg-green-500/10 text-green-500 border-none font-bold text-[10px] px-2 py-0.5 uppercase tracking-tighter">
                         Success
                       </Badge>
                    </td>
                    <td className="px-8 py-6 text-right">
                       <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-600 hover:text-orange-500 hover:bg-orange-500/10 transition-all rounded-xl border border-transparent hover:border-orange-500/20">
                             <Download className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" asChild className="h-10 w-10 text-gray-600 hover:text-white hover:bg-white/10 transition-all rounded-xl">
                             <Link href={`/listings/${purchase.listing?.slug}`}>
                               <ExternalLink className="h-4 w-4" />
                             </Link>
                          </Button>
                       </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-8 py-24 text-center">
                     <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
                        <ShoppingBag className="h-8 w-8 text-gray-700" />
                     </div>
                     <p className="text-gray-500 font-medium italic">No purchases found. Shop the marketplace to build your library.</p>
                     <Button asChild className="mt-6 gradient-bg hover:opacity-90 text-white border-0 px-8 h-12">
                        <Link href="/browse">Explore Marketplace</Link>
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
