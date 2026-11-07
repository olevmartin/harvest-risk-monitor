import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { createFileRoute, ClientOnly } from "@tanstack/react-router";
import { AlertTriangle, Search, Truck, Loader2, CheckCircle2, ArrowLeft, RefreshCw, Sun, CloudRain, TrendingUp, Activity, ChevronRight, ShieldCheck } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { Button } from "@/components/ui/button";
import { ForecastTimeline } from "@/components/ForecastTimeline";
import { allocateReplacement, riskScenarios, type RiskId } from "@/lib/risk-scenarios";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Supply Intelligence — Predictive Risk Navigator" },
    { name: "description", content: "Explore weather and economic supply risks, forecast their movement, and compare alternative sourcing options." },
    { property: "og:title", content: "Supply Intelligence — Predictive Risk Navigator" },
    { property: "og:description", content: "Weather and economic risk monitoring with forecast maps and alternative supplier solutions." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary_large_image" },
  ] }), component: Index,
});
const SupplierMap = lazy(() => import("@/components/SupplierMap"));
const eur = (value: number) => `€${value.toLocaleString("en-US")}`;
const riskIcons = { heatwave: Sun, rainfall: CloudRain, economic: TrendingUp };
const EMPTY_SUPPLIERS: [] = [];

function Index() {
  const [selectedId, setSelectedId] = useState<RiskId>("heatwave");
  const risk = riskScenarios.find(item => item.id === selectedId) ?? riskScenarios[0];
  if (!risk) return null;
  return <Dashboard key={risk.id} risk={risk} selectedId={selectedId} onSelect={setSelectedId} />;
}

function Dashboard({ risk, selectedId, onSelect }: { risk: typeof riskScenarios[number]; selectedId: RiskId; onSelect: (id: RiskId) => void }) {
  const [day, setDay] = useState(0);
  const [state, setState] = useState<"idle" | "loading" | "resolved">("idle");
  const [suppliers, setSuppliers] = useState(risk.suppliers);
  const [loadingCard, setLoadingCard] = useState<number | null>(null);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);
  useEffect(() => () => timers.current.forEach(clearTimeout), []);
  const schedule = (action: () => void, delay: number) => { timers.current.push(setTimeout(action, delay)); };
  const findSuppliers = () => { setState("loading"); schedule(() => setState("resolved"), 1500); };
  const goBack = () => { timers.current.forEach(clearTimeout); timers.current = []; setState("idle"); setSuppliers(risk.suppliers); setLoadingCard(null); };
  const findNew = (index: number) => {
    setLoadingCard(index);
    schedule(() => {
      setSuppliers(previous => previous.map((supplier, i) => {
        if (i !== index) return supplier;
        const replacement = risk.replacements[index]; const original = risk.suppliers[index];
        return supplier.name === replacement?.name ? original ?? supplier : replacement ?? supplier;
      })); setLoadingCard(null);
    }, 1200);
  };
  const allocations = allocateReplacement(suppliers);
  const totalCost = allocations.reduce((total, supplier) => total + supplier.subtotal, 0);
  const chart = risk.historical.map((historical, i) => ({ day: i === 0 ? "Today" : `D${Math.round(i * 10 / 6)}`, historical, predicted: risk.predicted[i] }));
  const Icon = riskIcons[risk.id];
  return <div className="min-h-screen bg-background">
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6">
        <div className="flex items-center gap-3 font-semibold"><Activity className="h-6 w-6 text-primary" /><span>Supply Intelligence</span></div>
        <span className="text-xs text-muted-foreground">European sourcing <span className="hidden sm:inline"> / Risk operations</span></span>
      </div>
    </header>
    <main className="mx-auto grid max-w-[1600px] gap-0 md:grid-cols-[280px_minmax(0,1fr)] xl:grid-cols-[320px_minmax(0,1fr)]">
      <aside className="border-b bg-card p-4 md:min-h-[calc(100vh-65px)] md:border-b-0 md:border-r md:p-5">
        <div className="mb-1 flex items-center justify-between gap-2"><h2 className="text-sm font-semibold">AI Risk Detection Feed</h2><span className="text-xs font-medium text-critical">3 active</span></div>
        <p className="mb-5 text-xs text-muted-foreground">European supply network</p>
        <div className="grid max-h-[320px] gap-3 overflow-y-auto pr-1 md:max-h-[calc(100vh-180px)] md:grid-cols-1">
          {riskScenarios.map(item => {
            const FeedIcon = riskIcons[item.id];
            return <Button key={item.id} variant="ghost" aria-pressed={selectedId === item.id} onClick={() => onSelect(item.id)} className={`h-auto w-full min-w-0 flex-col items-start gap-3 whitespace-normal rounded-md border p-4 text-left ${selectedId === item.id ? "border-primary bg-accent" : "bg-card"}`}>
              <span className="flex w-full items-center justify-between"><FeedIcon className={`h-5 w-5 ${item.id === "rainfall" ? "text-primary" : "text-critical"}`} /><span className="text-[10px] font-semibold uppercase text-critical">{item.severity}</span></span>
              <span className="text-sm font-semibold leading-5">{item.title}</span>
              <span className="text-xs font-normal text-muted-foreground">Type: {item.type}</span>
              <span className="flex w-full items-center justify-between border-t pt-3 text-xs"><span className="text-muted-foreground">{item.impact}</span><ChevronRight className="h-4 w-4 text-primary" /></span>
            </Button>;
          })}
        </div>
        <div className="mt-5 flex items-center gap-2 border-t pt-4 text-xs text-muted-foreground"><ShieldCheck className="h-4 w-4" />Simulated risk intelligence</div>
      </aside>
      <div className="min-w-0 space-y-6 p-4 sm:p-6 lg:p-8">
        <div><div className="mb-2 flex items-center gap-2 text-xs text-muted-foreground"><span>Risk operations</span><ChevronRight className="h-3 w-3" /><span>{risk.country}</span></div><h1 className="text-2xl font-semibold leading-tight">{risk.title}</h1><p className="mt-2 text-sm text-muted-foreground">{risk.type} · 10-day outlook · Mock scenario</p></div>
        {state !== "resolved" ? <section role="alert" className="border-l-4 border-critical bg-critical-soft p-4">
          <div className="flex gap-3"><AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-critical" /><div><span className="text-xs font-bold uppercase text-critical">{risk.severity} risk</span><p className="mt-1 text-sm leading-6">{risk.summary}</p></div></div>
          <Button onClick={findSuppliers} disabled={state === "loading"} className="mt-4 w-full sm:w-auto">{state === "loading" ? <Loader2 className="animate-spin" /> : <Search />}{state === "loading" ? "Searching suppliers…" : "Find alternative suppliers"}</Button>
        </section> : <section className="space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b pb-4"><div><h2 className="flex items-center gap-2 font-semibold"><CheckCircle2 className="h-5 w-5 text-safe-supplier" />Alternative suppliers found</h2><p className="mt-1 text-sm text-muted-foreground">450 t replacement · {eur(totalCost)} estimated total · Outside {risk.country}'s affected area</p></div><Button variant="outline" size="sm" onClick={goBack}><ArrowLeft />Go back</Button></div>
          <div className="grid gap-3 xl:grid-cols-3">{allocations.map((supplier, i) => <article key={i} className="flex min-h-[238px] min-w-0 flex-col rounded-md border bg-card p-4">
            {loadingCard === i ? <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Finding a new supplier…</div> : <><div className="mb-2 flex items-center gap-1.5 text-xs text-safe-supplier"><ShieldCheck className="h-3.5 w-3.5" />Outside risk zone</div><h3 className="text-sm font-semibold">{supplier.name}</h3><p className="mt-1 text-xs text-muted-foreground">{supplier.region}, {supplier.country}</p><dl className="mt-3 space-y-2 text-xs"><div className="flex justify-between"><dt>Capacity / allocated</dt><dd>{supplier.capacity} t / {supplier.allocatedTons} t</dd></div><div className="flex justify-between"><dt>Price per ton</dt><dd>{eur(supplier.pricePerTon)}</dd></div><div className="flex justify-between"><dt>Lead time</dt><dd>{supplier.leadTime}</dd></div><div className="flex justify-between border-t pt-2 font-semibold"><dt>Replacement cost</dt><dd>{eur(supplier.subtotal)}</dd></div></dl></>}
            <Button variant="ghost" size="sm" className="mt-auto self-end pt-2" onClick={() => findNew(i)} disabled={loadingCard !== null}><RefreshCw />Find new</Button>
          </article>)}</div>
        </section>}
        <div className="grid grid-cols-3 divide-x border-y py-4"><div className="pr-3"><div className="text-xs text-muted-foreground">Risk exposure</div><div className="mt-1 text-lg font-semibold text-critical">{risk.impact}</div></div><div className="px-3"><div className="text-xs text-muted-foreground">{risk.metricLabel}</div><div className="mt-1 text-lg font-semibold">{risk.metricValue}</div></div><div className="pl-3"><div className="text-xs text-muted-foreground">Sourcing status</div><div className="mt-1 flex items-center gap-1.5 text-sm font-semibold">{state === "resolved" ? <ShieldCheck className="h-4 w-4 text-safe-supplier" /> : <Truck className="h-4 w-4 text-muted-foreground" />}{state === "resolved" ? "Covered" : "At risk"}</div></div></div>
        <section aria-label="Risk map" className="min-w-0">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">Predictive Risk Navigator</h2><span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Icon className="h-3.5 w-3.5" />{risk.id === "economic" ? "Economic exposure" : "Simulated weather radar"}</span></div>
          <div className="relative h-[420px] overflow-hidden rounded-md border lg:h-[470px]">
            <ClientOnly fallback={<MapLoading />}><Suspense fallback={<MapLoading />}><SupplierMap riskId={risk.id} day={day} suppliers={state === "resolved" ? suppliers : EMPTY_SUPPLIERS} /></Suspense></ClientOnly>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-muted-foreground"><span className={`h-2 w-16 rounded-sm ${risk.id === "heatwave" ? "radar-heat-scale" : risk.id === "rainfall" ? "radar-rain-scale" : "bg-critical"}`} /><span>{risk.id === "heatwave" ? "Temperature: 26–38°C" : risk.id === "rainfall" ? "Precipitation: 5–50 mm/h" : "Disrupted / high-cost routes"}</span>{state === "resolved" && <span className="flex items-center gap-2"><span className="h-2.5 w-2.5 rounded-full bg-safe-supplier" />Safe suppliers</span>}</div>
          <ForecastTimeline day={day} onDayChange={setDay} />
        </section>
        <section className="border-t pt-5"><div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-semibold">{risk.chartTitle} <span className="font-normal text-muted-foreground">({risk.chartUnit})</span></h2><div className="flex gap-4 text-xs text-muted-foreground"><span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-primary" />Historical</span><span className="flex items-center gap-1.5"><span className="h-0.5 w-4 bg-critical" />Predicted</span></div></div><div className="h-[220px]"><ResponsiveContainer width="100%" height="100%"><LineChart data={chart} margin={{ left: -20, right: 12 }}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} /><XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={11} /><YAxis stroke="var(--muted-foreground)" fontSize={11} /><Tooltip /><Line type="monotone" dataKey="historical" name="Historical" stroke="var(--primary)" strokeWidth={2} dot={false} /><Line type="monotone" dataKey="predicted" name="Predicted" stroke="var(--critical)" strokeWidth={2} strokeDasharray="5 4" dot={false} /></LineChart></ResponsiveContainer></div></section>
      </div>
    </main>
  </div>;
}
function MapLoading() { return <div className="flex h-full items-center justify-center gap-2 bg-muted text-sm text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" />Loading map…</div>; }
