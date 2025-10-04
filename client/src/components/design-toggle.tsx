import { useDesignMode } from "@/contexts/design-mode-context";
import { Button } from "@/components/ui/button";
import { Sparkles, History } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

export default function DesignToggle() {
  const { designMode, toggleDesignMode } = useDesignMode();
  const { trackEvent } = useAnalytics();

  const handleToggle = () => {
    const newMode = designMode === "modern" ? "classic" : "modern";
    toggleDesignMode();
    trackEvent("design_toggle", { mode: newMode });
  };

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      className="gap-2"
      data-testid="design-toggle-button"
      aria-label={designMode === "modern" ? "Switch to Classic View" : "Switch to Modern View"}
      aria-pressed={designMode === "modern"}
      title={designMode === "modern" ? "Switch to Classic View" : "Switch to Modern View"}
    >
      {designMode === "modern" ? (
        <>
          <History className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Classic</span>
        </>
      ) : (
        <>
          <Sparkles className="w-4 h-4" aria-hidden="true" />
          <span className="hidden sm:inline">Modern</span>
        </>
      )}
    </Button>
  );
}
