import { createContext, useContext, useState, useEffect, ReactNode } from "react";

type DesignMode = "modern" | "classic";

interface DesignModeContextType {
  designMode: DesignMode;
  setDesignMode: (mode: DesignMode) => void;
  toggleDesignMode: () => void;
}

const DesignModeContext = createContext<DesignModeContextType | undefined>(undefined);

const DESIGN_MODE_STORAGE_KEY = "pnw-design-mode";

function getStoredDesignMode(): DesignMode {
  if (typeof window === "undefined") return "modern";
  try {
    const stored = localStorage.getItem(DESIGN_MODE_STORAGE_KEY);
    return (stored === "classic" || stored === "modern") ? stored : "modern";
  } catch {
    return "modern";
  }
}

function saveDesignMode(mode: DesignMode) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(DESIGN_MODE_STORAGE_KEY, mode);
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

export function DesignModeProvider({ children }: { children: ReactNode }) {
  const [designMode, setDesignModeState] = useState<DesignMode>(getStoredDesignMode);

  const setDesignMode = (mode: DesignMode) => {
    setDesignModeState(mode);
    saveDesignMode(mode);
  };

  const toggleDesignMode = () => {
    const newMode = designMode === "modern" ? "classic" : "modern";
    setDesignMode(newMode);
  };

  useEffect(() => {
    saveDesignMode(designMode);
  }, [designMode]);

  return (
    <DesignModeContext.Provider value={{ designMode, setDesignMode, toggleDesignMode }}>
      {children}
    </DesignModeContext.Provider>
  );
}

export function useDesignMode() {
  const context = useContext(DesignModeContext);
  if (context === undefined) {
    throw new Error("useDesignMode must be used within a DesignModeProvider");
  }
  return context;
}
