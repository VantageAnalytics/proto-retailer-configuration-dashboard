# Retailer Configuration Dashboard — prototype

A clickable, front-end-only prototype of Vantage's Retailer Configuration Dashboard. One page per
retailer showing what is turned on, how it is configured, and who can change it.

Everything runs on static mock data. There is no backend, no API calls, and no environment switch:
the prototype behaves as if it were production throughout.

## Running it

```bash
npm install
npm run dev
```

Sign in with username `vantage` and password `pr0t0type3!`. The login inputs use non-standard
`name`/`id` attributes plus `autocomplete="off"` and `data-1p-ignore`, so 1Password and similar
managers leave them alone.

The layout targets 1440px, holds a 1280px minimum, and stays fluid up to 1920px.

## What's built in this pass

- The three-column scaffold: retailer selector and `Program | Retailer | Brand` tabs on top, left-nav
  capability groups, stacked capability cards, and a collapsible change-history panel.
- The **Meta** capability card in full: prerequisite checks, hierarchical feature toggles, and grouped
  editable configuration (Builder, Defaults, Accounts).
- Every other capability as a collapsed placeholder card.
- `Program` and `Brand` render an empty state only. `Retailer` is the tab that's built out.

## Demoing the states

The Ulta mock is the primary scenario: Meta is **Pending approval** and the checklist flags a missing
ad account ID.

Switch the retailer selector to **The Home Depot US** for a complete setup, where Meta computes to
**Live**. Clearing its Ad account ID and saving moves the same card to **Incomplete**. Together the
two retailers cover all five headline statuses without a dev-only toggle.

To see the save flow end to end: edit a toggle or field (the row marks itself **Unsaved**), use the
sticky **Save changes** footer, confirm in the approval modal, and watch the changed rows move to
**Pending** with new entries at the top of the change history, attributed to Priya Raman.

## How it's organised

```
src/
  data/          static mock data, kept out of the components
  logic/status.ts  headline status as a single pure function
  components/    UI, one file per concern
  theme.ts       HD theme values and guideline tokens
```

`computeCapabilityStatus` in `src/logic/status.ts` is the one place the headline status rules live.
It is pure and exhaustively ordered (off → pending → declined → incomplete → live), so changing the
rules doesn't require touching any component.

## Known assumptions

None of these are confirmed by the source documents. They're all deliberately easy to change.

1. **The flag hierarchy is inferred.** `meta → static_ads, ad_edit, fb_marketing` is a guess.
   `static_ads` and `ad_edit` may turn out to be cross-channel rather than Meta-only. The hierarchy
   lives in `prerequisiteKey` on each feature in `src/data/capabilities.ts`.
2. **Required levels are placeholders.** Which fields block publishing versus break a feature is not
   documented; the values in `src/data/capabilities.ts` are a first pass.
3. **Editing all configuration values, with approval, is a design assumption.** The docs currently
   show configuration as read-only, App Config has no approval workflow, and there is no defined way
   for the dashboard to write database values.
4. **Every change is attributed to a named person.** LaunchDarkly records this today; App Config does
   not.
5. **The Declined state is a design proposal.** It isn't in the docs. `fb_marketing` is seeded as
   declined so the fourth toggle state is visible, with a matching change-history entry.
6. **The Program and Brand scope tabs come from the sketch.** The docs don't yet define what settings
   live at those levels, hence the empty states.
7. **Inline accordions instead of summary-plus-modal.** The design guidelines say complex modules
   should show a summary state with an Edit button that opens a modal. This prototype follows the
   sketch instead, with inline accordions and inline editing, per the build brief's instruction that
   the scaffold wins where the two conflict. The conflict is noted in a code comment where it applies.
8. **HD theme colours are approximated.** The design-tokens repo wasn't reachable during the build,
   so the orange ramp in `src/theme.ts` uses the Home Depot brand orange and tints of it. Four
   constants at the top of that file retheme the whole prototype.

## Out of scope for this pass

Program and Brand tabs beyond empty states, environment switching, real LaunchDarkly / App Config /
database integration, and detailed cards for capabilities other than Meta.
