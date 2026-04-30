# Contributing to CTkMaker Hub

The library is now wired straight into the **CTkMaker repo's Discussions**.
You don't fork, don't open a PR, don't edit `index.json`. You post a
component in the right Discussion category and the site picks it up.

## Quick steps

1. **Build your component** in CTkMaker. Right-click the selection
   → "Save as component…".
2. **Click "Publish to Community"** on the component. Sign the license
   agreement, pick the category, write the one-line description.
   The Builder writes everything into the `.ctkcomp` file directly.
3. **Take a screenshot** of the component on canvas. Save it as PNG.
4. Open https://github.com/kandelucky/ctk_maker/discussions/new?category=components
5. **Drag your two files** into the post (`.ctkcomp` + screenshot).
   You don't fill in name, category, or description — the file already
   has them.
6. **Start discussion.** Within ~30 minutes the card appears on the
   [CTkMaker Hub](https://kandelucky.github.io/ctkmaker-hub/).

## Rules

- **One discussion = one component.** If you have a bundle of related
  components, post them separately so each lands on its own card.
- **Component upload size** ≤ 25 MB total per `.ctkcomp`.
- **Embedded images** inside the component ≤ 5 MB each.
- **Preview screenshot** ≤ 1 MB PNG. The Hub displays previews in a
  **4 : 3** frame — `1280 × 960` is the sweet spot, `1920 × 1440`
  is the upper end. Other ratios are letterboxed (not cropped) so
  vertical login forms or wide toolbars still show in full.
- **Pick the right category** from the dropdown:
  - **Buttons** — stylized buttons (icon, toggle, action groups)
  - **Inputs** — Entry / Combobox / Checkbox / Slider variations
  - **Forms** — multi-field configurations (login, signup, settings, contact)
  - **Layout** — grid / row / column containers, splitters, scroll areas
  - **Navigation** — sidebars, top bars, tab strips, breadcrumbs, menu drawers
  - **Dialogs & Modals** — alerts, confirms, file pickers, settings popups
  - **Cards & Panels** — info / profile / stat tiles, collapsible panels
  - **Mini-Apps** — full small applications (todo, calculator, calendar, music player)
  - **Templates & Starters** — empty skeletons (sidebar+content shell, tab shell, blank window)
  - **Other** — anything that doesn't fit above

## What gets removed

- Posts whose `.ctkcomp` link is broken or missing.
- Components that crash on import.
- Duplicate uploads of someone else's work.
- Off-topic posts that aren't components.

## Likes, comments, and what they do

- A 👍 reaction on the Discussion increases the "likes" count on the
  card. Highly-liked components float to the top under the **Featured**
  sort.
- Comments on the Discussion show as a counter on the card. Click
  "Discuss →" on the card to jump straight to the thread.

## License

Every component in this library is **MIT-licensed**. The license
agreement happens once, inside CTkMaker, when you click
"Publish to Community" — you confirm three things:

1. You have the right to redistribute everything in your component.
2. You release it under the MIT License (anyone can use, modify,
   and redistribute).
3. Responsibility for the contents stays with you, the submitter.

The Builder writes a signed `license` block into your `.ctkcomp`
file. The Hub's sync workflow reads it back and only publishes
components whose license block confirms all three. **Components
without a valid license block are skipped silently** — the upload
is on the Discussion thread but won't appear on the site.

This means you cannot publish via a hand-crafted `.ctkcomp` that
bypasses the Builder dialog. If you have a legitimate reason for
that, open an issue first.
