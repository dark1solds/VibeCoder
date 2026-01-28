"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Link from "next/link";
import { 
  Code, 
  Search, 
  Filter, 
  Tag, 
  Star, 
  Download, 
  Eye, 
  Clock, 
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  LayoutGrid,
  List as ListIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { apiClient, queries } from "@/lib/api-client";

const categories = [
  "All",
  "Components",
  "APIs",
  "Tools",
  "Templates",
  "Libraries",
  "Scripts",
];

const sortOptions = [
  { label: "Newest", value: "newest" },
  { label: "Popular", value: "popular" },
  { label: "Top Rated", value: "rating" },
  { label: "Price: Low to High", value: "price_asc" },
  { label: "Price: High to Low", value: "price_desc" },
];

export default function BrowsePage() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data, isLoading } = useQuery({
    queryKey: ["listings", selectedCategory, sortBy, searchQuery],
    queryFn: async () => {
      const filter: any = { status: "PUBLISHED" };
      if (selectedCategory !== "All") {
        filter.category = selectedCategory.toLowerCase();
      }
      
      return apiClient.graphql<{
        getListings: {
          edges: Array<{
            node: any;
            cursor: string;
          }>;
          totalCount: number;
        };
      }>(queries.getListings, {
        filter,
        pagination: { first: 20 },
      });
    },
  });

  const listings = data?.getListings?.edges.map(e => e.node) || [];

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col pt-20">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="gradient-orb gradient-orb-1 opacity-20" />
      <div className="gradient-orb gradient-orb-2 opacity-20" />

      {/* Header/Nav Spacer */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-orange-sm">
                <Code className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                VibeCoder
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/browse" className="text-white transition-colors font-medium border-b-2 border-orange-500 pb-1">
                Browse
              </Link>
              <Link href="/sell" className="text-gray-400 hover:text-white transition-colors font-medium">
                Sell
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <Button asChild className="gradient-bg hover:opacity-90 text-white border-0 glow-orange-sm">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-12 relative z-10">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
          <div className="animate-in">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full glass border border-orange-500/20 mb-4">
              <Sparkles className="h-3 w-3 text-orange-400" />
              <span className="text-xs text-gray-300 font-medium">Over 5,000 components</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Explore <span className="gradient-text">Marketplace</span></h1>
            <p className="text-gray-400">Discover premium AI-generated code snippets and professional components.</p>
          </div>

          <div className="flex items-center gap-3 animate-in stagger-1">
             <div className="glass rounded-lg p-1 flex">
               <button 
                onClick={() => setViewMode("grid")}
                className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 <LayoutGrid className="h-4 w-4" />
               </button>
               <button 
                onClick={() => setViewMode("list")}
                className={`p-2 rounded-md transition-all ${viewMode === 'list' ? 'bg-orange-500 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}
               >
                 <ListIcon className="h-4 w-4" />
               </button>
             </div>
             <div className="glass rounded-lg border border-white/5 relative">
                <select 
                  className="bg-transparent text-sm text-gray-300 px-4 py-2 pr-8 appearance-none focus:outline-none"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {sortOptions.map(opt => (
                    <option key={opt.value} value={opt.value} className="bg-background">{opt.label}</option>
                  ))}
                </select>
                <Filter className="absolute right-3 top-1/2 -translate-y-1/2 h-3 w-3 text-gray-500 pointer-events-none" />
             </div>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="space-y-6 mb-12">
          <div className="relative group animate-in stagger-2">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-orange-500 transition-colors" />
            <Input 
              placeholder="Search for code, components, APIs..." 
              className="h-14 pl-12 bg-white/5 border-white/10 text-white placeholder:text-gray-500 text-lg hover:border-orange-500/30 transition-all focus:border-orange-500 group-focus-within:glow-orange-sm"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex flex-wrap gap-2 animate-in stagger-3">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-6 py-2 rounded-full text-sm font-medium transition-all duration-300 border ${
                  selectedCategory === cat
                    ? "gradient-bg text-white border-transparent shadow-[0_0_20px_rgba(249,115,22,0.3)]"
                    : "glass border-white/10 text-gray-400 hover:text-white hover:border-white/20"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Listings Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="glass-card rounded-2xl h-[400px] shimmer" />
            ))}
          </div>
        ) : listings.length > 0 ? (
          <div className={viewMode === 'grid' 
            ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 animate-in stagger-4" 
            : "space-y-4 animate-in stagger-4"
          }>
            {listings.map((listing: any) => (
              <Link 
                key={listing.id} 
                href={`/listings/${listing.slug}`}
                className={`group glass-card rounded-2xl overflow-hidden hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-1 flex ${viewMode === 'list' ? 'flex-row h-40' : 'flex-col'}`}
              >
                {/* Preview Image / Header */}
                <div className={`relative bg-gradient-to-br from-white/5 to-white/10 flex items-center justify-center overflow-hidden ${viewMode === 'list' ? 'w-48 border-r border-white/5' : 'aspect-video'}`}>
                  <Code className="h-12 w-12 text-gray-700 group-hover:text-orange-500/40 transition-colors" />
                  <div className="absolute top-3 right-3 flex gap-2">
                    <Badge className="bg-orange-500/20 text-orange-400 border-none">
                      {listing.category?.name}
                    </Badge>
                  </div>
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-orange-500/0 group-hover:bg-orange-500/10 transition-colors pointer-events-none" />
                </div>

                {/* Content */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white group-hover:text-orange-400 transition-colors line-clamp-1">{listing.title}</h3>
                    <span className="text-lg font-bold gradient-text">
                      {listing.pricing?.price?.amount === 0 ? "FREE" : `$${(listing.pricing?.price?.amount / 100).toFixed(2)}`}
                    </span>
                  </div>

                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">
                    {listing.description}
                  </p>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {listing.techStack?.slice(0, 3).map((item: any) => (
                      <span key={item.technology.name} className="px-2 py-0.5 rounded-md text-[10px] bg-white/5 text-gray-400 border border-white/10 uppercase font-bold tracking-wider">
                        {item.technology.name}
                      </span>
                    ))}
                    {listing.techStack?.length > 3 && (
                      <span className="text-[10px] text-gray-600">+{listing.techStack.length - 3}</span>
                    )}
                  </div>

                  <div className="flex items-center justify-between pt-4 border-t border-white/5 text-xs text-gray-500">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1 group/stat">
                        <Eye className="h-3.5 w-3.5" />
                        <span>{listing.stats?.viewsCount}</span>
                      </div>
                      <div className="flex items-center gap-1 text-orange-400">
                        <Star className="h-3.5 w-3.5 fill-orange-400" />
                        <span className="font-bold">{listing.stats?.ratingAverage || "0.0"}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 group-hover:text-orange-400 transition-colors font-medium">
                      View details
                      <ArrowRight className="h-3 w-3 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-32 glass-card rounded-3xl animate-in">
            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-6">
              <Search className="h-8 w-8 text-gray-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No results found</h2>
            <p className="text-gray-500 mb-8">Try adjusting your filters or search query to find what you're looking for.</p>
            <Button 
              variant="outline" 
              className="border-white/10 text-white"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("All");
              }}
            >
              Clear all filters
            </Button>
          </div>
        )}

        {/* Pagination Placeholder */}
        {listings.length > 0 && (
          <div className="mt-16 flex items-center justify-center gap-4 animate-in stagger-5">
            <Button variant="outline" size="icon" className="glass border-white/10 text-white disabled:opacity-30">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="flex items-center gap-2">
              <span className="w-10 h-10 rounded-lg gradient-bg flex items-center justify-center text-white font-bold text-sm">1</span>
              <span className="w-10 h-10 rounded-lg glass border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">2</span>
              <span className="w-10 h-10 rounded-lg glass border border-white/5 flex items-center justify-center text-gray-500 hover:text-white transition-colors cursor-pointer text-sm">3</span>
            </div>
            <Button variant="outline" size="icon" className="glass border-white/10 text-white">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black/20 relative z-10 mt-20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Code className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">VibeCoder</span>
            </div>
            <div className="text-gray-500 text-sm">
              © 2026 VibeCoder. All rights reserved. Professional code marketplace.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
