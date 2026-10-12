---
version: 1
slug: "src-app-tsx"
primary_target: "src/App.tsx"
related_targets: ["src/components/Layout.tsx","src/pages/HomePage.tsx","src/pages/SubscriptionsPage.tsx","src/pages/TotalPage.tsx","src/index.css"]
---

# App shell

Visitor mode: operate.

Audience: one person tracking their own subscriptions, and a reviewer checking the internship flows.

Job: move between Home, Subscriptions, and Total and read what each page is for.

Constraints: keep the three routes, the shared header and main, and plain CSS variables. Do not invent subscription data.

Chosen direction: Quiet shell. Memorable moment: the active link is an off-white underline on a monochrome bar.

Unresolved: the add form, subscription rows, and currency totals are not built yet, so service marks have no rows to sit on.

## Direction contract

THESIS: A monochrome working shell. The off-white accent marks the active link, focus, and primary actions. The page refuses the rainbow glow and the row of tinted cards.

OWN-WORLD: Gradient ground from #1a1e27 to #0d172b. Surfaces #1e2430, text #f3f6fb, muted #b4becc, line #313949, accent #f4f7fb. System UI at 16px, titles 1.75rem, the lead total 2rem. Service hues exist only as small marks.

STORY: The person reads the page title, the one-sentence job, then one full-width surface. Home lists its three jobs as rows. Subscriptions states that the list is empty. Total shows the converted amount first.

FIRST VIEWPORT: Sticky top bar, name on the left, three text links on the right, active link underlined. Below that, a single column: title, sentence, then one surface. No second column and no colored atmosphere.

FORM: Quiet shell, first of the two directions offered, locked by the user. No concept-seed key; the brief pinned the palette.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance
