import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getFinancialImpact, getForecastLabel, type RiskScenario, type SourcingSupplier } from "@/lib/risk-scenarios";

const currency = (value: number) => `€${value.toLocaleString("en-US")}`;

export function FinancialImpact({ risk, suppliers, period }: { risk: RiskScenario; suppliers: SourcingSupplier[]; period: number }) {
  const financial = getFinancialImpact(risk, suppliers, period);
  const bars = [
    { label: "Unresolved Risk (Stockout Cost)", short: "Unresolved risk", cost: financial.unresolved, color: "var(--critical)" },
    { label: "AI Resolved (Alternative Logistics)", short: "AI resolved", cost: financial.alternativeExtra, color: "var(--safe-supplier)" },
    { label: "Historical Average", short: "Historical average", cost: financial.baseline, color: "var(--financial-baseline)" },
  ];
  return <section aria-label="Financial Impact & ROI" className="border-t pt-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-base font-semibold">Financial Impact & ROI</h2><span className="text-xs text-muted-foreground">{getForecastLabel(risk.id, period)} · EUR · Mock estimates</span></div>
    <div className="mt-4 grid grid-cols-2 gap-4 border-b pb-4">
      <div><p className="text-xs text-muted-foreground">Potential loss avoided</p><p className="mt-1 text-xl font-semibold text-safe-supplier">{currency(financial.avoidedLoss)}</p></div>
      <div><p className="text-xs text-muted-foreground">Return on switching cost</p><p className="mt-1 text-xl font-semibold">{financial.roiPercent.toLocaleString("en-US")}%</p></div>
    </div>
    <div className="mt-5 h-[250px] min-w-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={bars} margin={{ top: 12, left: 0, right: 8, bottom: 0 }} barSize={56}>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
          <XAxis dataKey="short" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} interval={0} />
          <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={62} tickFormatter={value => `€${Number(value) / 1000}k`} />
          <Tooltip cursor={{ fill: "var(--muted)" }} content={({ active, payload }) => {
            const item = payload?.[0]?.payload as typeof bars[number] | undefined;
            if (!active || !item) return null;
            return <div className="max-w-[240px] rounded-md border bg-popover p-3 text-xs text-popover-foreground"><p>{item.label}</p><p className="mt-1 font-semibold">{currency(item.cost)}</p></div>;
          }} />
          <Bar dataKey="cost" radius={[4, 4, 0, 0]} isAnimationActive={false}>{bars.map(item => <Cell key={item.label} fill={item.color} />)}</Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
    <dl className="mt-3 grid gap-3 border-t pt-4 text-xs sm:grid-cols-3">{bars.map(item => <div key={item.label}><dt className="flex items-start gap-2 text-muted-foreground"><span className={`mt-1 h-2 w-2 shrink-0 rounded-sm ${item.short === "Unresolved risk" ? "bg-critical" : item.short === "AI resolved" ? "bg-safe-supplier" : "bg-financial-baseline"}`} />{item.label}</dt><dd className="mt-1 pl-4 text-sm font-semibold">{currency(item.cost)}</dd></div>)}</dl>
  </section>;
}