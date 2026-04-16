"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileUp, X, CheckCircle2, AlertCircle, Loader2 } from "lucide-react";
import Papa from "papaparse";
import { cn } from "@/lib/utils";

interface CsvUploaderProps {
  onDataReady: (reviews: any[], productName: string) => void;
  className?: string;
}

export default function CsvUploader({ onDataReady, className }: CsvUploaderProps) {
  const [isParsing, setIsParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    setFileName(file.name);
    setIsParsing(true);
    setError(null);

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setIsParsing(false);
        const data = results.data as any[];

        // Validate structure
        const firstRow = data[0];
        const required = ["review_text", "rating"];
        const missing = required.filter(col => !(col in firstRow));

        if (missing.length > 0) {
          setError(`Missing required columns: ${missing.join(", ")}. Please use "review_text" and "rating".`);
          return;
        }

        // Normalize data for the intelligence service
        const normalized = data.map(item => ({
          text: item.review_text || item.text || "",
          rating: parseFloat(item.rating) || 5,
          date: item.date || new Date().toISOString()
        })).filter(item => item.text.length > 10);

        if (normalized.length === 0) {
          setError("No valid reviews found in CSV. Ensure at least 10 characters per review.");
          return;
        }

        const productName = file.name.replace(".csv", "").replace(/-/g, " ");
        onDataReady(normalized, productName);
      },
      error: (err) => {
        setIsParsing(false);
        setError("Failed to parse CSV file: " + err.message);
      }
    });
  }, [onDataReady]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "text/csv": [".csv"]
    },
    multiple: false
  });

  return (
    <div className={cn("w-full", className)}>
      <div 
        {...getRootProps()} 
        className={cn(
          "relative border-2 border-dashed rounded-2xl p-8 transition-all cursor-pointer flex flex-col items-center justify-center text-center",
          isDragActive ? "border-indigo-500 bg-indigo-50/50" : "border-slate-200 hover:border-indigo-300 hover:bg-slate-50",
          error ? "border-red-200 bg-red-50/30" : ""
        )}
      >
        <input {...getInputProps()} />
        
        {isParsing ? (
          <div className="flex flex-col items-center">
            <Loader2 className="w-10 h-10 text-indigo-500 animate-spin mb-4" />
            <p className="text-sm font-bold text-slate-900">Analyzing CSV Data...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center">
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <p className="text-sm font-bold text-red-600 mb-1">Upload Error</p>
            <p className="text-xs text-red-500 max-w-xs">{error}</p>
            <button className="mt-4 text-xs font-black uppercase tracking-widest text-indigo-600">Try Another File</button>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mb-4" />
            <p className="text-sm font-bold text-slate-900">{fileName}</p>
            <p className="text-xs text-slate-500">File processed successfully</p>
          </div>
        ) : (
          <>
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center mb-4">
              <FileUp className="w-6 h-6 text-indigo-600" />
            </div>
            <h4 className="text-sm font-bold text-slate-900 mb-1">
              {isDragActive ? "Drop CSV here" : "Scraper Blocked? Upload CSV"}
            </h4>
            <p className="text-xs text-slate-500 mb-4 max-w-[200px] mx-auto">
              Amazon blocking our scan? Paste your reviews into a CSV and upload here.
            </p>
            <div className="flex gap-2">
               <div className="px-2 py-1 rounded bg-slate-100 text-[10px] font-black uppercase text-slate-400">review_text</div>
               <div className="px-2 py-1 rounded bg-slate-100 text-[10px] font-black uppercase text-slate-400">rating</div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
