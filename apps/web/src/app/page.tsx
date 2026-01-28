"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Code,
  Sparkles,
  Zap,
  Shield,
  TrendingUp,
  ArrowRight,
  Github,
  Twitter,
  Star,
  Users,
  Package,
  ChevronRight,
} from "lucide-react";
import { useAuthStore } from "@/lib/stores/auth-store";
import { useEffect, useState } from "react";

export default function Home() {
  const { isAuthenticated, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const features = [
    {
      icon: Zap,
      title: "Lightning Fast",
      description: "Get instant access to production-ready code. No waiting, no delays.",
      gradient: "from-orange-500 to-amber-500",
    },
    {
      icon: Shield,
      title: "Quality Assured",
      description: "All code is tested, reviewed, and comes with AI generation history.",
      gradient: "from-orange-600 to-red-500",
    },
    {
      icon: Sparkles,
      title: "AI-Native",
      description: "Built for AI workflows with prompt history, model metadata, and versioning.",
      gradient: "from-amber-500 to-orange-500",
    },
    {
      icon: TrendingUp,
      title: "Monetize",
      description: "Turn your AI-assisted development work into passive income.",
      gradient: "from-red-500 to-orange-600",
    },
  ];

  const stats = [
    { value: "10K+", label: "Developers", icon: Users },
    { value: "5K+", label: "Code Listings", icon: Package },
    { value: "4.9", label: "Average Rating", icon: Star },
  ];

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-50 pointer-events-none" />
      <div className="gradient-orb gradient-orb-1" />
      <div className="gradient-orb gradient-orb-2" />

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl gradient-bg flex items-center justify-center glow-orange-sm">
                  <Code className="h-5 w-5 text-white" />
                </div>
              </div>
              <span className="text-xl font-bold text-white group-hover:text-orange-400 transition-colors">
                VibeCoder
              </span>
            </Link>

            <div className="hidden md:flex items-center space-x-8">
              <Link href="/browse" className="text-gray-400 hover:text-white transition-colors font-medium">
                Browse
              </Link>
              <Link href="/sell" className="text-gray-400 hover:text-white transition-colors font-medium">
                Sell
              </Link>
              <Link href="#features" className="text-gray-400 hover:text-white transition-colors font-medium">
                Features
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              {mounted && isAuthenticated ? (
                <Button asChild className="gradient-bg hover:opacity-90 text-white border-0 glow-orange-sm">
                  <Link href="/dashboard">
                    Dashboard
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <>
                  <Button variant="ghost" asChild className="text-gray-400 hover:text-white hover:bg-white/5">
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button asChild className="gradient-bg hover:opacity-90 text-white border-0 glow-orange-sm">
                    <Link href="/register">Get Started</Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="container mx-auto text-center max-w-5xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-orange-500/20 mb-8 animate-in">
            <Sparkles className="h-4 w-4 text-orange-400" />
            <span className="text-sm text-gray-300">The #1 AI Code Marketplace</span>
          </div>

          {/* Main Heading */}
          <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight animate-in stagger-1">
            <span className="text-white">Buy & Sell</span>
            <br />
            <span className="gradient-text">AI-Generated Code</span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto animate-in stagger-2">
            The premier marketplace for AI-generated code snippets, components, and applications. 
            Ship faster with pre-built, tested solutions.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16 animate-in stagger-3">
            <Button asChild size="lg" className="gradient-bg hover:opacity-90 text-white border-0 glow-orange px-8 py-6 text-lg font-semibold">
              <Link href="/browse">
                Explore Code
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-gray-700 bg-transparent hover:bg-white/5 text-white px-8 py-6 text-lg">
              <Link href="/sell">Start Selling</Link>
            </Button>
          </div>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 md:gap-16 animate-in stagger-4">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <stat.icon className="h-5 w-5 text-orange-400 group-hover:scale-110 transition-transform" />
                  <span className="text-3xl md:text-4xl font-bold gradient-text">{stat.value}</span>
                </div>
                <span className="text-gray-500 font-medium">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Code Preview Card */}
        <div className="container mx-auto mt-20 max-w-4xl animate-in stagger-5">
          <div className="glass-card rounded-2xl p-1 glow-orange-sm">
            <div className="bg-[#0d0d0d] rounded-xl overflow-hidden">
              {/* Window Bar */}
              <div className="flex items-center gap-2 px-4 py-3 bg-[#141414] border-b border-white/5">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500/80" />
                  <div className="w-3 h-3 rounded-full bg-yellow-500/80" />
                  <div className="w-3 h-3 rounded-full bg-green-500/80" />
                </div>
                <span className="text-gray-500 text-sm ml-4 font-mono">AI-Generated React Component</span>
              </div>
              {/* Code Content */}
              <div className="p-6 font-mono text-sm overflow-x-auto">
                <pre className="text-gray-300">
                  <code>
{`import { useState } from 'react';

export const `}<span className="text-orange-400">AnimatedCounter</span>{` = ({ target }) => {
  const [`}<span className="text-amber-400">count</span>{`, setCount] = useState(0);
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => prev < target ? prev + 1 : prev);
    }, 50);
    return () => clearInterval(timer);
  }, [target]);

  return (
    <span className="`}<span className="text-green-400">gradient-text text-4xl font-bold</span>{`">
      {count.toLocaleString()}
    </span>
  );
};`}
                  </code>
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-6 relative">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Why <span className="gradient-text">VibeCoder</span>?
            </h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">
              Built for the AI-first development era. Everything you need to buy, sell, and ship code faster.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <div
                key={feature.title}
                className="group glass-card rounded-2xl p-6 hover:border-orange-500/30 transition-all duration-500 hover:-translate-y-1"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${feature.gradient} flex items-center justify-center mb-4 group-hover:scale-110 group-hover:glow-orange-sm transition-all duration-300`}>
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-6 relative">
        <div className="container mx-auto max-w-4xl">
          <div className="glass-card rounded-3xl p-12 text-center relative overflow-hidden">
            {/* Background glow */}
            <div className="absolute inset-0 bg-gradient-to-r from-orange-500/10 via-transparent to-orange-500/10" />
            
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4 relative z-10">
              Ready to Get Started?
            </h2>
            <p className="text-gray-400 text-lg mb-8 max-w-xl mx-auto relative z-10">
              Join thousands of developers buying and selling AI-generated code.
            </p>
            <Button asChild size="lg" className="gradient-bg hover:opacity-90 text-white border-0 glow-orange px-10 py-6 text-lg font-semibold relative z-10">
              <Link href="/register">
                Create Free Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6">
        <div className="container mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg gradient-bg flex items-center justify-center">
                <Code className="h-4 w-4 text-white" />
              </div>
              <span className="text-lg font-bold text-white">VibeCoder</span>
            </div>

            <div className="flex items-center gap-8 text-gray-400 text-sm">
              <Link href="/browse" className="hover:text-white transition-colors">Browse</Link>
              <Link href="/sell" className="hover:text-white transition-colors">Sell</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
            </div>

            <div className="flex items-center gap-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Github className="h-5 w-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div className="text-center mt-8 text-gray-500 text-sm">
            © 2026 VibeCoder. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
