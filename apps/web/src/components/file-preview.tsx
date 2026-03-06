"use client";

import { X, ChevronLeft, ChevronRight, File } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/components/auth-provider";
import { toast } from "sonner";

interface FilePreviewProps {
  url: string | string[] | undefined | null;
  onClose: () => void;
  title?: string;
}

async function detectFileType(blob: Blob): Promise<string | null> {
    try {
        const buffer = await blob.slice(0, 12).arrayBuffer();
        const arr = new Uint8Array(buffer);
        
        // JPEG: FF D8 FF
        if (arr[0] === 0xFF && arr[1] === 0xD8 && arr[2] === 0xFF) return 'image/jpeg';
        
        // PNG: 89 50 4E 47 0D 0A 1A 0A
        if (arr[0] === 0x89 && arr[1] === 0x50 && arr[2] === 0x4E && arr[3] === 0x47 && 
            arr[4] === 0x0D && arr[5] === 0x0A && arr[6] === 0x1A && arr[7] === 0x0A) return 'image/png';
            
        // PDF: %PDF (25 50 44 46)
        if (arr[0] === 0x25 && arr[1] === 0x50 && arr[2] === 0x44 && arr[3] === 0x46) return 'application/pdf';

        // GIF: GIF87a or GIF89a
        if (arr[0] === 0x47 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x38 && 
            (arr[4] === 0x37 || arr[4] === 0x39) && arr[5] === 0x61) return 'image/gif';
            
        // WebP: RIFF .... WEBP
        if (arr[0] === 0x52 && arr[1] === 0x49 && arr[2] === 0x46 && arr[3] === 0x46 &&
            arr[8] === 0x57 && arr[9] === 0x45 && arr[10] === 0x42 && arr[11] === 0x50) return 'image/webp';
    } catch (e) {
        console.warn('Failed to detect file type', e);
    }
    return null;
}

export function FilePreview({ url, onClose, title }: FilePreviewProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const { token } = useAuth();
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  const [contentType, setContentType] = useState<string | null>(null);

  // Normalize input to array
  const urls: string[] = Array.isArray(url) 
    ? url.filter(u => !!u) 
    : url ? [url] : [];
  
  // Reset index if urls change
  useEffect(() => {
    setActiveIndex(0);
  }, [JSON.stringify(urls)]);

  const currentUrl = urls.length > 0 ? urls[activeIndex] : null;

  // Handle protected URLs by fetching with auth token
  useEffect(() => {
    if (!currentUrl) return;
    
    let active = true;
    setLoading(true);
    setObjectUrl(null);
    setContentType(null);

    const isProtected = currentUrl.startsWith('/api') || !currentUrl.startsWith('http');
    
    if (isProtected && token) {
        fetch(currentUrl, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        })
        .then(async (res) => {
            if (!res.ok) {
                // Try to capture server diagnostic message
                let bodyText = '';
                try {
                    bodyText = await res.text();
                } catch (e) {}
                const err = new Error(`Failed to load file (status=${res.status}) ${bodyText ? '- ' + bodyText : ''}`);
                // If this looks like the documents download endpoint and we got 401/403, try fetching metadata
                if ((res.status === 401 || res.status === 403) && /\/api\/documents\/[0-9a-fA-F-]+\/download/.test(currentUrl)) {
                    try {
                        const idMatch = currentUrl.match(/\/api\/documents\/([0-9a-fA-F-]+)\/download/);
                        if (idMatch) {
                            const infoUrl = `/api/documents/${idMatch[1]}/info`;
                            const infoRes = await fetch(infoUrl, { headers: { 'Authorization': `Bearer ${token}` } });
                            let infoBody = '';
                            try { infoBody = await infoRes.text(); } catch (e) {}
                            console.warn(`Document info response: status=${infoRes.status}`, infoBody);
                        }
                    } catch (e) {
                        console.warn('Failed to fetch document info for diagnostics', e);
                    }
                }
                throw err;
            }
            let type = res.headers.get('content-type');
            const blob = await res.blob();

            // Try to detect actual type if missing or generic
            if (!type || type === 'application/octet-stream' || type === 'application/binary') {
                const detected = await detectFileType(blob);
                if (detected) type = detected;
            }
            
            return { blob, type: type || blob.type };
        })
        .then(({ blob, type }) => {
            if (active) {
                const objUrl = URL.createObjectURL(blob);
                setObjectUrl(objUrl);
                setContentType(type);
                setLoading(false);
            }
        })
        .catch(err => {
            console.error("Error loading file preview:", err);
            if (active) setLoading(false);
            try {
                const msg = String(err?.message || 'Failed to load file');
                if (msg.includes('status=401')) {
                    toast.error('Unauthorized: your session may have expired. Please log out and log in again.');
                } else if (msg.includes('status=403')) {
                    toast.error('Forbidden: you do not have permission to view this file.');
                } else {
                    toast.error('Failed to load file preview');
                }
            } catch (e) {}
        });
    } else {
        // Public URL
        setObjectUrl(currentUrl);
        setLoading(false);
    }
    
    return () => {
        active = false;
        if (objectUrl && objectUrl.startsWith('blob:')) {
            URL.revokeObjectURL(objectUrl);
        }
    };
  }, [currentUrl, token]);

  if (urls.length === 0) {
      return null;
  }
  
  // Simple extension check on original URL to determine type (if possible)
  // or check blob type if available?
  const isPdf = currentUrl?.toLowerCase().includes('.pdf') || (contentType === 'application/pdf') || (objectUrl && contentType === 'application/pdf'); 
  const isImage = /\.(jpg|jpeg|png|gif|webp|svg)/i.test(currentUrl || '') || (currentUrl?.toLowerCase().includes('image')) || (contentType?.startsWith('image/'));
  
  // Handlers
  const handlePrev = () => setActiveIndex(prev => Math.max(0, prev - 1));
  const handleNext = () => setActiveIndex(prev => Math.min(urls.length - 1, prev + 1));

  // Determine what to show
  const displayUrl = objectUrl || currentUrl;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 md:p-8 backdrop-blur-sm animate-in fade-in zoom-in-95 duration-200">
      <div className="relative flex flex-col w-full h-full max-w-6xl bg-card border rounded-xl shadow-2xl overflow-hidden ring-1 ring-border/50">
        
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30 shrink-0 z-10">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-4">
            <div className="h-9 w-9 rounded-full bg-primary/10 flex items-center justify-center text-primary shrink-0 border border-primary/20">
                <File className="h-4.5 w-4.5" />
            </div>
            <div className="min-w-0 flex flex-col justify-center">
                <h3 className="font-semibold text-sm truncate leading-tight">{title || 'File Preview'}</h3>
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-medium truncate">
                   {urls.length > 1 ? `File ${activeIndex + 1} of ${urls.length}` : 'Document Viewer'}
                </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 shrink-0">
             <div className="w-px h-6 bg-border mx-1 hidden sm:block" />
             <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full hover:bg-muted text-muted-foreground hover:text-foreground">
                <X className="h-5 w-5" />
             </Button>
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 bg-muted/10 relative overflow-hidden flex items-center justify-center">
            {/* Navigation Buttons (only if multiple files) */}
            {urls.length > 1 && (
                <>
                    <Button 
                        variant="secondary" 
                        size="icon" 
                        className="absolute left-4 z-20 h-10 w-10 rounded-full shadow-lg border border-border/50 disabled:opacity-30 backdrop-blur-sm bg-background/80"
                        onClick={handlePrev}
                        disabled={activeIndex === 0}
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>

                    <Button 
                        variant="secondary" 
                        size="icon" 
                        className="absolute right-4 z-20 h-10 w-10 rounded-full shadow-lg border border-border/50 disabled:opacity-30 backdrop-blur-sm bg-background/80"
                        onClick={handleNext}
                        disabled={activeIndex === urls.length - 1}
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </>
            )}

            {/* Viewer */}
            <div className="w-full h-full flex items-center justify-center p-1 sm:p-4 overflow-auto">
                {loading ? (
                     <div className="flex flex-col items-center gap-2">
                         <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                         <span className="text-xs text-muted-foreground">Loading preview...</span>
                     </div>
                ) : isPdf && displayUrl ? (
                    <iframe
                        src={`${displayUrl}#view=FitH`}
                        className="w-full h-full rounded-lg shadow-sm bg-white border border-border/50"
                        title={`PDF Preview ${activeIndex + 1}`}
                    />
                ) : isImage && displayUrl ? (
                    <img 
                        src={displayUrl} 
                        alt={`Preview ${activeIndex + 1}`} 
                        className="max-w-full max-h-full object-contain rounded-lg shadow-sm"
                    />
                ) : (
                    <div className="text-center p-10 max-w-sm mx-auto border border-dashed rounded-xl bg-muted/30">
                        <File className="h-12 w-12 mx-auto text-muted-foreground/50 mb-4" />
                        <h4 className="font-medium mb-1">Preview not available</h4>
                        <p className="text-sm text-muted-foreground mb-4">This file type cannot be previewed directly in the browser.</p>
                        <Button asChild variant="default" size="sm">
                            <a href={currentUrl || '#'} download target="_blank" rel="noopener noreferrer">
                                Download File
                            </a>
                        </Button>
                    </div>
                )}
            </div>
        </div>

        {/* Footer Indicators */}
        {urls.length > 1 && (
            <div className="bg-muted/30 border-t p-2 flex justify-center gap-1.5 overflow-x-auto shrink-0 z-10">
                {urls.map((_, idx) => (
                    <button
                        key={idx}
                        onClick={() => setActiveIndex(idx)}
                        className={cn(
                            "h-1.5 rounded-full transition-all duration-300",
                            idx === activeIndex ? "bg-primary w-6" : "bg-primary/20 w-1.5 hover:bg-primary/40"
                        )}
                        aria-label={`Go to file ${idx + 1}`}
                    />
                ))}
            </div>
        )}
      </div>
    </div>
  );
}
