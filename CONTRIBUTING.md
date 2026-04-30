# Contributing to CTkMaker Hub

Thanks for sharing your work. The library lives or dies on contributions, so the bar is "does it work and does it have a name."

## Quick steps

1. **Fork** this repo.
2. **Build your component** in CTkMaker. Right-click the selection → "Save as component…", then "Export…" to drop a `.ctkcomp` file outside the project.
3. **Take a screenshot** of the component. Save it as PNG.
4. **Drop both files** into `components/` in your fork:
   - `components/<your_component>.ctkcomp`
   - `components/<your_component>.png`
5. **Add an entry** to `index.json`:
   ```json
   {
     "id": "your_component",
     "name": "Your Component",
     "category": "buttons",
     "author": "your_github_handle",
     "version": "1.0",
     "description": "One line about what it is and when to use it.",
     "file": "components/your_component.ctkcomp",
     "preview": "components/your_component.png",
     "size_px": "200x40",
     "size_kb": 12,
     "added_at": "2026-04-30"
   }
   ```
   - `size_px` — the component's on-canvas dimensions, copy from the Properties
     panel (Geometry → W × H). For multi-widget components, use the bounding box
     of the whole bundle until the builder auto-fills this.
   - `size_kb` — the `.ctkcomp` file size, rounded to the nearest KB. Right-click
     → Properties on Windows, or `ls -l` on macOS / Linux.
   - `added_at` — the date you open the PR (`YYYY-MM-DD`). Drives the "Newest"
     sort on the site.
   - **`author`** — must match the `author` recorded inside the `.ctkcomp` file
     itself (the builder writes it at save time). Mismatches will be flagged
     during PR review.
   - Don't add a `featured` field — that's set by the maintainer after merge
     for hand-picked highlights.
6. **Open a Pull Request.** The PR template has the checklist.

## Rules

- **Naming.** `lowercase_with_underscores` for both files and the `id` field. The display `name` can be anything readable.
- **Category.** Pick one of: `buttons`, `inputs`, `display`, `layout`, `navigation`, `feedback`, `templates`. Don't invent new categories in a PR — open an issue first.
- **Component upload size.** ≤ 25 MB total per `.ctkcomp` file.
- **Embedded images** (inside the component). ≤ 5 MB each, as many as you need within the 25 MB cap.
- **Preview screenshot.** ≤ 1 MB PNG. Recommended resolution up to 1920×1080. Aspect ratio is up for grabs while we tune the site grid — square (1:1) renders best at the moment.
- **Test it.** Import your `.ctkcomp` into a fresh CTkMaker project and confirm it loads cleanly before opening the PR.
- **Unique ID.** No duplicates. If your name collides, suffix with a number or rephrase.

## What gets rejected

- Crashes on import.
- Bundled credentials, tokens, or anything that isn't a UI component.
- Obvious copies of someone else's submission with no meaningful change.
- Files outside `components/` or `index.json`.

## Issues vs PRs

Use **Issues** for: questions, ideas, bug reports about the site or the library.
Use **PRs** for: actual component submissions. Don't post `.ctkcomp` zips in issue comments — they won't be picked up.

## License

By submitting a component you agree that it can be redistributed under this repo's license.
