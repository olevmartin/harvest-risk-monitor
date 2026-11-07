<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.

## What Lovable manages

Rules outside this block are the project's own. Change the pieces below in
Lovable, not by hand. With the [Lovable MCP](https://mcp.lovable.dev)
connected, `send_message` asks Lovable to do it; otherwise ask the user to
use the editor.

- **Database.** Do not add or edit `supabase/migrations/` or `drizzle/`.
  Ask Lovable to change the schema.
- **Generated files.** Do not edit a file whose header says it is automatically
  generated.
- **AI gateway.** Keep model calls on Lovable's gateway, and keep
  `LOVABLE_API_KEY` out of browser code.
- **Connectors.** Lovable provides native connectors. `list_connectors` shows
  which are enabled; `add_connector` only returns the dashboard link. When a
  connector is enabled, calls go through the connector gateway and need
  `LOVABLE_API_KEY`. When Lovable does not provide one, users can bring their
  own key and store it in Secrets.
- **Secrets.** Lovable manages them. Do not put secret values in the repo.
<!-- LOVABLE:END -->

- Keep forecast geometry and supplied site data in browser-safe shared modules so map rendering and safety tests use the same coordinates without importing Leaflet into SSR.
- Load the Leaflet map lazily behind ClientOnly; keep its forecast control outside the map so it is accessible during loading and does not intercept map gestures.
- Define risk scenarios centrally, and key scenario views by risk ID to cancel pending supplier searches and reset selections when switching alerts.
- Render mock weather as deterministic georeferenced canvas GridLayer tiles with a bounded forecast footprint; supplier safety tests validate every scenario against that same footprint.
- Allocate replacement quantities up to the required deficit before calculating costs; spare supplier capacity is not charged.
- Keep risk-specific horizon units and financial projections in the browser-safe scenario module so timelines, maps, ROI charts, and safety tests share a single source of truth; alternative logistics bars represent incremental costs, not full procurement spend.
- Keep crop filters, evidence, affected-farm locations, and farmer-support projections in a browser-safe intelligence module; the dashboard simulates proposals without submitting or persisting real-world actions.

- Centralize supplied corporate baselines in a browser-safe module; derive volume, GHG and water comparisons from it, and preserve unknown financial inputs as null so missing evidence never becomes fabricated estimates.
