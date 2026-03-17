import * as React from "react"
import { cn } from "./toggle-group"

export function Slider({ 
  value, 
  min = 0, 
  max = 100, 
  step = 1, 
  onChange 
}: { 
  value: number; 
  min?: number; 
  max?: number; 
  step?: number; 
  onChange: (val: number) => void 
}) {
  const percentage = ((value - min) / (max - min)) * 100;

  return (
    <div className="relative w-full h-6 flex items-center group">
      <div className="absolute w-full h-2 bg-muted rounded-full overflow-hidden">
        <div 
          className="absolute h-full bg-primary transition-all duration-150 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="absolute w-full h-full opacity-0 cursor-pointer"
      />
      <div 
        className="absolute h-5 w-5 bg-background border-2 border-primary rounded-full shadow-md pointer-events-none transition-transform group-active:scale-110"
        style={{ left: `calc(${percentage}% - 10px)` }}
      />
    </div>
  )
}
