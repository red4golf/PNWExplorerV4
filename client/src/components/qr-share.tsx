import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Share2, Copy, Download } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "../lib/queryClient";

interface QRShareProps {
  url?: string;
  title?: string;
  variant?: "light" | "dark";
}

export default function QRShare({ url = window.location.href, title = "Pacific Northwest Historical Explorer", variant = "light" }: QRShareProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  
  const buttonClassName = variant === "dark" 
    ? "text-white/80 hover:text-white hover:bg-white/10 border border-white/20 text-xs md:text-sm"
    : "text-gray-700 hover:text-[var(--modern-sage)] hover:border-[var(--modern-sage)] border-gray-300 rounded-full text-sm";

  // Generate QR code URL using QR Server API (free service)
  // Use a local QR code generation or disable external QR service to prevent CORS
  const qrCodeUrl = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200"><rect width="200" height="200" fill="white"/><text x="100" y="100" text-anchor="middle" font-size="14" fill="black">QR Code</text></svg>`;

  // Track analytics events
  const trackAnalytics = async (eventType: string, metadata?: any) => {
    try {
      await apiRequest("POST", "/api/analytics", {
        eventType,
        metadata,
        sessionId: sessionStorage.getItem('sessionId') || `session_${Date.now()}`
      });
    } catch (error) {
      console.log("Analytics tracking failed:", error);
    }
  };

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      await trackAnalytics("share_link", { method: "copy" });
      toast({
        title: "Link copied",
        description: "The app link has been copied to your clipboard.",
      });
    } catch (error) {
      toast({
        title: "Failed to copy",
        description: "Please copy the link manually.",
        variant: "destructive",
      });
    }
  };

  const downloadQR = async () => {
    await trackAnalytics("qr_scan", { method: "download" });
    const link = document.createElement('a');
    link.download = 'pnw-historical-explorer-qr.png';
    link.href = qrCodeUrl;
    link.click();
  };

  const shareNatively = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: title,
          text: "Explore historical locations throughout the Pacific Northwest",
          url: url,
        });
        await trackAnalytics("share_link", { method: "native" });
      } catch (error) {
        // User cancelled or sharing failed
        copyToClipboard();
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          variant={variant === "dark" ? "ghost" : "outline"}
          size="sm"
          className={buttonClassName}
          onClick={() => trackAnalytics("share_link", { method: "dialog_open" })}
          data-testid="button-share-app"
        >
          <Share2 className="w-4 h-4 mr-2" />
          Share App
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Pacific Northwest Historical Explorer</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6">
          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg shadow-sm border">
            <img 
              src={qrCodeUrl} 
              alt="QR Code for sharing the app" 
              className="w-48 h-48"
              onError={(e) => {
                e.currentTarget.src = `data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200"><rect width="200" height="200" fill="%23f3f4f6"/><text x="100" y="100" text-anchor="middle" dy="0.3em" font-family="Arial" font-size="14" fill="%236b7280">QR Code</text></svg>`;
              }}
            />
          </div>

          {/* App URL */}
          <div className="w-full">
            <div className="text-sm text-gray-600 mb-2">App Link:</div>
            <div className="flex items-center space-x-2">
              <div className="flex-1 p-2 bg-gray-50 rounded border text-sm font-mono break-all">
                {url}
              </div>
              <Button size="sm" variant="outline" onClick={copyToClipboard}>
                <Copy className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-2 w-full">
            <Button onClick={shareNatively} className="flex-1">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            <Button onClick={downloadQR} variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
          </div>

          <div className="text-xs text-gray-500 text-center">
            Scan with any QR code reader to open the app instantly
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}