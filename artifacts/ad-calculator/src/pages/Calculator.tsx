import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Eye, Clock, Download, Copy, RotateCcw, CheckCircle2, ChevronRight, BarChart3, Newspaper } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, Cell } from 'recharts';

import { 
  ANALYTICS, 
  AD_INVENTORY, 
  TIERS, 
  ClientType, 
  PRINT_ADDON_MONTHLY, 
  Tier 
} from '@/lib/constants';
import { calculateQuote } from '@/lib/calculator';
import { generatePDFQuote } from '@/lib/pdf-generator';

import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/components/ui/toggle-group';
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from '@/components/ui/tooltip';

export default function CalculatorPage() {
  // State
  const [selectedTier, setSelectedTier] = useState<string | null>(TIERS[0].id);
  const [days, setDays] = useState(30);
  const [clientType, setClientType] = useState<ClientType>('smb');
  const [selectedAdIds, setSelectedAdIds] = useState<string[]>(['med-rect']);
  const [printBundle, setPrintBundle] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'display' | 'video' | 'premium'>('display');
  const [copied, setCopied] = useState(false);

  // Derived state
  const results = useMemo(() => calculateQuote(selectedAdIds, days, clientType, printBundle), [selectedAdIds, days, clientType, printBundle]);
  
  // Formatters
  const fC = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  const fN = (val: number) => new Intl.NumberFormat('en-US').format(Math.round(val));

  // Handlers
  const handleTierSelect = (tier: Tier) => {
    setSelectedTier(tier.id);
    setDays(tier.days);
    setClientType(tier.clientType);
    setSelectedAdIds([...tier.adIds]);
    setPrintBundle(tier.printBundle);
    
    // Switch tab to match first ad
    const firstAd = AD_INVENTORY.find(a => a.id === tier.adIds[0]);
    if (firstAd) setActiveTab(firstAd.category);
  };

  const handleManualChange = (updater: () => void) => {
    setSelectedTier(null); // Break out of tier state
    updater();
  };

  const handleAdToggle = (id: string) => {
    handleManualChange(() => {
      setSelectedAdIds(prev => {
        if (prev.includes(id)) {
          return prev.filter(x => x !== id);
        } else {
          // If custom, allow toggle (multi-select)
          return [...prev, id];
        }
      });
    });
  };

  const handleCopy = () => {
    const selectedAds = selectedAdIds.map(id => AD_INVENTORY.find(a => a.id === id)?.name).join(' + ');
    const text = `DBG Campaign Summary\nFormat: ${selectedAds || 'None'}\nDuration: ${days} Days\nEst. Impressions: ${fN(results.impressions)}\nTotal: ${fC(results.total)}\nEffective CPM: ${fC(results.effectiveCPM)}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleReset = () => {
    handleTierSelect(TIERS[0]);
  };

  // Chart Data
  const chartData = [
    { name: '30 Days', impressions: 30 * ANALYTICS.DAILY_PAGE_VIEWS, active: days === 30 },
    { name: '60 Days', impressions: 60 * ANALYTICS.DAILY_PAGE_VIEWS, active: days === 60 },
    { name: '90 Days', impressions: 90 * ANALYTICS.DAILY_PAGE_VIEWS, active: days === 90 },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      {/* Analytics Header */}
      <header className="bg-primary text-primary-foreground py-3 px-4 shadow-md z-10 relative">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center text-sm font-medium gap-4">
          <div className="flex items-center gap-2">
            <span className="font-display font-bold text-lg mr-4 tracking-wider">DBG MEDIA</span>
            <span className="hidden md:inline px-2 py-0.5 bg-primary-foreground/10 rounded-md text-xs">Internal Calculator</span>
          </div>
          
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-primary-foreground/80">
            <div className="flex items-center gap-1.5" title="Monthly Active Users">
              <Users className="w-4 h-4 text-accent" />
              <span>{fN(ANALYTICS.MONTHLY_ACTIVE_USERS)} MAU</span>
            </div>
            <div className="flex items-center gap-1.5" title="Daily Page Views">
              <Eye className="w-4 h-4 text-accent" />
              <span>~{fN(ANALYTICS.DAILY_PAGE_VIEWS)} DPV</span>
            </div>
            <div className="flex items-center gap-1.5" title="Average Engagement Time">
              <Clock className="w-4 h-4 text-accent" />
              <span>{ANALYTICS.AVG_ENGAGEMENT_SEC}s Avg</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">Advertising Rate Builder</h1>
            <p className="text-muted-foreground mt-2">Configure placements and generate quotes for clients.</p>
          </div>
          <button 
            onClick={handleReset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Reset Defaults</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT COLUMN: Controls */}
          <div className="lg:col-span-8 space-y-10">
            
            {/* TIER PICKER */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                Quick Start Packages
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {TIERS.map(tier => (
                  <button
                    key={tier.id}
                    onClick={() => handleTierSelect(tier)}
                    className={cn(
                      "relative p-5 rounded-2xl border-2 text-left transition-all duration-300 overflow-hidden group",
                      selectedTier === tier.id 
                        ? "border-primary bg-primary/5 shadow-md" 
                        : "border-border bg-card hover:border-primary/30 hover:shadow-sm"
                    )}
                  >
                    {selectedTier === tier.id && (
                      <div className="absolute top-0 right-0 p-3">
                        <CheckCircle2 className="w-5 h-5 text-primary" />
                      </div>
                    )}
                    <h3 className="font-display font-bold text-xl text-foreground">{tier.name}</h3>
                    <div className="mt-1 text-2xl font-bold tracking-tight text-primary">
                      {fC(tier.price)}<span className="text-sm font-normal text-muted-foreground">/mo</span>
                    </div>
                    <ul className="mt-4 space-y-2">
                      {tier.features.map((feat, i) => (
                        <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                          <ChevronRight className="w-4 h-4 text-accent shrink-0 mt-0.5" />
                          {feat}
                        </li>
                      ))}
                    </ul>
                  </button>
                ))}
              </div>
            </section>

            {/* DURATION & CLIENT */}
            <section className="bg-card border border-border p-6 rounded-3xl shadow-sm">
              <h2 className="text-lg font-semibold mb-6 flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                Campaign Parameters
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between items-center mb-4">
                    <label className="text-sm font-medium">Duration</label>
                    <span className="font-bold text-primary">{days} Days <span className="text-muted-foreground font-normal text-sm">(~{Math.round(days/7)} wks)</span></span>
                  </div>
                  
                  <div className="flex gap-2 mb-6">
                    {[7, 14, 30, 60, 90].map(preset => (
                      <button
                        key={preset}
                        onClick={() => handleManualChange(() => setDays(preset))}
                        className={cn(
                          "px-3 py-1 text-xs font-medium rounded-full transition-colors",
                          days === preset ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                        )}
                      >
                        {preset}d
                      </button>
                    ))}
                  </div>
                  
                  <Slider value={days} min={7} max={90} step={1} onChange={(v) => handleManualChange(() => setDays(v))} />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-4">Client Type (Internal Pricing)</label>
                  <ToggleGroup 
                    value={clientType} 
                    onValueChange={(v) => v && handleManualChange(() => setClientType(v as ClientType))}
                    className="w-full flex"
                  >
                    <ToggleGroupItem value="smb" className="flex-1">Small Biz</ToggleGroupItem>
                    <ToggleGroupItem value="corp" className="flex-1">Corp (-5%)</ToggleGroupItem>
                    <ToggleGroupItem value="nonprofit" className="flex-1">NPO (-20%)</ToggleGroupItem>
                  </ToggleGroup>
                  <p className="text-xs text-muted-foreground mt-3 italic">* Client type and discounts are excluded from PDF quotes.</p>
                </div>
              </div>
            </section>

            {/* AD FORMATS */}
            <section>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">3</span>
                Ad Inventory
              </h2>
              
              <div className="mb-6 flex gap-2 border-b border-border pb-px overflow-x-auto no-scrollbar">
                {(['display', 'video', 'premium'] as const).map(tab => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      "px-6 py-3 text-sm font-medium transition-all relative whitespace-nowrap",
                      activeTab === tab ? "text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    {activeTab === tab && (
                      <motion.div 
                        layoutId="activeTab"
                        className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary"
                      />
                    )}
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <AnimatePresence mode="popLayout">
                  {AD_INVENTORY.filter(ad => ad.category === activeTab).map(ad => {
                    const isSelected = selectedAdIds.includes(ad.id);
                    return (
                      <motion.button
                        key={ad.id}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        onClick={() => handleAdToggle(ad.id)}
                        className={cn(
                          "flex flex-col text-left p-5 rounded-2xl border transition-all duration-200 group relative overflow-hidden",
                          isSelected 
                            ? "border-accent ring-1 ring-accent bg-accent/5 shadow-md" 
                            : "border-border bg-card hover:border-primary/30"
                        )}
                      >
                        <div className="flex justify-between items-start w-full mb-2">
                          <h3 className="font-bold text-foreground pr-4">{ad.name}</h3>
                          <div className={cn(
                            "w-5 h-5 rounded-full border flex items-center justify-center shrink-0 transition-colors",
                            isSelected ? "border-accent bg-accent text-accent-foreground" : "border-muted-foreground"
                          )}>
                            {isSelected && <CheckCircle2 className="w-3.5 h-3.5" />}
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground mb-4">{ad.desc}</p>
                        <div className="mt-auto flex justify-between items-end w-full">
                          <div className="bg-muted px-2 py-1 rounded text-xs font-mono text-muted-foreground">
                            {ad.dimensions}
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-foreground">{fC(ad.baseDay)}<span className="text-xs text-muted-foreground font-normal">/day</span></div>
                            <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{fC(ad.cpm)} CPM Base</div>
                          </div>
                        </div>
                      </motion.button>
                    )
                  })}
                </AnimatePresence>
              </div>
            </section>

            {/* UPSELLS */}
            <section className="bg-gradient-to-r from-secondary/50 to-transparent border border-border p-6 rounded-3xl">
               <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <span className="bg-primary/10 text-primary w-6 h-6 rounded-full flex items-center justify-center text-sm">4</span>
                Bundles & Add-ons
              </h2>
              <div className="flex items-center justify-between p-4 bg-card rounded-2xl border border-border shadow-sm">
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-primary/5 rounded-xl text-primary">
                    <Newspaper className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-foreground">Print Bundle Setup</h4>
                    <p className="text-sm text-muted-foreground mt-0.5">Our Time Press + Bed-Stuy Villager</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right hidden sm:block">
                    <div className="font-bold">+{fC(PRINT_ADDON_MONTHLY)}</div>
                    <div className="text-xs text-muted-foreground">per month</div>
                  </div>
                  <Switch 
                    id="print-bundle"
                    checked={printBundle} 
                    onCheckedChange={(v) => handleManualChange(() => setPrintBundle(v))} 
                  />
                </div>
              </div>
            </section>

          </div>

          {/* RIGHT COLUMN: Results Panel */}
          <div className="lg:col-span-4 relative">
            <div className="sticky top-8 space-y-6">
              
              <div className="bg-primary text-primary-foreground rounded-3xl shadow-xl overflow-hidden flex flex-col h-full">
                <div className="p-8">
                  <h3 className="font-display text-xl font-bold opacity-90 mb-6">Campaign Summary</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <div className="text-primary-foreground/60 text-sm mb-1">Estimated Impressions</div>
                      <div className="text-4xl font-display font-bold">{fN(results.impressions)}</div>
                    </div>

                    <div className="flex items-center justify-between border-t border-primary-foreground/10 pt-6">
                      <div className="text-primary-foreground/60 text-sm flex items-center gap-2">
                        Effective CPM
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="w-4 h-4 rounded-full border border-primary-foreground/30 flex items-center justify-center text-[10px]">?</div>
                            </TooltipTrigger>
                            <TooltipContent className="bg-card text-foreground p-3 max-w-[200px]">
                              <p className="text-sm font-medium mb-1">2026 Benchmarks</p>
                              <ul className="text-xs text-muted-foreground space-y-1">
                                <li>Display: $3 – $12</li>
                                <li>Video: $10 – $25</li>
                              </ul>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                      <div className="text-xl font-medium tracking-tight">{fC(results.effectiveCPM)}</div>
                    </div>
                  </div>
                </div>

                <div className="bg-card text-foreground p-8 mt-auto rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.1)]">
                  <div className="space-y-4 text-sm mb-6">
                    <div className="flex justify-between items-end">
                      <span className="text-muted-foreground">Ad Units ({selectedAdIds.length})</span>
                      <span className="font-medium">{fC(results.totalDailyRate)} / day</span>
                    </div>
                    
                    {printBundle && (
                      <div className="flex justify-between items-end text-accent">
                        <span className="font-medium">Print Add-on</span>
                        <span className="font-medium">{fC((PRINT_ADDON_MONTHLY / 30) * days)}</span>
                      </div>
                    )}
                  </div>
                  
                  <div className="border-t border-border pt-6 mb-8">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-lg font-bold">Total Investment</span>
                      <span className="text-3xl font-display font-bold text-primary">{fC(results.total)}</span>
                    </div>
                    {results.discount > 0 && (
                      <div className="text-right">
                        <span className="inline-block bg-accent/10 text-accent px-2 py-1 rounded text-xs font-bold uppercase tracking-wider">
                          {(results.discount * 100)}% Discount Applied
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-3">
                    <button
                      onClick={() => generatePDFQuote(selectedAdIds, days, printBundle)}
                      disabled={selectedAdIds.length === 0}
                      className={cn(
                        "w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all duration-300 shadow-lg",
                        selectedAdIds.length > 0 
                          ? "bg-accent text-accent-foreground shadow-accent/25 hover:shadow-xl hover:shadow-accent/40 hover:-translate-y-0.5" 
                          : "bg-muted text-muted-foreground cursor-not-allowed shadow-none"
                      )}
                    >
                      <Download className="w-5 h-5" />
                      Generate PDF Quote
                    </button>
                    
                    <button
                      onClick={handleCopy}
                      className="w-full py-3 rounded-xl font-medium text-sm border-2 border-border text-foreground hover:bg-muted transition-colors flex items-center justify-center gap-2"
                    >
                      {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                      {copied ? "Copied to Clipboard" : "Copy Summary Text"}
                    </button>
                  </div>
                </div>
              </div>

              {/* Chart Panel */}
              <div className="bg-card border border-border p-6 rounded-3xl shadow-sm">
                <h4 className="font-bold text-sm mb-6 flex items-center gap-2 text-foreground">
                  <BarChart3 className="w-4 h-4 text-accent" />
                  Impression Projections
                </h4>
                <div className="h-[180px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                      <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} dy={10} />
                      <RechartsTooltip 
                        cursor={{fill: 'transparent'}}
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <div className="bg-primary text-primary-foreground text-xs p-2 rounded shadow-xl font-medium">
                                {fN(payload[0].value as number)} Impr.
                              </div>
                            );
                          }
                          return null;
                        }}
                      />
                      <Bar dataKey="impressions" radius={[4, 4, 4, 4]}>
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.active ? 'hsl(var(--accent))' : 'hsl(var(--muted))'} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
