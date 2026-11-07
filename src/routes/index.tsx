import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { AlertTriangle, MapPin, Search, Package, Truck, Leaf, Loader2, CheckCircle2 } from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from "recharts";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Supply Chain Risk Dashboard — Pea Sourcing" },
      { name: "description", content: "Monitor crop yield risk and supplier coverage across your B2B supply chain." },
      { property: "og:title", content: "Supply Chain Risk Dashboard" },
      { property: "og:description", content: "Monitor crop yield risk and supplier coverage across your B2B supply chain." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const data = [
  { week: "W1", historical: 1500, predicted: 1500 },
  { week: "W2", historical: 1480, predicted: 1470 },
  { week: "W3", historical: 1520, predicted: 1440 },
  { week: "W4", historical: 1550, predicted: 1300 },
  { week: "W5", historical: 1530, predicted: 1150 },
  { week: "W6", historical: 1510, predicted: 1070 },
  { week: "W7", historical: 1540, predicted: 1060 },
];

const kpis = [
  { label: "Active suppliers", value: "38", icon: Package },
  { label: "Shipments in transit", value: "124", icon: Truck },
  { label: "Forecast pea supply", value: "1,050 t", icon: Leaf },
];

const DEFICIT_TONS = 450;

const suppliers = [
  { name: "AgroBalt Sp. z o.o.", country: "Poland", region: "Greater Poland", capacity: 220, pricePerTon: 385, leadTime: "4 days" },
  { name: "Vidzemes Graudi SIA", country: "Latvia", region: "Vidzeme", capacity: 150, pricePerTon: 410, leadTime: "3 days" },
  { name: "Saaremaa Agro OÜ", country: "Estonia", region: "Saaremaa", capacity: 120, pricePerTon: 425, leadTime: "2 days" },
];

const formatEur = (n: number) => `€${n.toLocaleString("en-US")}`;

function Index() {
  const [state, setState] = useState<"idle" | "loading" | "resolved">("idle");

  const findSuppliers = () => {
    setState("loading");
    setTimeout(() => setState("resolved"), 1500);
  };

  const totalCapacity = suppliers.reduce((s, x) => s + x.capacity, 0);
  const totalCost = suppliers.reduce((s, x) => s + x.capacity * x.pricePerTon, 0);

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold text-foreground">
            <div className="h-6 w-6 rounded bg-primary" /> Supply Intelligence
          </div>
          <span className="text-sm text-muted-foreground">Pea sourcing · Nordics</span>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {state !== "resolved" && (
          <div role="alert" className="flex flex-col gap-4 rounded-lg border-l-4 border-critical bg-critical-soft p-5 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex gap-3">
              <AlertTriangle className="mt-0.5 h-6 w-6 shrink-0 text-critical" />
              <p className="text-foreground">
                <span className="font-bold text-critical">CRITICAL RISK:</span> Upcoming 10-day heatwave will reduce pea yield by 30% in Southwest Finland.{" "}
                <span className="font-semibold">Deficit: 450 tons.</span>
              </p>
            </div>
            <Button size="lg" className="shrink-0" onClick={findSuppliers} disabled={state === "loading"}>
              {state === "loading" ? (
                <>
                  <Loader2 className="animate-spin" /> Searching suppliers…
                </>
              ) : (
                <>
                  <Search /> Find alternative suppliers
                </>
              )}
            </Button>
          </div>
        )}

        {state === "resolved" && (
          <section className="rounded-lg border bg-card p-5">
            <div className="mb-4 flex items-start gap-3">
              <CheckCircle2 className="mt-0.5 h-6 w-6 shrink-0 text-primary" />
              <div>
                <h2 className="font-semibold text-foreground">Alternative suppliers found — unaffected by the heatwave</h2>
                <p className="text-sm text-muted-foreground">
                  Combined capacity of {totalCapacity} t covers the {DEFICIT_TONS} t deficit. Estimated replacement cost:{" "}
                  <span className="font-semibold text-foreground">{formatEur(totalCost)}</span>
                </p>
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {suppliers.map((s) => (
                <div key={s.name} className="rounded-lg border p-4">
                  <div className="font-semibold text-foreground">{s.name}</div>
                  <div className="text-sm text-muted-foreground">{s.region}, {s.country}</div>
                  <dl className="mt-3 space-y-1.5 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Capacity</dt>
                      <dd className="font-medium text-foreground">{s.capacity} t</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Price</dt>
                      <dd className="font-medium text-foreground">{formatEur(s.pricePerTon)}/t</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-muted-foreground">Lead time</dt>
                      <dd className="font-medium text-foreground">{s.leadTime}</dd>
                    </div>
                    <div className="flex justify-between border-t pt-1.5">
                      <dt className="text-muted-foreground">Subtotal</dt>
                      <dd className="font-semibold text-foreground">{formatEur(s.capacity * s.pricePerTon)}</dd>
                    </div>
                  </dl>
                </div>
              ))}
            </div>
          </section>
        )}

        <div className="grid gap-4 sm:grid-cols-3">
          {kpis.map(({ label, value, icon: Icon }) => (
            <div key={label} className="rounded-lg border bg-card p-5">
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                {label} <Icon className="h-4 w-4" />
              </div>
              <div className="mt-2 text-2xl font-semibold text-foreground">{value}</div>
            </div>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          <section className="rounded-lg border bg-card p-5 lg:col-span-3">
            <h2 className="mb-4 font-semibold text-foreground">Supplier network map</h2>
            <div className="flex h-[440px] flex-col items-center justify-center gap-2 rounded-md border border-dashed bg-muted text-muted-foreground">
              <MapPin className="h-8 w-8" />
              <span className="text-sm">Map placeholder</span>
            </div>
          </section>

          <section className="rounded-lg border bg-card p-5 lg:col-span-2">
            <h2 className="font-semibold text-foreground">Pea yield (tons)</h2>
            <p className="mb-4 text-sm text-muted-foreground">Historical average vs. heatwave forecast</p>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ left: -10, right: 10 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis dataKey="week" stroke="var(--muted-foreground)" fontSize={12} />
                  <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="historical" name="Historical" stroke="var(--primary)" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="predicted" name="Predicted" stroke="var(--critical)" strokeWidth={2} strokeDasharray="5 4" dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
