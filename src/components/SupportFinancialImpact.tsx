import { Bar, BarChart, Cell, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { getSupportImpact, type IntelligenceAlert, type SupportAction } from "@/lib/apetit-intelligence";
export const money = (value: number) => `€${value.toLocaleString("en-US")}`;
export function SupportFinancialImpact({ alert, action, period }: { alert: IntelligenceAlert; action: SupportAction; period: number }) {
  const impact = getSupportImpact(alert, action, period);
  const bars = [
    { name: "Unresolved", cost: impact.unresolved, fill: "var(--critical)" },
    { name: "Farmer support", cost: impact.cost, fill: "var(--safe-supplier)" },
    { name: "Historical", cost: alert.baseline, fill: "var(--financial-baseline)" },
  ];
  return <section aria-label="Financial Impact & ROI" className="border-t pt-5">
    <div className="flex flex-wrap items-center justify-between gap-2"><h2 className="text-sm font-bold">Financial Impact & ROI</h2><span className="text-[10px] text-muted-foreground">SCENARIO ESTIMATES · EUR</span></div>
    <div className="mt-4 grid grid-cols-3 gap-3"><div><p className="text-[11px] text-muted-foreground">Net benefit</p><p className="mt-1 text-lg font-bold text-primary">{money(impact.netBenefit)}</p></div><div><p className="text-[11px] text-muted-foreground">Support ROI</p><p className="mt-1 text-lg font-bold">{impact.roi}%</p></div><div><p className="text-[11px] text-muted-foreground">Residual risk loss</p><p className="mt-1 text-lg font-bold">{money(impact.residualLoss)}</p></div></div>
    <div className="mt-4 h-[200px] min-w-0"><ResponsiveContainer width="100%" height="100%"><BarChart data={bars} barSize={44} margin={{ left: 0, right: 12, top: 10 }}><CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} /><XAxis dataKey="name" fontSize={10} stroke="var(--muted-foreground)" tickLine={false} axisLine={false} interval={0} /><YAxis width={54} fontSize={10} tickLine={false} axisLine={false} tickFormatter={value => `€${Number(value) / 1000}k`} stroke="var(--muted-foreground)" /><Tooltip formatter={value => money(Number(value))} contentStyle={{ background: "var(--popover)", borderColor: "var(--border)", color: "var(--foreground)", borderRadius: 6 }} /><Bar dataKey="cost" radius={[4,4,0,0]} isAnimationActive={false}>{bars.map(bar => <Cell key={bar.name} fill={bar.fill} />)}</Bar></BarChart></ResponsiveContainer></div>
    <p className="text-[10px] leading-4 text-muted-foreground">Support cost excludes residual losses. Net benefit = protected loss − support cost. Estimates are illustrative, not financial advice.</p>
  </section>;
}