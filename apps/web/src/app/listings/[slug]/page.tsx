"use client";

import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Code, 
  Star, 
  Download, 
  Eye, 
  Clock, 
  ArrowLeft,
  ArrowRight,
  Share2,
  Heart,
  Shield,
  Zap,
  CheckCircle2,
  Calendar,
  Sparkles,
  CreditCard,
  ChevronRight,
  ExternalLink,
  Lock,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { apiClient, queries } from "@/lib/api-client";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useToast } from "@/components/ui/use-toast";

export default function ListingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const { isAuthenticated, user } = useAuthStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["listing", params.slug],
    queryFn: async () => {
      const response = await apiClient.graphql<{ getListing: any }>(queries.getListing, {
        id: params.slug as string,
      });
      return response.getListing;
    },
  });

  const { data: purchaseStatus } = useQuery({
    queryKey: ["hasPurchased", params.slug],
    queryFn: async () => {
      const resp = await apiClient.graphql<{ hasPurchased: boolean }>(queries.hasPurchased, {
        listingId: data.id,
      });
      return resp.hasPurchased;
    },
    enabled: !!data?.id && isAuthenticated,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-orange-500/20 border-t-orange-500 animate-spin" />
        <p className="mt-4 text-gray-500 font-medium animate-pulse">Loading amazing code...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center px-6 text-center">
        <div className="w-20 h-20 rounded-3xl glass border border-white/5 flex items-center justify-center mb-6">
          <Code className="h-10 w-10 text-gray-700" />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Listing not found</h1>
        <p className="text-gray-500 mb-8 max-w-md">The code listing you're looking for might have been moved or deleted.</p>
        <Button asChild className="gradient-bg hover:opacity-90 text-white border-0 glow-orange-sm">
          <Link href="/browse">Back to Marketplace</Link>
        </Button>
      </div>
    );
  }

  const isOwner = user?.id === data.creator?.id;
  const hasAccess = isOwner || purchaseStatus;

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col pt-20">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-20 pointer-events-none" />
      <div className="gradient-orb gradient-orb-1 -top-40 right-0 opacity-10" />
      <div className="gradient-orb gradient-orb-2 -bottom-40 left-0 opacity-10" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/browse" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group">
            <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">Marketplace</span>
          </Link>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" className="glass border-white/5 text-gray-400 hover:text-white">
              <Share2 className="h-4 w-4" />
            </Button>
            <Button variant="ghost" size="icon" className="glass border-white/5 text-gray-400 hover:text-white">
              <Heart className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-12 relative z-10 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* Left Column: Details */}
          <div className="lg:col-span-2 space-y-12">
            
            {/* Header Info */}
            <div className="animate-in">
              <div className="flex flex-wrap items-center gap-3 mb-6">
                <Badge className="bg-orange-500/10 text-orange-400 border border-orange-500/20 hover:bg-orange-500/20 transition-colors">
                  {data.category?.name}
                </Badge>
                {data.techStack?.map((item: any) => (
                  <Badge key={item.technology.name} variant="outline" className="border-white/10 text-gray-400 hover:text-white transition-colors">
                    {item.technology.name}
                  </Badge>
                ))}
              </div>
              <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-6 leading-tight">{data.title}</h1>
              
              <div className="flex flex-wrap items-center gap-8 text-sm text-gray-500">
                <div className="flex items-center gap-2 group cursor-pointer" onClick={() => router.push(`/users/${data.creator?.username}`)}>
                  <div className="w-10 h-10 rounded-full glass border border-white/5 flex items-center justify-center p-0.5">
                    {data.creator?.profile?.avatarUrl ? (
                      <img src={data.creator.profile.avatarUrl} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <div className="w-full h-full rounded-full gradient-bg flex items-center justify-center text-white font-bold text-xs">
                        {data.creator?.username?.[0]?.toUpperCase()}
                      </div>
                    )}
                  </div>
                  <div>
                    <span className="block text-gray-400 group-hover:text-white transition-colors font-medium">@{data.creator?.username}</span>
                    <span className="text-[10px] uppercase font-bold tracking-widest text-orange-500/60">Creator</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg glass border border-white/5">
                    <Calendar className="h-4 w-4 text-orange-500" />
                  </div>
                  <div>
                    <span className="block text-gray-400 font-medium">Created</span>
                    <span className="text-xs uppercase font-bold text-gray-600 tracking-tighter">
                      {new Date(data.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg glass border border-white/5">
                    <Star className="h-4 w-4 text-orange-500 fill-orange-500" />
                  </div>
                  <div>
                    <span className="block text-gray-400 font-medium">{data.stats?.ratingAverage || "0.0"} Rating</span>
                    <span className="text-xs uppercase font-bold text-gray-600 tracking-tighter">{data.stats?.ratingCount} Reviews</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Description Card */}
            <div className="glass-card rounded-3xl p-8 animate-in stagger-1">
              <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                <ListIcon className="h-5 w-5 text-orange-500" />
                Description
              </h2>
              <div className="prose prose-invert max-w-none text-gray-400 leading-relaxed text-lg">
                {data.description || "No description provided."}
              </div>
            </div>

            {/* AI Metadata Card */}
            {data.aiMetadata && (
              <div className="relative animate-in stagger-2">
                <div className="absolute -top-3 -right-3 z-10">
                  <div className="px-4 py-1.5 rounded-full gradient-bg glow-orange-sm text-white text-[10px] font-bold uppercase tracking-widest">
                    AI Generated
                  </div>
                </div>
                <div className="glass-card rounded-3xl p-8 border-orange-500/20">
                  <h2 className="text-2xl font-bold text-white mb-8 flex items-center gap-3">
                    <Sparkles className="h-5 w-5 text-orange-500" />
                    AI Generation Context
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-widest block">Provider</span>
                      <p className="text-lg font-medium text-white">{data.aiMetadata.provider}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-widest block">Model</span>
                      <p className="text-lg font-medium text-white">{data.aiMetadata.modelName}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-gray-600 uppercase tracking-widest block">Date</span>
                      <p className="text-lg font-medium text-white">
                        {new Date(data.aiMetadata.generationDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Reviews Preview Placeholder */}
            <div className="glass-card rounded-3xl p-8 animate-in stagger-3">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                  <MessageSquare className="h-5 w-5 text-orange-500" />
                  Reviews
                </h2>
                <Button variant="link" className="text-orange-400 p-0 hover:text-orange-300">View All</Button>
              </div>
              
              <div className="space-y-6">
                {[1, 2].map(i => (
                  <div key={i} className="glass p-6 rounded-2xl border-white/5">
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-white/10" />
                        <span className="text-sm font-medium text-gray-300">Demo User {i}</span>
                      </div>
                      <div className="flex items-center text-orange-500">
                        <Star className="h-3 w-3 fill-orange-500" />
                        <Star className="h-3 w-3 fill-orange-500" />
                        <Star className="h-3 w-3 fill-orange-500" />
                        <Star className="h-3 w-3 fill-orange-500" />
                        <Star className="h-3 w-3 fill-orange-500" />
                      </div>
                    </div>
                    <p className="text-sm text-gray-500 italic">"Amazing code quality! Saved me hours of work."</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column: Pricing & Purchase */}
          <div className="lg:col-span-1 space-y-6">
            <div className="sticky top-28 space-y-6">
              
              {/* Purchase Card */}
              <div className="glass-card rounded-3xl p-8 animate-in stagger-2 glow-orange-sm relative overflow-hidden border-orange-500/20">
                <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/10 blur-3xl -z-10" />
                
                <div className="mb-8">
                  <span className="text-sm font-bold text-gray-500 uppercase tracking-widest block mb-2">Price</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-5xl font-extrabold text-white">
                      {data.pricing?.price?.amount === 0 ? "FREE" : `$${(data.pricing?.price?.amount / 100).toFixed(2)}`}
                    </span>
                    <span className="text-gray-600 font-medium">/ lifetime</span>
                  </div>
                </div>

                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Instant codebase download</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Complete documentation</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>Free version updates</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <span>License: {data.license?.type}</span>
                  </div>
                </div>

                {hasAccess ? (
                  <Button asChild className="w-full h-14 gradient-bg hover:opacity-90 text-white border-0 text-lg font-bold glow-orange-sm">
                    <Link href="/dashboard/purchases">
                      <Download className="mr-2 h-5 w-5" />
                      Access Codebase
                    </Link>
                  </Button>
                ) : (
                  <Button className="w-full h-14 gradient-bg hover:opacity-90 text-white border-0 text-lg font-bold glow-orange-sm group">
                    <CreditCard className="mr-2 h-5 w-5" />
                    Buy Now
                    <ChevronRight className="ml-1 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                )}
                
                {!isAuthenticated && (
                   <p className="text-center text-xs text-gray-600 mt-4 italic">Please login to purchase</p>
                )}
              </div>

              {/* Sidebar Stats Card */}
              <div className="glass-card rounded-2xl p-6 animate-in stagger-3 space-y-6">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg glass border border-white/5">
                          <Download className="h-4 w-4 text-orange-500" />
                       </div>
                       <span className="text-sm text-gray-400 font-medium">Purchases</span>
                    </div>
                    <span className="text-white font-bold">{data.stats?.purchasesCount || "0"}</span>
                 </div>
                 <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg glass border border-white/5">
                          <Eye className="h-4 w-4 text-orange-500" />
                       </div>
                       <span className="text-sm text-gray-400 font-medium">Views</span>
                    </div>
                    <span className="text-white font-bold">{data.stats?.viewsCount || "0"}</span>
                 </div>
                 <div className="flex items-center justify-between border-t border-white/5 pt-4">
                    <div className="flex items-center gap-3">
                       <div className="p-2 rounded-lg glass border border-white/5">
                          <Lock className="h-4 w-4 text-orange-500" />
                       </div>
                       <span className="text-sm text-gray-400 font-medium">License</span>
                    </div>
                    <span className="text-white font-bold">{data.license?.type || "MIT"}</span>
                 </div>
              </div>

              {/* Creator Card */}
              <div className="glass-card rounded-2xl p-6 animate-in stagger-4">
                 <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">About Creator</h3>
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-xl gradient-bg flex items-center justify-center text-white font-bold text-lg">
                      {data.creator?.username?.[0]?.toUpperCase()}
                    </div>
                    <div>
                      <span className="block text-white font-bold">@{data.creator?.username}</span>
                      <span className="text-xs text-gray-500">Joined Jan 2026</span>
                    </div>
                 </div>
                 <p className="text-sm text-gray-500 line-clamp-3 mb-6">
                    Professional AI developer specializing in enterprise components and system architecture.
                 </p>
                 <Button variant="outline" className="w-full border-white/10 text-white bg-white/5 hover:bg-white/10 group">
                    View Profile
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                 </Button>
              </div>

              {/* Trust Section */}
              <div className="flex items-center justify-center gap-4 text-[10px] text-gray-600 uppercase font-bold tracking-widest animate-in stagger-5">
                 <div className="flex items-center gap-1">
                    <Shield className="h-3 w-3" />
                    Verified Code
                 </div>
                 <div className="flex items-center gap-1">
                    <Zap className="h-3 w-3" />
                    Clean AI Generation
                 </div>
              </div>

            </div>
          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 bg-black/20 relative z-10 mt-20">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 text-gray-500 text-sm">
            <div className="flex items-center space-x-3">
              <div className="w-6 h-6 rounded gradient-bg flex items-center justify-center">
                <Code className="h-3 w-3 text-white" />
              </div>
              <span className="font-bold text-white">VibeCoder</span>
            </div>
            <div>
              © 2026 VibeCoder. Secure code transaction platform.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function ListIcon({ className }: { className?: string }) {
  return (
    <svg 
      className={className} 
      xmlns="http://www.w3.org/2000/svg" 
      width="24" height="24" 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="2" 
      strokeLinecap="round" 
      strokeLinejoin="round"
    >
      <line x1="8" y1="6" x2="21" y2="6"></line>
      <line x1="8" y1="12" x2="21" y2="12"></line>
      <line x1="8" y1="18" x2="21" y2="18"></line>
      <line x1="3" y1="6" x2="3.01" y2="6"></line>
      <line x1="3" y1="12" x2="3.01" y2="12"></line>
      <line x1="3" y1="18" x2="3.01" y2="18"></line>
    </svg>
  );
}
