import { lazy, Suspense, useState } from "react";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { Leaf, Bell, ChevronRight, MapPin, ShieldCheck, Droplets, TrendingUp, Truck, Bug, Globe2, ArrowUpRight, X, Check, FileCheck2, Sprout, Loader2, Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { ForecastTimeline } from "@/components/ForecastTimeline";
import { SupportFinancialImpact, money } from "@/components/SupportFinancialImpact";
import { crops, filterAlerts, getSupportImpact, type Crop, type Category, type IntelligenceAlert } from "@/lib/apetit-intelligence";
import { getRiskTimeline } from "@/lib/risk-scenarios";
import fields from "@/assets/finnish-fields.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Apetit — Farmer-first Supply Chain & Risk Intelligence" },
    { name: "description", content: "Explore crop risks, inspect source evidence and compare farmer-first support proposals in Apetit’s interactive supply chain dashboard." },
    { property: "og:title", content: "Apetit — Supply Chain & Risk Intelligence" },
    { property: "og:description", content: "Crop-level risk maps, forecast timelines and ethical farmer-support scenarios for Apetit." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Index,
});
const SupplierMap = lazy(() => import("@/components/SupplierMap"));
const icons = { Climate: Droplets, Economic: TrendingUp, Political: Globe2, Logistical: Truck, Biological: Bug };
const categories: Category[] = ["Climate", "Economic", "Political", "Logistical", "Biological"];
const emptySuppliers: [] = [];
const severityColor = { Critical: "text-critical", Watch: "text-warning", Managed: "text-primary" };
const severityDot = { Critical: "bg-critical", Watch: "bg-warning", Managed: "bg-primary" };

function Index() {
  const [crop, setCrop] = useState<Crop | "All crops">("All crops");
  const [category, setCategory] = useState<Category | "All risks">("All risks");
  const [selectedId, setSelectedId] = useState("finland-drought");
  const filtered = filterAlerts(crop, category);
  const selected = filtered.find(alert => alert.id === selectedId) ?? filtered[0];
  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card"><div className="mx-auto flex max-w-[1800px] items-center justify-between gap-3 px-5 py-3 sm:px-7">
      <div className="flex items-center gap-4"><span className="apetit-wordmark text-4xl text-primary">apetit</span><span className="hidden h-7 border-l sm:block" /><div className="hidden sm:block"><p className="text-xs font-bold">Supply Chain Intelligence</p><p className="mt-0.5 text-[10px] text-muted-foreground">GROWING RESILIENCE, TOGETHER</p></div></div>
      <div className="flex items-center gap-4"><span className="flex items-center gap-1.5 text-[10px] text-muted-foreground"><span className="h-1.5 w-1.5 rounded-full bg-warning" />Scenario workspace</span><Bell className="hidden h-4 w-4 text-muted-foreground sm:block" /><span className="flex h-8 w-8 items-center justify-center rounded-full bg-accent text-xs font-bold text-primary">AP</span></div>
    </div></header>
    <div className="mx-auto max-w-[1800px] lg:grid lg:grid-cols-[250px_minmax(0,1fr)]">
      <aside className="border-b bg-card p-5 lg:min-h-[calc(100vh-73px)] lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between"><h2 className="text-sm font-bold">AI Risk Feed</h2><span className="text-xs text-muted-foreground">{filtered.length} alerts</span></div>
        <p className="mt-1 text-[11px] text-muted-foreground">Partner farms & global supply</p>
        <label className="mt-5 block text-[10px] font-bold text-muted-foreground" htmlFor="crop-filter">PRODUCT CATEGORY</label>
        <select id="crop-filter" value={crop} onChange={event => setCrop(event.target.value as Crop | "All crops")} className="mt-2 h-10 w-full rounded-md border bg-card px-3 text-xs"><option>All crops</option>{crops.map(item => <option key={item}>{item}</option>)}</select>
        <label className="mt-4 block text-[10px] font-bold text-muted-foreground" htmlFor="risk-filter">RISK CATEGORY</label>
        <select id="risk-filter" value={category} onChange={event => setCategory(event.target.value as Category | "All risks")} className="mt-2 h-10 w-full rounded-md border bg-card px-3 text-xs"><option>All risks</option>{categories.map(item => <option key={item}>{item}</option>)}</select>
        <div className="mt-5 flex items-center gap-3 border-y py-3 text-[10px] text-muted-foreground"><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-critical" />Critical</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-warning" />Watch</span><span className="flex items-center gap-1"><span className="h-1.5 w-1.5 rounded-full bg-primary" />Managed</span></div>
        <div className="mt-4 grid max-h-[330px] gap-2 overflow-y-auto lg:max-h-[680px]">{filtered.map(alert => { const Icon = icons[alert.category]; return <Button key={alert.id} variant="ghost" aria-pressed={alert.id === selected?.id} onClick={() => setSelectedId(alert.id)} className={`h-auto w-full min-w-0 flex-col items-start gap-2 whitespace-normal rounded-md border p-3 text-left ${alert.id === selected?.id ? "border-primary bg-accent" : "border-transparent bg-card"}`}>
          <span className="flex w-full items-center justify-between"><span className={`flex items-center gap-1.5 text-[9px] font-bold uppercase ${severityColor[alert.severity]}`}><span className={`h-1.5 w-1.5 rounded-full ${severityDot[alert.severity]}`} />{alert.severity}</span><Icon className="h-3.5 w-3.5 text-muted-foreground" /></span>
          <span className="text-xs font-bold leading-5">{alert.title}</span><span className="text-[10px] font-normal text-muted-foreground">{alert.region}</span><span className="flex w-full items-center justify-between text-[10px] font-normal text-primary"><span>{alert.crops.map(item => item === "Rapeseed (Canola)" ? "Rapeseed" : item).join(" · ")}</span><ChevronRight className="h-3 w-3 shrink-0" /></span>
        </Button>; })}</div>
        {!filtered.length && <p className="py-6 text-xs text-muted-foreground">No alerts match these filters.</p>}
        <div className="mt-6 border-t pt-4"><div className="flex items-center gap-2 text-xs font-semibold text-primary"><ShieldCheck className="h-4 w-4" />Farmers first. Always.</div><p className="mt-2 text-[10px] leading-5 text-muted-foreground">Support local growers. Protect the harvest. Strengthen long-term partnerships.</p></div>
      </aside>
      {selected ? <Workspace key={selected.id} alert={selected} /> : <main className="flex min-h-[500px] flex-col items-center justify-center gap-4 p-8"><Sprout className="h-10 w-10 text-primary" /><h1 className="text-xl font-bold">No matching risks</h1><Button variant="outline" onClick={() => { setCrop("All crops"); setCategory("All risks"); }}>Clear filters</Button></main>}
    </div>
  </div>;
}

function Workspace({ alert }: { alert: IntelligenceAlert }) {
  const [day, setDay] = useState(0);
  const [panelOpen, setPanelOpen] = useState(true);
  const [selectedActionId, setSelectedActionId] = useState(alert.actions[0]?.id);
  const [planned, setPlanned] = useState<string[]>([]);
  const action = alert.actions.find(item => item.id === selectedActionId) ?? alert.actions[0];
  if (!action) return null;
  const timeline = getRiskTimeline(alert.mapRisk);
  const impact = getSupportImpact(alert, action, day);
  const Icon = icons[alert.category];
  return <main className="min-w-0">
    <div className="flex flex-wrap items-end justify-between gap-4 border-b px-5 py-5 sm:px-7"><div><div className="mb-2 flex items-center gap-2 text-[10px] text-muted-foreground"><span>Intelligence workspace</span><ChevronRight className="h-3 w-3" /><span>{alert.category}</span></div><h1 className="text-xl font-bold">Risk & harvest overview</h1><p className="mt-1 text-xs text-muted-foreground">{alert.region} · {timeline.horizon}</p></div><span className="flex items-center gap-1.5 text-[10px] text-primary"><Leaf className="h-3.5 w-3.5" />Local growers. Long-term resilience.</span></div>
    <div className={`grid min-w-0 ${panelOpen ? "xl:grid-cols-[minmax(0,1fr)_330px]" : "grid-cols-1"}`}>
      <div className="min-w-0 space-y-5 p-5 sm:p-7">
        <div className="grid grid-cols-3 gap-3 border-b pb-5"><Metric label="Partner farms affected" value={String(alert.farmers)} /><Metric label="Potential risk exposure" value={money(impact.unresolved)} critical /><Metric label="Affected crops" value={String(alert.crops.length)} /></div>
        <section aria-label="Risk map"><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-bold">Predictive Risk Navigator</h2><Button variant="ghost" size="sm" onClick={() => setPanelOpen(true)} className="h-7 px-2 text-[10px]"><Icon className="h-3 w-3" />{alert.category} analysis<ArrowUpRight className="h-3 w-3" /></Button></div>
          <div className="map-frame relative h-[390px] overflow-hidden rounded-md border sm:h-[440px]">
            <ClientOnly fallback={<MapLoading />}><Suspense fallback={<MapLoading />}><SupplierMap riskId={alert.mapRisk} day={day} suppliers={emptySuppliers} alert={alert} onRiskClick={() => setPanelOpen(true)} /></Suspense></ClientOnly>
          </div>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-[10px] text-muted-foreground"><span className="flex items-center gap-2"><span className={`h-2 w-12 rounded-sm ${alert.overlay === "radar" ? alert.mapRisk === "heatwave" ? "radar-heat-scale" : "radar-rain-scale" : "bg-critical"}`} />{alert.overlay === "radar" ? alert.mapRisk === "heatwave" ? "Heat / drought intensity" : "Rainfall intensity" : "Affected farms / routes"}</span><span>Simulated projection · Not live data</span></div>
          <ForecastTimeline riskId={alert.mapRisk} day={day} onDayChange={setDay} />
        </section>
        <SupportFinancialImpact alert={alert} action={action} period={day} />
        <div className="grid items-center gap-4 border-t pt-5 sm:grid-cols-[140px_1fr]"><img src={fields} alt="Illustrative Finnish vegetable fields" width={1152} height={576} loading="lazy" className="h-20 w-full rounded-md object-cover" /><div><p className="text-xs font-bold text-primary">A resilient harvest starts with our farmers.</p><p className="mt-1 text-[11px] leading-5 text-muted-foreground">{alert.farmers} partner farms in this scenario. Support proposals preserve existing relationships before considering contingency sourcing.</p></div></div>
      </div>
      {panelOpen && <aside aria-label="AI analysis and actions" className="min-w-0 border-t bg-card p-5 xl:border-l xl:border-t-0">
        <div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-bold"><Sprout className="h-4 w-4 text-primary" />AI Analysis & Action</h2><Button size="icon" variant="ghost" className="h-7 w-7" aria-label="Close analysis" title="Close analysis" onClick={() => setPanelOpen(false)}><X className="h-4 w-4" /></Button></div>
        <div className="mt-5 flex items-center gap-2 text-[10px] font-bold uppercase"><span className={severityColor[alert.severity]}>{alert.severity}</span><span className="text-muted-foreground">/ {alert.category}</span></div>
        <h3 className="mt-2 text-lg font-bold leading-6">{alert.title}</h3><p className="mt-3 text-xs leading-6 text-muted-foreground">{alert.problem}</p><p className="mt-3 flex items-center gap-1.5 text-[11px] font-semibold"><MapPin className="h-3.5 w-3.5 text-primary" />{alert.farmers} farms · {alert.region}</p>
        <section className="mt-5 border-y py-4"><h4 className="flex items-center gap-1.5 text-xs font-bold"><FileCheck2 className="h-4 w-4 text-primary" />Source / Proof</h4><a href={alert.sourceUrl} target="_blank" rel="noreferrer" className="mt-2 flex items-start gap-1 text-[11px] font-semibold text-primary underline underline-offset-4">{alert.source}<ArrowUpRight className="h-3 w-3 shrink-0" /></a><p className="mt-2 text-[10px] leading-5 text-muted-foreground">{alert.evidence}</p>
          <h5 className="mt-4 flex items-center gap-1.5 text-[10px] font-bold uppercase text-muted-foreground"><Database className="h-3 w-3 text-primary" />Data Sources Used</h5>
          <TooltipProvider delayDuration={150}><div className="mt-2 flex flex-wrap gap-1.5">{alert.dataSources.map(dataSource => <Tooltip key={dataSource.name}><TooltipTrigger asChild><span tabIndex={0} className="cursor-help rounded-full border bg-accent px-2 py-1 text-[9px] font-bold text-primary outline-none focus-visible:ring-2 focus-visible:ring-ring">{dataSource.name}</span></TooltipTrigger><TooltipContent side="top" className="max-w-[220px] bg-popover text-popover-foreground border"><span className="block text-[9px] font-bold uppercase text-muted-foreground">{dataSource.type}</span><span className="mt-1 block text-[10px] leading-4">{dataSource.detail}</span></TooltipContent></Tooltip>)}</div></TooltipProvider>
          <span className="mt-2 block text-[9px] font-bold uppercase text-warning">Simulated evidence · Unverified</span></section>
        <div className="mt-5 flex items-center justify-between"><h4 className="text-xs font-bold">Farmer-first proposals</h4><ShieldCheck className="h-4 w-4 text-primary" /></div>
        <div className="mt-3 space-y-3">{alert.actions.map(proposal => { const current = proposal.id === action.id; const projection = getSupportImpact(alert, proposal, day); const isPlanned = planned.includes(proposal.id); return <article key={proposal.id} className={`rounded-md border p-3 ${current ? "border-primary bg-accent/40" : "bg-card"}`}>
          <Button variant="ghost" className="h-auto w-full justify-start whitespace-normal p-0 text-left text-xs font-bold hover:bg-transparent" aria-pressed={current} onClick={() => setSelectedActionId(proposal.id)}><span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border ${current ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>{current && <Check className="h-3 w-3" />}</span>{proposal.title}</Button>
          <p className="mt-2 text-[10px] leading-5 text-muted-foreground">{proposal.detail}</p><p className="mt-3 text-[11px] font-semibold text-primary">{proposal.benefit}</p><dl className="mt-3 grid grid-cols-2 gap-2 border-t pt-3 text-[10px]"><div><dt className="text-muted-foreground">Estimated cost</dt><dd className="mt-1 font-bold">{money(proposal.cost)}</dd></div><div><dt className="text-muted-foreground">Protected loss</dt><dd className="mt-1 font-bold">{money(projection.protectedValue)}</dd></div></dl>
          <Button size="sm" variant={isPlanned ? "outline" : current ? "default" : "outline"} className="mt-3 h-8 w-full text-[10px]" onClick={() => { setSelectedActionId(proposal.id); setPlanned(previous => isPlanned ? previous.filter(id => id !== proposal.id) : [...previous, proposal.id]); }}>{isPlanned ? <Check className="h-3 w-3" /> : <ChevronRight className="h-3 w-3" />}{isPlanned ? "Remove from draft plan" : "Add to draft plan"}</Button>
        </article>; })}</div>
        {planned.length > 0 && <div role="status" className="mt-4 border-l-2 border-primary bg-accent p-3 text-[11px] leading-5"><strong>{planned.length} proposal{planned.length > 1 ? "s" : ""} in draft.</strong> Farmer approval and operational review required. Nothing has been dispatched.</div>}
        <p className="mt-4 text-[10px] leading-5 text-muted-foreground">Draft selections last for this view only. Proposals are compared individually; benefits are not additive.</p>
      </aside>}
    </div>
  </main>;
}
function Metric({ label, value, critical = false }: { label: string; value: string; critical?: boolean }) { return <div className="min-w-0"><p className="text-[10px] leading-4 text-muted-foreground">{label}</p><p className={`mt-2 break-words text-lg font-bold sm:text-xl ${critical ? "text-critical" : "text-foreground"}`}>{value}</p></div>; }
function MapLoading() { return <div className="flex h-full items-center justify-center gap-2 bg-muted text-xs text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Loading map…</div>; }
