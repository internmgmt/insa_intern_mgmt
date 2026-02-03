"use client";

import { X } from "lucide-react";
import { Button } from "./ui/button";

interface FilePreviewProps {
  url: string;
  onClose: () => void;
  title?: string;
}

export function FilePreview({ url, onClose, title }: FilePreviewProps) {
  const isPdf = url.toLowerCase().endsWith('.pdf');
  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(url);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 md:p-10">
      <div className="relative flex flex-col w-full h-full max-w-5xl bg-card border rounded-xl shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold truncate">{title || 'File Preview'}</h3>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex-1 bg-muted/30 overflow-auto flex items-center justify-center">
          {isPdf ? (
            <iframe
              src={`${url}#toolbar=0`}
              className="w-full h-full border-none"
              title="PDF Preview"
            />
          ) : isImage ? (
            <img src={url} alt={title} className="max-w-full max-h-full object-contain" />
          ) : (
            <div className="text-center p-10">
              <p className="text-muted-foreground mb-4">Preview not available for this file type.</p>
              <Button asChild>
                <a href={url} download>Download to view</a>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
