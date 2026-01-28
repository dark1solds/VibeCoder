"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { 
  Code, 
  Sparkles, 
  ChevronRight, 
  ChevronLeft, 
  Check, 
  Info, 
  DollarSign, 
  ShieldCheck, 
  Layout, 
  Layers, 
  Database, 
  Terminal, 
  Globe, 
  Cpu,
  FileCode,
  Zap,
  Tag,
  Rocket
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { apiClient, mutations, queries } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { useQuery } from "@tanstack/react-query";

const steps = [
  { id: 1, title: "Identity", description: "Listing details", icon: Tag },
  { id: 2, title: "Intelligence", description: "AI Metadata", icon: Sparkles },
  { id: 3, title: "Value", description: "Pricing & License", icon: DollarSign },
  { id: 4, title: "Core", description: "Source Code", icon: FileCode },
];

export default function SellPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    techStack: [] as string[],
    aiProvider: "",
    aiModel: "",
    price: 0,
    licenseType: "MIT",
    codeContent: "",
    fileName: "index.tsx",
    language: "typescript",
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      // Mock categories for now if query fails
      return [
        { id: "1", name: "Components", icon: Layout },
        { id: "2", name: "APIs", icon: Globe },
        { id: "3", name: "Tools", icon: Terminal },
        { id: "4", name: "Templates", icon: Layers },
        { id: "5", name: "Libraries", icon: Database },
      ];
    },
  });

  const { data: technologies } = useQuery({
    queryKey: ["technologies"],
    queryFn: async () => {
      return [
        { id: "1", name: "React" },
        { id: "2", name: "Next.js" },
        { id: "3", name: "Node.js" },
        { id: "4", name: "TypeScript" },
        { id: "5", name: "Python" },
        { id: "6", name: "Tailwind CSS" },
      ];
    },
  });

  const handleNext = () => setCurrentStep((prev) => Math.min(prev + 1, steps.length));
  const handleBack = () => setCurrentStep((prev) => Math.max(prev - 1, 1));

  const toggleTech = (name: string) => {
    setFormData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(name)
        ? prev.techStack.filter(t => t !== name)
        : [...prev.techStack, name]
    }));
  };

  const handleSubmit = async () => {
    try {
      const response = await apiClient.graphql<{ createListing: any }>(mutations.createListing, {
        input: {
          title: formData.title,
          description: formData.description,
          categoryId: formData.category,
          techStack: formData.techStack.map(name => ({ technologyName: name })),
          aiMetadata: {
            provider: formData.aiProvider,
            modelName: formData.aiModel,
            generationDate: new Date().toISOString(),
          },
          pricing: {
            type: formData.price === 0 ? "FREE" : "ONE_TIME",
            price: { amount: Math.round(formData.price * 100), currency: "USD" },
          },
          license: {
            type: formData.licenseType,
          },
          files: [
            {
              name: formData.fileName,
              language: formData.language,
              content: formData.codeContent,
            }
          ]
        }
      });

      toast({
        title: "Success!",
        description: "Your listing has been created and is waiting for review.",
      });
      router.push("/dashboard/listings");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to create listing",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex flex-col pt-20">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-grid opacity-10 pointer-events-none" />
      <div className="fixed top-0 left-0 right-0 h-[500px] bg-gradient-to-b from-orange-500/10 to-transparent pointer-events-none -z-10" />

      {/* Nav Spacer */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-white/5">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
           <Link href="/dashboard" className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors group text-sm font-medium">
             <ChevronLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
             Back to Dashboard
           </Link>
           <h1 className="text-sm font-bold text-white uppercase tracking-widest">New Code Listing</h1>
           <div className="w-20" /> {/* Spacer */}
        </div>
      </nav>

      <main className="flex-1 container mx-auto px-6 py-12 relative z-10 max-w-4xl">
        
        {/* Progress Stepper */}
        <div className="mb-16 relative">
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white/5 -translate-y-1/2 -z-10" />
          <div className="flex justify-between">
            {steps.map((step) => {
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex flex-col items-center gap-3">
                  <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-2 ${
                    isActive 
                      ? "gradient-bg text-white border-transparent glow-orange-sm rotate-0" 
                      : isCompleted 
                        ? "bg-green-500/20 text-green-500 border-green-500/30" 
                        : "bg-background border-white/10 text-gray-700"
                  }`}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <step.icon className="h-5 w-5" />}
                  </div>
                  <div className="text-center">
                    <p className={`text-[10px] font-bold uppercase tracking-wider ${isActive ? "text-orange-500" : "text-gray-600"}`}>
                      {step.title}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Step Content Card */}
        <div className="glass-card rounded-[32px] p-10 animate-in glow-orange-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/5 blur-[100px] pointer-events-none" />
          
          <div className="mb-10">
             <h2 className="text-3xl font-black text-white mb-2">{steps[currentStep-1].title} Details</h2>
             <p className="text-gray-500">{steps[currentStep-1].description}. Help buyers understand the value of your code.</p>
          </div>

          <div className="space-y-8 min-h-[400px]">
            
            {/* Step 1: Basic Info */}
            {currentStep === 1 && (
              <div className="space-y-8 animate-in">
                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Listing Title</label>
                  <Input 
                    placeholder="e.g., React Framer Motion Animation Kit" 
                    value={formData.title}
                    onChange={(e) => setFormData(p => ({...p, title: e.target.value}))}
                    className="h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-700 text-lg focus:border-orange-500/50"
                  />
                  <p className="text-[10px] text-gray-600 italic">Recommended: 40-70 characters for best SEO results.</p>
                </div>

                <div className="space-y-3">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Description</label>
                  <Textarea 
                    placeholder="Describe what your code does, features, how to use it..." 
                    className="min-h-[150px] bg-white/5 border-white/10 text-white placeholder:text-gray-700 text-base focus:border-orange-500/50 resize-none p-4"
                    value={formData.description}
                    onChange={(e) => setFormData(p => ({...p, description: e.target.value}))}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Category</label>
                    <div className="grid grid-cols-2 gap-2">
                       {categories?.map((cat) => (
                         <button
                          key={cat.id}
                          onClick={() => setFormData(p => ({...p, category: cat.id}))}
                          className={`p-3 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                            formData.category === cat.id 
                             ? "bg-orange-500/10 border-orange-500/40 text-orange-500" 
                             : "glass border-white/10 text-gray-600 hover:border-white/20"
                          }`}
                         >
                           {cat.icon && <cat.icon className="h-4 w-4" />}
                           <span className="text-[10px] font-bold uppercase tracking-tighter">{cat.name}</span>
                         </button>
                       ))}
                    </div>
                  </div>

                  <div className="space-y-4">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Tech Stack</label>
                    <div className="flex flex-wrap gap-2">
                      {technologies?.map((tech) => (
                        <button
                          key={tech.id}
                          onClick={() => toggleTech(tech.name)}
                          className={`px-4 py-1.5 rounded-lg border text-[10px] font-bold transition-all uppercase tracking-widest ${
                            formData.techStack.includes(tech.name)
                             ? "gradient-bg border-transparent text-white" 
                             : "glass border-white/10 text-gray-600 hover:border-white/20"
                          }`}
                        >
                          {tech.name}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: AI Metadata */}
            {currentStep === 2 && (
              <div className="space-y-10 animate-in">
                <div className="flex items-center gap-4 p-6 rounded-2xl bg-orange-500/5 border border-orange-500/20">
                   <div className="p-3 rounded-xl gradient-bg glow-orange-sm text-white">
                      <Zap className="h-6 w-6" />
                   </div>
                   <div>
                      <h4 className="font-bold text-white uppercase text-sm tracking-tight">AI Transparency</h4>
                      <p className="text-xs text-gray-500">We require generation metadata to ensure buyer trust and platform quality.</p>
                   </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">AI Provider</label>
                    <select 
                      className="w-full h-14 bg-white/5 border border-white/10 rounded-xl px-4 text-white appearance-none focus:outline-none focus:border-orange-500/50"
                      value={formData.aiProvider}
                      onChange={(e) => setFormData(p => ({...p, aiProvider: e.target.value}))}
                    >
                      <option value="" disabled className="bg-background">Select Provider</option>
                      <option value="OpenAI" className="bg-background">OpenAI</option>
                      <option value="Anthropic" className="bg-background">Anthropic</option>
                      <option value="Meta" className="bg-background">Meta (Llama)</option>
                      <option value="Google" className="bg-background">Google (Gemini)</option>
                      <option value="Mistral" className="bg-background">Mistral</option>
                    </select>
                  </div>
                  <div className="space-y-3">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Model Name</label>
                    <Input 
                      placeholder="e.g., GPT-4o, Claude 3.5 Sonnet" 
                      value={formData.aiModel}
                      onChange={(e) => setFormData(p => ({...p, aiModel: e.target.value}))}
                      className="h-14 bg-white/5 border-white/10 text-white placeholder:text-gray-700"
                    />
                  </div>
                </div>

                <div className="glass p-8 rounded-2xl border-white/5 space-y-4">
                   <div className="flex items-start gap-3">
                      <Info className="h-4 w-4 text-orange-500 mt-1" />
                      <div>
                         <p className="text-sm font-bold text-white mb-1">Human-in-the-loop declaration</p>
                         <p className="text-xs text-gray-500 leading-relaxed">By listing this codebase, you confirm that you have reviewed and tested the AI output for functionality, security, and quality standards.</p>
                      </div>
                   </div>
                </div>
              </div>
            )}

            {/* Step 3: Pricing & License */}
            {currentStep === 3 && (
              <div className="space-y-12 animate-in text-center flex flex-col items-center">
                <div className="w-full max-w-sm space-y-6">
                   <label className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] block">Set your Price</label>
                   <div className="relative">
                      <DollarSign className="absolute left-6 top-1/2 -translate-y-1/2 h-8 w-8 text-orange-500" />
                      <Input 
                        type="number" 
                        value={formData.price}
                        onChange={(e) => setFormData(p => ({...p, price: parseFloat(e.target.value)}))}
                        className="h-24 pl-16 text-5xl font-extrabold bg-white/5 border-white/10 text-white text-center focus:border-orange-500/50 rounded-3xl"
                        placeholder="0.00"
                      />
                   </div>
                   <p className="text-sm text-gray-600 font-medium">Keep it <span className="text-orange-400">0.00</span> to list as a free community contribution.</p>
                </div>

                <div className="w-full h-px bg-white/5" />

                <div className="w-full space-y-6">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest block">Select License</label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {["MIT", "Apache 2.0", "Custom"].map((type) => (
                      <button
                        key={type}
                        onClick={() => setFormData(p => ({...p, licenseType: type}))}
                        className={`p-6 rounded-2xl border flex flex-col items-center justify-center gap-3 transition-all ${
                          formData.licenseType === type
                           ? "bg-orange-500/10 border-orange-500/40" 
                           : "glass border-white/10 text-gray-600 hover:border-white/20"
                        }`}
                      >
                         <ShieldCheck className={`h-8 w-8 ${formData.licenseType === type ? 'text-orange-500' : 'text-gray-800'}`} />
                         <span className={`font-bold ${formData.licenseType === type ? 'text-white' : 'text-gray-600'}`}>{type}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Source Code */}
            {currentStep === 4 && (
              <div className="space-y-8 animate-in">
                <div className="flex flex-col md:flex-row gap-4 items-end">
                   <div className="flex-1 space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Entry Filename</label>
                      <Input 
                        placeholder="index.tsx" 
                        value={formData.fileName}
                        onChange={(e) => setFormData(p => ({...p, fileName: e.target.value}))}
                        className="h-12 bg-white/5 border-white/10 text-white"
                      />
                   </div>
                   <div className="flex-1 space-y-3">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Language</label>
                      <select 
                        className="w-full h-12 bg-white/5 border border-white/10 rounded-lg px-4 text-white appearance-none focus:outline-none"
                        value={formData.language}
                        onChange={(e) => setFormData(p => ({...p, language: e.target.value}))}
                      >
                        <option value="typescript" className="bg-background">TypeScript</option>
                        <option value="javascript" className="bg-background">JavaScript</option>
                        <option value="python" className="bg-background">Python</option>
                        <option value="rust" className="bg-background">Rust</option>
                        <option value="go" className="bg-background">Go</option>
                      </select>
                   </div>
                </div>

                <div className="space-y-3 relative group">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                     <FileCode className="h-3 w-3" />
                     Source Code Content
                  </label>
                  <div className="rounded-2xl border border-white/10 overflow-hidden bg-black/40 group-focus-within:border-orange-500/40 transition-colors">
                     <div className="flex items-center gap-2 px-4 py-2 bg-white/5 border-b border-white/5">
                        <div className="flex gap-1.5">
                           <div className="w-2.5 h-2.5 rounded-full bg-red-500/50" />
                           <div className="w-2.5 h-2.5 rounded-full bg-yellow-500/50" />
                           <div className="w-2.5 h-2.5 rounded-full bg-green-500/50" />
                        </div>
                        <span className="text-[10px] text-gray-600 font-mono italic">editor_main.vibecoder</span>
                     </div>
                     <textarea 
                      className="w-full min-h-[300px] bg-transparent text-orange-200/90 font-mono text-sm p-6 focus:outline-none resize-none leading-relaxed"
                      placeholder="// Paste your production-ready AI generated code here..."
                      value={formData.codeContent}
                      onChange={(e) => setFormData(p => ({...p, codeContent: e.target.value}))}
                      spellCheck={false}
                     />
                  </div>
                </div>
              </div>
            )}
            
          </div>

          {/* Footer Controls */}
          <div className="mt-16 flex items-center justify-between pt-8 border-t border-white/5">
            <Button 
              variant="ghost" 
              onClick={handleBack} 
              disabled={currentStep === 1}
              className="text-gray-500 hover:text-white px-8"
            >
              <ChevronLeft className="mr-2 h-4 w-4" />
              Previous
            </Button>
            
            {currentStep === steps.length ? (
              <Button 
                onClick={handleSubmit}
                className="gradient-bg hover:opacity-90 text-white border-0 px-12 h-14 font-black rounded-2xl glow-orange-sm group uppercase tracking-widest"
              >
                Launch Listing
                <Rocket className="ml-2 h-5 w-5 group-hover:-translate-y-1 group-hover:translate-x-1 transition-transform" />
              </Button>
            ) : (
              <Button 
                onClick={handleNext}
                className="gradient-bg hover:opacity-90 text-white border-0 px-12 h-14 font-black rounded-2xl glow-orange-sm group"
              >
                Continue
                <ChevronRight className="ml-1 h-5 w-5 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>

      </main>

      {/* Footer Info */}
      <footer className="py-12 flex justify-center text-[10px] text-gray-700 font-bold uppercase tracking-widest gap-8">
         <div className="flex items-center gap-2">
            <ShieldCheck className="h-3 w-3" />
            End-to-end Encrypted
         </div>
         <div className="flex items-center gap-2">
            <Zap className="h-3 w-3" />
            Instant Deployment
         </div>
      </footer>
    </div>
  );
}
