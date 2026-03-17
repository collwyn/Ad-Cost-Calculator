import * as React from "react"
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const ToggleGroupContext = React.createContext<{
  value: string;
  onValueChange: (value: string) => void;
} | null>(null);

export function ToggleGroup({ 
  value, 
  onValueChange, 
  children, 
  className 
}: { 
  value: string; 
  onValueChange: (v: string) => void; 
  children: React.ReactNode; 
  className?: string;
}) {
  return (
    <ToggleGroupContext.Provider value={{ value, onValueChange }}>
      <div className={cn("inline-flex bg-muted p-1 rounded-xl", className)} role="group">
        {children}
      </div>
    </ToggleGroupContext.Provider>
  )
}

export function ToggleGroupItem({ 
  value, 
  children, 
  className 
}: { 
  value: string; 
  children: React.ReactNode; 
  className?: string;
}) {
  const context = React.useContext(ToggleGroupContext);
  if (!context) throw new Error("ToggleGroupItem must be used within ToggleGroup");
  
  const isSelected = context.value === value;
  
  return (
    <button
      type="button"
      onClick={() => context.onValueChange(value)}
      className={cn(
        "px-4 py-2 text-sm font-medium transition-all rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring",
        isSelected 
          ? "bg-background text-foreground shadow-sm shadow-black/5" 
          : "text-muted-foreground hover:text-foreground hover:bg-background/50",
        className
      )}
    >
      {children}
    </button>
  )
}
