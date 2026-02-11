"use client";

import { useState } from "react";
import Editor from "@monaco-editor/react";
import { FileCode, Lock } from "lucide-react";
import { Button } from "./ui/button";

interface CodeFile {
  id: string;
  filename: string;
  language: string;
  sizeBytes: number;
  isMain: boolean;
  content: string | null;
}

interface CodePreviewProps {
  files: CodeFile[];
}

export function CodePreview({ files }: CodePreviewProps) {
  const [selectedFile, setSelectedFile] = useState<CodeFile | null>(
    files.find((f) => f.isMain) || files[0] || null
  );

  if (!files || files.length === 0) {
    return null;
  }

  const handleFileSelect = (file: CodeFile) => {
    setSelectedFile(file);
  };

  return (
    <div className="glass-card rounded-3xl overflow-hidden border-orange-500/20 flex flex-col h-[600px]">
      <div className="flex items-center justify-between p-4 border-b border-white/5 bg-black/20">
        <div className="flex items-center gap-3">
          <FileCode className="h-5 w-5 text-orange-500" />
          <h2 className="text-lg font-bold text-white">Code Preview</h2>
        </div>
        <div className="text-xs text-gray-500 font-mono">
           {selectedFile ? `${selectedFile.filename} (${(selectedFile.sizeBytes / 1024).toFixed(1)} KB)` : ""}
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* File List */}
        <div className="w-64 border-r border-white/5 overflow-y-auto bg-black/10">
          <div className="p-2 space-y-1">
            {files.map((file) => (
              <button
                key={file.id}
                onClick={() => handleFileSelect(file)}
                className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition-colors flex items-center justify-between group ${
                  selectedFile?.id === file.id
                    ? "bg-orange-500/10 text-orange-400 border border-orange-500/20"
                    : "text-gray-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span className="truncate">{file.filename}</span>
                {file.isMain && (
                   <span className="text-[10px] uppercase font-bold tracking-wider text-orange-500/60 ml-2">Main</span>
                )}
                {!file.content && !file.isMain && (
                   <Lock className="h-3 w-3 text-gray-600 group-hover:text-gray-500" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Editor Area */}
        <div className="flex-1 relative bg-[#1e1e1e]">
          {selectedFile?.content ? (
            <Editor
              height="100%"
              defaultLanguage={selectedFile.language.toLowerCase()}
              language={selectedFile.language.toLowerCase()}
              value={selectedFile.content}
              theme="vs-dark"
              options={{
                readOnly: true,
                minimap: { enabled: false },
                scrollBeyondLastLine: false,
                fontSize: 14,
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                lineNumbers: "on",
                renderLineHighlight: "all",
              }}
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <div className="w-16 h-16 rounded-2xl glass border border-white/5 flex items-center justify-center mb-6">
                <Lock className="h-8 w-8 text-orange-500" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Protected File</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                This file is part of the premium package. Purchase the listing to access the full codebase.
              </p>
              <Button className="gradient-bg hover:opacity-90 text-white border-0 glow-orange-sm">
                Unlock Full Access
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
