# NIVARA — Build Prompt (Enhanced for Bolt)

## 0. One-line brief
Build a Next.js (App Router) + TypeScript + Tailwind marketplace site for **Nivara** — on-demand "Stress Relief Van" bookings for urban professionals, with a dual-mode (Individuals/Vendors) marketing site plus three role-based dashboards (Customer, Vendor, Admin). All backend behavior is simulated with typed mock data — no real server required unless noted.

---

## 1. Design System (lock these before generating components)

**Palette**
| Token | Hex | Use |
|---|---|---|
| Primary Accent | `#5B8DEF` | CTAs, active states, links |
| Secondary Accent | `#7FD6B5` | Success states, secondary CTAs |
| Contrast Glow | `#C5B3FF` | Decorative glows, hover accents |
| Background Canvas | `#F8FAFC` | Base background (light mode) |

**Typography:** Inter or Poppins, define a strict scale (e.g. 12/14/16/20/28/40/64px) and stick to it — don't let Bolt improvise sizes per-section.

**Logo container rule:** wrap the logo in a fixed-aspect-ratio SVG container (e.g. `aspect-ratio: 3/1`, `object-fit: contain`) so it can never distort across breakpoints — state this explicitly in the prompt or Bolt will just drop an `<img>` with no constraints.

**Glassmorphism spec:** define once as a reusable class/component — `backdrop-blur-md`, translucent white surface (e.g. `bg-white/60`), soft border, subtle shadow — then reuse for header, cards, and console panels rather than restyling per section.

---

## 2. Technical Stack (explicit, so Bolt doesn't substitute something else)
- **Framework:** Next.js App Router, TypeScript
- **Styling:** Tailwind CSS
- **Animation:** Framer Motion (component-level transitions, toggle transitions), GSAP + ScrollTrigger (timeline/scroll-linked animation only — don't let both libraries animate the same element)
- **Icons:** Lucide React
- **State:** local/React Context for simulated auth + role, no real database — mock data typed against the schemas in Section 6
- **Maps:** clarify up front (see Section 9) whether this is a real map SDK or a styled mock — this materially changes build time and should not be left for Bolt to decide silently

---

## 3. Global Navigation & Mode Toggle
- Fixed glassmorphism header, scroll-progress indicator (thin bar or ring tied to scroll depth).
- `[For Individuals] / [For Van Vendors]` toggle — define exactly what changes on toggle: hero headline/subhead, CTA labels, and the feature-grid content (Section 4/9), animated via Framer Motion `layout` transitions. State this explicitly, otherwise Bolt often just swaps text without transitioning content in/out.

---

## 4. Hero Section
- Background: looping ambient video/animated gradient (specify: use a lightweight looping MP4/WebM or a CSS/canvas gradient animation — a literal "AI-generated cinematic loop" isn't something a codegen tool can produce from a text prompt, so pick a concrete implementable substitute now, not at build time).
- Headline with gradient text-mask animation: "Relax. Recharge. Right at Your Doorstep."
- Subhead as specified.
- Two magnetic-hover CTAs: "Find Your Nearest Van" → scrolls to/opens map section; "Register as a Vendor" → opens vendor signup.
- Parallax van illustration: use a static high-quality illustration/3D render with CSS parallax-on-mousemove (translate based on cursor position) — full interactive 3D (Three.js) is a separate, heavier scope decision; flag before building.

---

## 5. "Choose Your Calm" Console
Interactive tabbed component with three axes: **Aromatherapy** (Lavender/Eucalyptus/Citrus), **Lighting** (Sunset Copper/Ocean Deep/Forest Neon), **Audio** (Binaural Beats/Rain Over Cabin/Guided Decompression).
- Define the actual state shape: `{ scent, lighting, audio }` selected together represents a "session preset" that should carry forward into the booking flow later — this ties the marketing widget to real functionality instead of being decorative.
- Lighting tab changes a radial gradient background (GSAP-driven).
- Audio tab drives a CSS bar/wave visualizer — clarify whether real audio actually plays (needs audio files + a play/pause control) or is purely visual; pick one now.

---

## 6. Data Schemas (implement as typed mock data, not just UI copy)

```ts
type User = {
  id: string; name: string; email: string; role: "customer"|"vendor"|"admin";
  walletBalance: number; totalMinutesRelaxed: number;
}

type Van = {
  id: string; vendorId: string; status: "en-route"|"stationed"|"in-session"|"offline";
  lat: number; lng: number; clusterId: string; etaMinutes?: number;
  rating: number; lastInspectionAt: string; verified: boolean;
}

type Booking = {
  id: string; userId: string; vanId: string;
  durationMin: 15|30|45; timeOfDaySlot: "morning"|"afternoon"|"evening"|"night";
  preset: { scent: string; lighting: string; audio: string };
  status: "requested"|"confirmed"|"active"|"completed"|"cancelled";
  priceCharged: number; startTime?: string; endTime?: string; rating?: number;
}

type Cluster = {
  id: string; name: string; type: "residential"|"corporate"; lat: number; lng: number;
}
```

Dashboards must compute their displayed numbers (revenue, utilization, rating, count-ups) from this mock data rather than hardcoding — otherwise the "analytics" are just static text with a chart skin.

---

## 7. Pricing Engine
- Time-of-day slider (`Morning|Afternoon|Evening|Night`) updates displayed price per tier — define actual multipliers, e.g. Morning ×1.0, Afternoon ×1.15, Evening ×1.35, Night ×0.9, applied to a `basePriceByDuration` map on each Van. Without numbers, Bolt will fake the "dynamic" part with static cards that don't actually respond to the slider.

---

## 8. Scroll Timeline (4 steps)
Discover → Customize → IoT Unlock → Reset. GSAP ScrollTrigger fills a connecting SVG path as each step enters viewport. Keep this to opacity/stroke-dashoffset animation, not full re-layout, for scroll performance.

---

## 9. Portal & Three Dashboards

**Gateway login:** segmented `[Client]/[Partner Vendor]/[Admin]` toggle, mock auth (accept any well-formed email/password, or a hardcoded demo account per role), routes to the matching dashboard.

**Customer dashboard:** metrics pane (minutes relaxed, upcoming bookings, wallet balance — all computed from mock `Booking`/`User` data), booking creation flow (pick cluster → duration → preset → time slot → confirm), live ETA panel for the active booking's assigned van.

**Vendor dashboard:** revenue/utilization/rating summary computed from that vendor's `Van` and `Booking` records, cluster map + booking list grouped by time slot, document upload area for compliance (can be a mock file-picker with a "pending review" state — no real storage needed).

**Admin dashboard:** global van map, pending vendor verification queue with approve/reject actions that actually change a vendor's `verified` flag in state, global pricing-rule controls that feed back into Section 7's multipliers.

---

## 10. Live Map System — decide this explicitly before building
Real map integration (Mapbox/Leaflet/Google Maps) vs. a stylized mock map (positioned markers over a styled background) is the single biggest scope fork in this entire prompt. State your choice in the prompt itself:
- If mock: markers positioned via percentage coordinates over a static styled map graphic, three view states (User/Vendor/Admin) as different marker sets and info panels.
- If real: needs an API key, and Bolt should be told which provider so it doesn't guess and half-wire one.
- "Is Nivara in your neighborhood yet?" search → if no match in the mock cluster list, transition to a lead-capture form ("Demand Nivara For Your Society") that stores the submission in local state (mock "waitlist" list) for the admin dashboard to see.

---

## 11. Vendor Hub (B2B) + Social Proof
- Revenue-potential calculator: define the actual formula (e.g. `hourly_rate × active_hours_per_day × utilization_rate × 30 days`) so the CTA produces a real number, not a placeholder.
- Count-up stats (15,000+ sessions, 4.9/5 rating, etc.) — viewport-triggered count animation, values can be static constants since they're marketing claims, not live data.

---

## 12. FAQ, Contact, Footer
Standard accordion FAQ, contact form with client-side validation and a mock success state, footer with placeholder HQ/office block clearly marked as "to be inserted post-pilot" (as specified), multi-column links, newsletter input (mock submit, no real ESP integration).

---

## 13. Acceptance Criteria
- [ ] Individual/Vendor toggle actually swaps hero + feature content with an animated transition, not just static text swap.
- [ ] Choose Your Calm selections carry into the booking flow as a real preset, not just a marketing-only widget.
- [ ] Pricing slider changes a displayed number using the stated multipliers.
- [ ] All three dashboards' headline metrics are computed from the mock data tables, and change when you create a new booking or approve a vendor during the same session.
- [ ] Map section's neighborhood search correctly branches to lead-capture when no cluster matches.
- [ ] Fully responsive 360px → desktop; logo never distorts at any breakpoint.
- [ ] GSAP and Framer Motion don't both drive the same property on the same element (pick one per interaction to avoid animation conflicts).

---

## 14. Decisions to lock before (re-)submitting to Bolt
1. Real map SDK or styled mock map?
2. Hero background: real looping video asset (you supply the file) or generated CSS/canvas ambient background?
3. Does the audio tab in "Choose Your Calm" play real audio?
4. Does auth persist across reload (localStorage) or reset each session?
5. Static Three.js van model, or 2D parallax illustration?

Answering these five *before* generation will cut down on Bolt guessing wrong and burning iterations fixing scope it invented on its own.
