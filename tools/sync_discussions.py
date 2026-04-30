"""Rebuild ``index.json`` from the CTkMaker repo's "Components"
Discussion category.

Each Discussion in that category becomes one entry in
``index["components"]``. The Discussion form template (in
``kandelucky/ctk_maker:.github/DISCUSSION_TEMPLATE/components.yml``)
shapes the body so this parser can pull structured fields out of it.

Run by ``.github/workflows/sync-discussions.yml`` on a 30-minute cron
plus manual ``workflow_dispatch``. Token comes from the action's
``GITHUB_TOKEN`` (read access to public Discussions is enough).
"""

from __future__ import annotations

import json
import os
import re
import sys
import urllib.error
import urllib.request
from pathlib import Path

REPO_OWNER = "kandelucky"
REPO_NAME = "ctk_maker"
CATEGORY_NAME = "Components"

INDEX_PATH = Path(__file__).resolve().parent.parent / "index.json"

GRAPHQL_URL = "https://api.github.com/graphql"

DISCUSSIONS_QUERY = """
query($owner: String!, $name: String!, $cursor: String) {
  repository(owner: $owner, name: $name) {
    discussionCategories(first: 30) {
      nodes { id name }
    }
    discussions(first: 50, after: $cursor, orderBy: {field: CREATED_AT, direction: DESC}) {
      pageInfo { hasNextPage endCursor }
      nodes {
        id
        number
        title
        body
        url
        createdAt
        category { name slug }
        author { login }
        upvoteCount
        reactions(content: THUMBS_UP) { totalCount }
        comments { totalCount }
      }
    }
  }
}
"""

CTKCOMP_RE = re.compile(
    r"\[([^\]\n]+\.ctkcomp)\]\((https?://[^\s)]+)\)",
    re.IGNORECASE,
)
IMAGE_MD_RE = re.compile(
    r"!\[[^\]\n]*\]\((https?://[^\s)]+\.(?:png|jpe?g|gif|webp))\)",
    re.IGNORECASE,
)
IMAGE_HTML_RE = re.compile(
    r'<img[^>]+src="(https?://[^"]+\.(?:png|jpe?g|gif|webp))"',
    re.IGNORECASE,
)
USER_ASSET_RE = re.compile(
    r'(https?://(?:user-images\.githubusercontent\.com|github\.com/user-attachments)[^\s")]+)',
    re.IGNORECASE,
)
SECTION_HEADER_RE = re.compile(r"^###\s+(.+?)\s*$", re.MULTILINE)


def graphql(token: str, query: str, variables: dict) -> dict:
    payload = json.dumps({"query": query, "variables": variables}).encode("utf-8")
    req = urllib.request.Request(
        GRAPHQL_URL,
        data=payload,
        headers={
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json",
            "User-Agent": "ctkmaker-hub-sync",
        },
    )
    with urllib.request.urlopen(req, timeout=30) as resp:
        return json.loads(resp.read().decode("utf-8"))


def fetch_discussions(token: str) -> list[dict]:
    """Pull every Discussion in the target repo, paged 50 at a time.

    Filtering by category happens client-side because GraphQL's
    ``categoryId`` filter requires the slug-resolved id and we'd
    rather not chain requests just to learn it.
    """
    cursor = None
    out: list[dict] = []
    while True:
        result = graphql(
            token, DISCUSSIONS_QUERY,
            {"owner": REPO_OWNER, "name": REPO_NAME, "cursor": cursor},
        )
        if "errors" in result:
            raise RuntimeError(f"GraphQL errors: {result['errors']}")
        repo = result["data"]["repository"]
        if repo is None:
            raise RuntimeError(f"Repo {REPO_OWNER}/{REPO_NAME} not visible")
        page = repo["discussions"]
        out.extend(page["nodes"])
        if not page["pageInfo"]["hasNextPage"]:
            break
        cursor = page["pageInfo"]["endCursor"]
    return out


def parse_form_sections(body: str) -> dict[str, str]:
    """Form-template Discussions render fields as ``### Header`` blocks
    followed by the typed value. Return a dict ``{header.lower(): value}``.
    Free-form Discussions return an empty dict — the caller falls back
    to whole-body extraction.
    """
    sections: dict[str, str] = {}
    parts = SECTION_HEADER_RE.split(body)
    if len(parts) < 3:
        return sections
    # parts = ["", header1, content1, header2, content2, ...]
    for i in range(1, len(parts) - 1, 2):
        header = parts[i].strip().lower()
        content = parts[i + 1].strip()
        if header:
            sections[header] = content
    return sections


def slug(name: str) -> str:
    cleaned = re.sub(r"[^a-z0-9]+", "_", name.lower()).strip("_")
    return cleaned or "component"


def discussion_to_entry(d: dict) -> dict | None:
    """Transform one Discussion node into an ``index.json`` entry. Returns
    ``None`` when no ``.ctkcomp`` URL is detected — the post is then
    dropped from the index instead of polluting the grid with broken
    download links.
    """
    body = d.get("body") or ""
    sections = parse_form_sections(body)

    ctkcomp_match = CTKCOMP_RE.search(body)
    if not ctkcomp_match:
        return None
    ctkcomp_url = ctkcomp_match.group(2)

    preview_url = ""
    img_md = IMAGE_MD_RE.search(body)
    if img_md:
        preview_url = img_md.group(1)
    else:
        img_html = IMAGE_HTML_RE.search(body)
        if img_html:
            preview_url = img_html.group(1)

    title = (d.get("title") or "").strip()
    # Form template prefixes titles with "[component] " — strip it so
    # the visible name on the card matches what the user typed.
    if title.lower().startswith("[component]"):
        title = title[len("[component]"):].strip()

    name = sections.get("display name") or title or "Untitled"
    category = (sections.get("component type") or "").strip().lower() or "templates"
    description = sections.get("description") or ""

    author = (d.get("author") or {}).get("login") or "anonymous"
    likes = (d.get("reactions") or {}).get("totalCount") or 0
    comments = (d.get("comments") or {}).get("totalCount") or 0
    created = d.get("createdAt", "")[:10]

    return {
        "id": f"d{d['number']}_{slug(name)}",
        "name": name,
        "category": category,
        "author": author,
        "version": "1.0",
        "description": description,
        "file": ctkcomp_url,
        "preview": preview_url,
        "size_px": "",
        "size_kb": 0,
        "added_at": created,
        "discussion_url": d.get("url", ""),
        "likes": likes,
        "comments": comments,
    }


def build_index(discussions: list[dict]) -> list[dict]:
    entries: list[dict] = []
    for d in discussions:
        cat = (d.get("category") or {}).get("name") or ""
        if cat != CATEGORY_NAME:
            continue
        entry = discussion_to_entry(d)
        if entry is not None:
            entries.append(entry)
    return entries


def main() -> int:
    token = os.environ.get("GITHUB_TOKEN")
    if not token:
        print("GITHUB_TOKEN missing in environment.", file=sys.stderr)
        return 2
    try:
        discussions = fetch_discussions(token)
    except (urllib.error.HTTPError, urllib.error.URLError, RuntimeError) as exc:
        print(f"Discussion fetch failed: {exc}", file=sys.stderr)
        return 3

    components = build_index(discussions)

    if INDEX_PATH.exists():
        index = json.loads(INDEX_PATH.read_text(encoding="utf-8"))
    else:
        index = {"schema_version": 1, "components": []}
    index["components"] = components

    INDEX_PATH.write_text(
        json.dumps(index, indent=2, ensure_ascii=False) + "\n",
        encoding="utf-8",
    )
    print(f"Wrote {len(components)} components to {INDEX_PATH.name}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
