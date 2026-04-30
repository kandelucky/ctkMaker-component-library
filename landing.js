// Landing page — screenshot carousel.

const slides = Array.from(document.querySelectorAll(".carousel-slide"));
const dotsEl = document.getElementById("carousel-dots");
const prevBtn = document.querySelector(".carousel-nav.prev");
const nextBtn = document.querySelector(".carousel-nav.next");

let current = 0;
let timer = null;
const AUTO_MS = 5000;

function show(i) {
  current = (i + slides.length) % slides.length;
  slides.forEach((s, idx) => s.classList.toggle("active", idx === current));
  Array.from(dotsEl.children).forEach((d, idx) =>
    d.classList.toggle("active", idx === current)
  );
}

function next() { show(current + 1); }
function prev() { show(current - 1); }

function restartAuto() {
  if (timer) clearInterval(timer);
  timer = setInterval(next, AUTO_MS);
}

slides.forEach((_, i) => {
  const dot = document.createElement("button");
  dot.className = "carousel-dot" + (i === 0 ? " active" : "");
  dot.setAttribute("aria-label", `Show screenshot ${i + 1}`);
  dot.addEventListener("click", () => { show(i); restartAuto(); });
  dotsEl.appendChild(dot);
});

prevBtn.addEventListener("click", () => { prev(); restartAuto(); });
nextBtn.addEventListener("click", () => { next(); restartAuto(); });

restartAuto();
