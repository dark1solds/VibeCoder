import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Code, Zap, Shield, TrendingUp } from "lucide-react";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      {/* Header */}
      <header className="border-b bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Code className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold">VibeCoder</span>
          </div>
          <nav className="flex items-center space-x-4">
            <Button variant="ghost">Browse</Button>
            <Button variant="ghost">How it works</Button>
            <Button>Sign In</Button>
            <Button>Sign Up</Button>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-4xl mx-auto">
          <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
            AI-Powered Code Marketplace
          </h1>
          <p className="text-xl text-muted-foreground mb-8">
            Buy and sell high-quality, AI-generated code snippets, libraries,
            and complete applications. Ship faster with pre-built, tested
            components.
          </p>
          <div className="flex space-x-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/browse">Browse Code</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/sell">Start Selling</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="container mx-auto px-4 py-20">
        <h2 className="text-3xl font-bold text-center mb-12">Why VibeCoder?</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader>
              <Zap className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Lightning Fast</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Get instant access to functional code. No waiting, no delays.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Quality Assured</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                All code is tested, reviewed, and comes with AI generation
                transparency.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Code className="h-8 w-8 text-primary mb-2" />
              <CardTitle>AI-Native</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Built for AI workflows with prompt history, model metadata, and
                versioning.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <TrendingUp className="h-8 w-8 text-primary mb-2" />
              <CardTitle>Monetize</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Turn your AI-assisted development into revenue. Earn from your
                expertise.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-bold mb-4">Ready to get started?</h2>
          <p className="text-muted-foreground mb-8">
            Join thousands of developers buying and selling AI-generated code.
          </p>
          <Button size="lg" asChild>
            <Link href="/register">Create Free Account</Link>
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-white/50 backdrop-blur-sm">
        <div className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Code className="h-6 w-6 text-primary" />
              <span className="font-bold">VibeCoder</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2024 VibeCoder. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
