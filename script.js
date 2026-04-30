// CTkMaker Hub — fetches index.json and renders the grid + filters.

const INDEX_URL = "index.json";

const state = {
  components: [],
  categories: [],
  activeCategory: "all",
  query: "",
  sortBy: "featured",
};

const $grid = document.getElementById("grid");
const $search = document.getElementById("search");
const $sort = document.getElementById("sort");
const $categories = document.getElementById("categories");

async function loadIndex() {
  try {
    const res = await fetch(INDEX_URL, { cache: "no-cache" });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    state.categories = data.categories || [];
    state.components = data.components || [];
    renderCategories();
    renderGrid();
  } catch (err) {
    $grid.innerHTML = `<p class="empty">Failed to load index.json: ${err.message}</p>`;
    $grid.removeAttribute("aria-busy");
  }
}

// Categories are objects: {id, name, description}. The synthetic "all"
// entry is prepended at render time so the data file only carries
// real categories. Tooltip + the description line under the controls
// both feed off the same `description` field.
const ALL_CATEGORY = {
  id: "all",
  name: "All",
  description: "Browse every published component.",
};

function categoryById(id) {
  if (id === "all") return ALL_CATEGORY;
  return state.categories.find((c) => c.id === id) || ALL_CATEGORY;
}

function renderCategories() {
  const cats = [ALL_CATEGORY, ...state.categories];
  $categories.innerHTML = "";
  for (const cat of cats) {
    const btn = document.createElement("button");
    btn.className = "cat-btn" + (cat.id === state.activeCategory ? " active" : "");
    btn.textContent = cat.name;
    btn.title = cat.description;
    btn.addEventListener("click", () => {
      state.activeCategory = cat.id;
      renderCategories();
      renderCategoryDescription();
      renderGrid();
    });
    $categories.appendChild(btn);
  }
  renderCategoryDescription();
}

function renderCategoryDescription() {
  const $desc = document.getElementById("category-desc");
  if (!$desc) return;
  const cat = categoryById(state.activeCategory);
  $desc.textContent = cat.description;
}

function filterComponents() {
  const q = state.query.trim().toLowerCase();
  const matched = state.components.filter((c) => {
    if (
      state.activeCategory !== "all"
      && (c.category || "").toLowerCase() !== state.activeCategory
    ) {
      return false;
    }
    if (!q) return true;
    const haystack = [c.name, c.author, c.description, c.category]
      .filter(Boolean)
      .join(" ")
      .toLowerCase();
    return haystack.includes(q);
  });
  return sortComponents(matched);
}

function sortComponents(list) {
  // Sort returns a new array — never mutate state.components in place
  // because the active category / search filter may put items back in
  // a different relative order on the next render.
  const arr = list.slice();
  if (state.sortBy === "newest") {
    arr.sort((a, b) => (b.added_at || "").localeCompare(a.added_at || ""));
  } else if (state.sortBy === "name") {
    arr.sort((a, b) => (a.name || "").localeCompare(b.name || ""));
  } else {
    // "featured": featured first (newest among featured at the top),
    // then everyone else by added_at desc as a stable tie-breaker.
    arr.sort((a, b) => {
      const af = a.featured ? 1 : 0;
      const bf = b.featured ? 1 : 0;
      if (af !== bf) return bf - af;
      return (b.added_at || "").localeCompare(a.added_at || "");
    });
  }
  return arr;
}

function renderGrid() {
  const matches = filterComponents();
  $grid.removeAttribute("aria-busy");
  if (matches.length === 0) {
    $grid.innerHTML = `<p class="empty">No components match the current filter.</p>`;
    return;
  }
  $grid.innerHTML = "";
  for (const c of matches) {
    $grid.appendChild(renderCard(c));
  }
}

function renderCard(c) {
  const card = document.createElement("article");
  card.className = "card";

  const preview = document.createElement("div");
  preview.className = "preview";
  if (c.preview) {
    // Use background-image so a missing file gracefully degrades to the
    // empty placeholder text underneath.
    preview.style.backgroundImage = `url("${c.preview}")`;
    preview.textContent = "";
    preview.addEventListener("click", () => openLightbox(c.preview));
  } else {
    preview.textContent = "no preview";
    preview.dataset.empty = "true";
  }
  card.appendChild(preview);

  const body = document.createElement("div");
  body.className = "body";

  const name = document.createElement("h3");
  name.className = "name";
  name.appendChild(makeIcon("box"));
  name.appendChild(document.createTextNode(c.name || c.id || "Untitled"));
  body.appendChild(name);

  if (c.author) {
    const authorRow = document.createElement("div");
    authorRow.className = "author-row";
    authorRow.appendChild(makeIcon("user"));
    const text = c.license
      ? `by ${c.author} · ${c.license.type}`
      : `by ${c.author}`;
    authorRow.appendChild(document.createTextNode(text));
    if (c.license && c.license.accepted_at) {
      const sig = document.createElement("span");
      sig.className = "license-sig";
      sig.textContent = ` · signed ${formatDate(c.license.accepted_at)}`;
      sig.title = `Agreement v${c.license.text_version || 1} accepted on ${c.license.accepted_at}`;
      authorRow.appendChild(sig);
    }
    body.appendChild(authorRow);
  }

  const details = document.createElement("div");
  details.className = "details";
  if (c.size_px) addDetail(details, "ruler", c.size_px);
  if (c.size_kb) addDetail(details, "hard-drive", `${c.size_kb} KB`);
  if (c.added_at) addDetail(details, "calendar", formatDate(c.added_at));
  if (c.category) {
    const catLabel = categoryById(c.category).name;
    addDetail(details, "tag", catLabel, "tag");
  }
  if (details.children.length > 0) body.appendChild(details);

  // Reactions row — only rendered when the Discussions sync populated
  // the fields, so static/legacy entries fall through silently.
  if (c.likes !== undefined || c.comments !== undefined || c.discussion_url) {
    const social = document.createElement("div");
    social.className = "details social";
    if (c.likes !== undefined) {
      addDetail(social, "thumbs-up", String(c.likes || 0));
    }
    if (c.comments !== undefined) {
      addDetail(social, "message-square", String(c.comments || 0));
    }
    if (c.discussion_url) {
      const link = document.createElement("a");
      link.className = "detail discuss-link";
      link.href = c.discussion_url;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Discuss →";
      social.appendChild(link);
    }
    body.appendChild(social);
  }

  if (c.description) {
    const desc = document.createElement("p");
    desc.className = "description";
    desc.textContent = c.description;
    body.appendChild(desc);
  }

  const download = document.createElement("a");
  download.className = "download";
  download.textContent = "Download";
  download.href = c.file || "#";
  download.setAttribute("download", "");
  body.appendChild(download);

  card.appendChild(body);
  return card;
}

function makeIcon(name) {
  const img = document.createElement("img");
  img.className = "icon";
  img.src = `assets/icons/${name}.png`;
  img.alt = "";
  return img;
}

function addDetail(parent, iconName, text, extraClass) {
  const span = document.createElement("span");
  span.className = "detail" + (extraClass ? " " + extraClass : "");
  span.appendChild(makeIcon(iconName));
  span.appendChild(document.createTextNode(text));
  parent.appendChild(span);
}

function formatDate(iso) {
  // index.json uses YYYY-MM-DD; render as "Apr 30, 2026" for a card
  // that's friendlier than the raw ISO string.
  const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(iso || "");
  if (!m) return iso;
  const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun",
                  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const [, y, mo, d] = m;
  return `${months[+mo - 1]} ${+d}, ${y}`;
}

$search.addEventListener("input", (e) => {
  state.query = e.target.value;
  renderGrid();
});

$sort.addEventListener("change", (e) => {
  state.sortBy = e.target.value;
  renderGrid();
});

// ---------- Lightbox ----------
const $lightbox = document.getElementById("lightbox");
const $lightboxImg = document.getElementById("lightbox-img");
const $lightboxClose = document.getElementById("lightbox-close");

function openLightbox(src) {
  $lightboxImg.src = src;
  $lightbox.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeLightbox() {
  $lightbox.hidden = true;
  $lightboxImg.src = "";
  document.body.style.overflow = "";
}

$lightbox.addEventListener("click", (e) => {
  // Click on the background OR the image both close — image already
  // fills as much room as it can, the user expects another click to
  // dismiss.
  if (e.target === $lightboxClose) return;
  closeLightbox();
});
$lightboxClose.addEventListener("click", closeLightbox);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && !$lightbox.hidden) closeLightbox();
});

loadIndex();
