# CTkMaker Hub

Community library of reusable components (`.ctkcomp`) for [CTkMaker](https://github.com/kandelucky/ctk_maker).

**Browse the library:** [kandelucky.github.io/ctkmaker-hub](https://kandelucky.github.io/ctkmaker-hub)

## How it works

- **Posts live as Discussions** in the CTkMaker repo, in the
  [Components category](https://github.com/kandelucky/ctk_maker/discussions/categories/components).
- Every 30 minutes a GitHub Action rebuilds `index.json` from the
  Discussions and pushes the result here. The static site reads
  `index.json` and renders the grid.
- 👍 reactions on a Discussion become "likes" on the card. Comments
  count too. The "Featured" sort floats highly-liked components to the top.

## Want to share a component?

You don't fork or open a PR — you post in the Discussion category.
See [CONTRIBUTING.md](CONTRIBUTING.md) for the short version.

## Categories

`buttons` · `inputs` · `display` · `layout` · `navigation` · `feedback` · `templates`

## Architecture

```
kandelucky/ctk_maker  (Components category)
        │
        ▼  (GitHub Action, every 30 min)
ctkmaker-hub/index.json
        │
        ▼
GitHub Pages site → grid of cards
```

`index.json` is rebuilt by `tools/sync_discussions.py` driven by
`.github/workflows/sync-discussions.yml`. Manual rebuild: Actions tab
→ "Sync Discussions → index.json" → "Run workflow".
