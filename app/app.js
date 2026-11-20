"use strict";
/* Leonida Platinum Tracker — offline GTA VI trophy guide & tracker.
   Loads app/data/trophies.json (same folder tree), keeps progress in
   localStorage, and never talks to the network. */

const STORAGE_KEY = "leonida-platinum-tracker-v1";
const KIND_LABELS = {
  story: "Story",
  collectibles: "Collectibles",
  activities: "Activities",
  crime: "Crime",
  exploration: "Exploration",
  completion: "Completion"
};
const ROADMAP = [
  {
    stage: 1,
    title: "Stage 1 — Play the story (Chapters 1–5)",
    time: "≈ 60–80 hours",
    text: "Run the campaign and enjoy it. All 12 story trophies unlock on their own, and free roam continues after the credits, so nothing here can be missed — with one exception worth respecting: do the balcony meditation at Jason's house during Chapter 1 (see Positive Mental Attitude). Scan vehicles and WAiNK spots as you travel, and take optional missions as they appear.",
    bullets: [
      "Chapter 1: do the balcony meditation before the chapter ends (only possibly-missable spot).",
      "Chapter 2: Scooter Bros app arrives (On the Spot); Billy's jobs open in Kelly County.",
      "Chapter 3: Yasmani's jobs give the Snap Gun (Sneakthief).",
      "Chapter 4: optional mission 'That's Where The Money Is…' opens bank vaults (Maximum Withdrawal).",
      "Finish the final mission for You Gotta Know When to Get Off (Gold)."
    ]
  },
  {
    stage: 2,
    title: "Stage 2 — Character strands & early cleanup",
    time: "≈ 10–20 hours",
    text: "Finish the five named character strands (Andy, Kenton, Billy, Randy, Tyrone) — each carries its own trophy — plus Bret's hunting (Fair Game) and Cal's fishing challenge. Start stranger strands as soon as they unlock; eight completed strands earn Strangers & Freaks, and one source warns some chains may have story-linked windows.",
    bullets: [
      "Road to Rehabilitation (Andy) · This Was No Boat Accident (Kenton) · The Lone Rider (Billy)",
      "Supply & Demand (Randy) · Spin on This! (Tyrone) · Fair Game (Bret) · Baited My Tackle (Cal)",
      "Try every activity type once for Master of None; complete one arcade game for Stick Fiddler."
    ]
  },
  {
    stage: 3,
    title: "Stage 3 — Activities, crime & collectibles",
    time: "≈ 40–60 hours",
    text: "The big middle sweep. Work the counted trophies: 250 stunts, 42 shooting-range golds, 20 different race wins, a drone-race win at all 14 locations, 100 WAiNK scans, 100 discovered vehicles, 3 card sets, 50 challenges. Then the crime set: 5 bank vaults, one illegal operation per gang (9), an armored truck, a silent jewelry-store job, partner trophies at 4 stars, and the VCIA jet and Mile Zero tank.",
    bullets: [
      "Counts to chase: 250 stunts · 42 range golds · 20 race wins · 14 drone locations · 100 WAiNK · 100 vehicles · 3 card sets · 50 challenges.",
      "Crime: 5 vaults · 9 gang operations · armored truck · undetected jewelry store · 3 shops back-to-back · 4-star escape with partner.",
      "Explore all of Leonida by plane to clear the map fog (The Goodtime State)."
    ]
  },
  {
    stage: 4,
    title: "Stage 4 — The 100% checklist (A Long Road)",
    time: "≈ 50–80 hours",
    text: "Open Touch Pad > Progress > 100% Completion and work the list: 300 stunts, 70 challenges, 15 card sets, all 8 vaults, all 39 gang operations, 200 vehicles, 100 animals studied, 50 weapons. The money trophies land here too — $250,000 laundered in Marked Bills, $100,000 spent in shops, and all 8 garages bought. Nothing on this checklist is missable.",
    bullets: [
      "Raise the Stage 3 counts to checklist levels (300 stunts, 70 challenges, 15 card sets).",
      "Money: $250k laundered (Dime on the Dollar) · $100k spent (Treat Yo Self) · 8 garages (Little Boxes).",
      "Watch the Criminal Profile for Actions Speak Louder — 'Irredeemable' is permanent."
    ]
  },
  {
    stage: 5,
    title: "Stage 5 — Platinum (Vice Got a Price!)",
    time: "Cleanup",
    text: "With the other 54 trophies earned, the Platinum unlocks by itself. If anything remains, it is usually one of the five trophies whose exact triggers were still unconfirmed at launch (In the Beginning…, Capital Offense, Bad Luck I Guess, The Truth Is Out There, Ten Pin) — check their guides in this app for the latest cited status before hunting blindly.",
    bullets: [
      "Confirm the checklist shows 54/55 earned, then finish the last trophy.",
      "No cheats, no second playthrough, no online trophies — the whole list lives in Leonida."
    ]
  }
];

const state = {
  trophies: [],
  sources: [],
  earned: new Set(),
  kind: "all",
  grade: "all",
  status: "all",
  query: "",
  spoilerShield: true,
  selected: null
};

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    if (Array.isArray(data.earned)) state.earned = new Set(data.earned);
    if (typeof data.spoilerShield === "boolean") state.spoilerShield = data.spoilerShield;
  } catch (err) {
    state.earned = new Set();
  }
}

function saveProgress() {
  const data = { earned: Array.from(state.earned), spoilerShield: state.spoilerShield };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function isShielded(trophy) {
  return state.spoilerShield && trophy.hidden && !state.earned.has(trophy.name);
}

function displayName(trophy) {
  return isShielded(trophy) ? "Hidden trophy" : trophy.name;
}

function displayDesc(trophy) {
  return isShielded(trophy) ? "Hidden on PlayStation until earned — spoiler shield is on." : trophy.description;
}

function medalLetter(grade) {
  return grade === "Platinum" ? "P" : grade.charAt(0);
}

function matchesFilters(trophy) {
  if (state.kind === "missable") {
    if (!trophy.missable) return false;
  } else if (state.kind !== "all" && trophy.kind !== state.kind) {
    return false;
  }
  if (state.grade !== "all" && trophy.grade !== state.grade) return false;
  const done = state.earned.has(trophy.name);
  if (state.status === "done" && !done) return false;
  if (state.status === "todo" && done) return false;
  if (state.query) {
    const hay = (displayName(trophy) + " " + displayDesc(trophy)).toLowerCase();
    if (!hay.includes(state.query)) return false;
  }
  return true;
}

function renderProgress() {
  const total = state.trophies.length;
  const earned = state.earned.size;
  document.getElementById("earnedCount").textContent = String(earned);
  document.getElementById("progressFill").style.width = total ? (earned / total) * 100 + "%" : "0%";
  const byGrade = {};
  for (const t of state.trophies) {
    byGrade[t.grade] = byGrade[t.grade] || { done: 0, total: 0 };
    byGrade[t.grade].total += 1;
    if (state.earned.has(t.name)) byGrade[t.grade].done += 1;
  }
  const order = ["Platinum", "Gold", "Silver", "Bronze"];
  document.getElementById("gradeLine").textContent = order
    .map((g) => g + " " + (byGrade[g] ? byGrade[g].done : 0) + "/" + (byGrade[g] ? byGrade[g].total : 0))
    .join(" · ");
}

function renderList() {
  const list = document.getElementById("trophyList");
  list.innerHTML = "";
  let shown = 0;
  for (const trophy of state.trophies) {
    if (!matchesFilters(trophy)) continue;
    shown += 1;
    const done = state.earned.has(trophy.name);
    const li = document.createElement("li");
    li.className = "trophy" + (done ? " earned" : "") + (state.selected === trophy.name ? " selected" : "");

    const check = document.createElement("input");
    check.type = "checkbox";
    check.className = "tcheck";
    check.checked = done;
    check.setAttribute("aria-label", "Mark " + displayName(trophy) + " as earned");
    check.addEventListener("click", (event) => event.stopPropagation());
    check.addEventListener("change", () => {
      if (check.checked) state.earned.add(trophy.name);
      else state.earned.delete(trophy.name);
      saveProgress();
      renderAll();
      if (state.selected === trophy.name) renderDetail(trophy);
    });

    const medal = document.createElement("div");
    medal.className = "medal " + trophy.grade;
    medal.textContent = medalLetter(trophy.grade);
    medal.title = trophy.grade;

    const body = document.createElement("div");
    body.className = "tbody";
    const name = document.createElement("div");
    name.className = "tname";
    name.textContent = displayName(trophy);
    const desc = document.createElement("div");
    desc.className = "tdesc";
    desc.textContent = displayDesc(trophy);
    const meta = document.createElement("div");
    meta.className = "tmeta";
    const kindBadge = document.createElement("span");
    kindBadge.className = "badge";
    kindBadge.textContent = KIND_LABELS[trophy.kind] || trophy.kind;
    meta.appendChild(kindBadge);
    if (typeof trophy.count === "number") {
      const c = document.createElement("span");
      c.className = "badge";
      c.textContent = "Target: " + trophy.count.toLocaleString("en-US");
      meta.appendChild(c);
    }
    if (trophy.hidden) {
      const h = document.createElement("span");
      h.className = "badge hidden-badge";
      h.textContent = "Hidden on PSN";
      meta.appendChild(h);
    }
    if (trophy.missable) {
      const m = document.createElement("span");
      m.className = "badge missable";
      m.textContent = "Possibly missable";
      meta.appendChild(m);
    }
    if (done) {
      const d = document.createElement("span");
      d.className = "badge done";
      d.textContent = "Earned";
      meta.appendChild(d);
    }
    body.append(name, desc, meta);
    li.append(check, medal, body);
    li.addEventListener("click", () => {
      state.selected = trophy.name;
      renderList();
      renderDetail(trophy);
    });
    list.appendChild(li);
  }
  document.getElementById("resultCount").textContent =
    "Showing " + shown + " of " + state.trophies.length + " trophies";
}

function renderDetail(trophy) {
  const pane = document.getElementById("detailPane");
  pane.innerHTML = "";
  const shielded = isShielded(trophy);
  const title = document.createElement("h2");
  title.textContent = displayName(trophy);
  const grade = document.createElement("span");
  grade.className = "d-grade " + trophy.grade;
  grade.textContent = trophy.grade + " trophy";
  const desc = document.createElement("p");
  desc.className = "d-desc";
  desc.textContent = "“" + displayDesc(trophy) + "”";

  const facts = document.createElement("div");
  facts.className = "d-facts";
  const factData = [
    ["Kind", KIND_LABELS[trophy.kind] || trophy.kind],
    ["Roadmap stage", "Stage " + trophy.stage],
    ["Hidden on PSN", trophy.hidden ? "Yes — hidden until earned" : "No — visible from the start"],
    ["Missable", trophy.missable ? "Possibly — see warning below" : "No"]
  ];
  if (typeof trophy.count === "number") {
    factData.push(["PSN target", trophy.count.toLocaleString("en-US")]);
  }
  factData.push(["Status", state.earned.has(trophy.name) ? "Earned" : "Not yet earned"]);
  for (const [label, value] of factData) {
    const f = document.createElement("div");
    f.className = "fact";
    const b = document.createElement("b");
    b.textContent = label;
    f.append(b, document.createTextNode(value));
    facts.appendChild(f);
  }

  const guide = document.createElement("p");
  guide.className = "d-guide";
  guide.textContent = shielded
    ? "This trophy is hidden on PlayStation and the spoiler shield is on, so its name, description and guide stay covered until you earn it (tick it in the checklist) or switch the shield off above."
    : trophy.guide;

  pane.append(title, grade, desc);
  if (trophy.missable && !shielded) {
    const warn = document.createElement("div");
    warn.className = "warn-box";
    warn.textContent = "Missable warning: the first meditation (Lucia's, on the balcony at Jason's house in Chapter 1) is reported to disappear after Chapter 1. It is unconfirmed whether this trophy needs it — do it during Chapter 1 to be safe. Sources: PowerPyx and GTABase, via GTA Zone.";
    pane.appendChild(warn);
  }
  pane.append(facts, guide);

  if (!shielded && Array.isArray(trophy.sources) && trophy.sources.length) {
    const box = document.createElement("div");
    box.className = "d-sources";
    const h = document.createElement("h3");
    h.textContent = "Sources for this guide";
    const ul = document.createElement("ul");
    for (const s of trophy.sources) {
      const li = document.createElement("li");
      li.textContent = s;
      ul.appendChild(li);
    }
    const note = document.createElement("li");
    note.textContent = "Official name, description and grade: Exophase and PSNProfiles (linked in Save & Sources). Guide text is this app's own words.";
    ul.appendChild(note);
    box.append(h, ul);
    pane.appendChild(box);
  }
}

function renderRoadmap() {
  const wrap = document.getElementById("roadmapStages");
  wrap.innerHTML = "";
  for (const step of ROADMAP) {
    const inStage = state.trophies.filter((t) => t.stage === step.stage);
    const done = inStage.filter((t) => state.earned.has(t.name)).length;
    const card = document.createElement("article");
    card.className = "stage";
    const head = document.createElement("div");
    head.className = "stage-head";
    const h = document.createElement("h3");
    h.textContent = step.title;
    const time = document.createElement("span");
    time.className = "stage-time";
    time.textContent = step.time;
    head.append(h, time);
    const p = document.createElement("p");
    p.textContent = step.text;
    const ul = document.createElement("ul");
    for (const b of step.bullets) {
      const li = document.createElement("li");
      li.textContent = b;
      ul.appendChild(li);
    }
    const prog = document.createElement("div");
    prog.className = "stage-progress";
    prog.textContent = "Your progress in this stage: " + done + " / " + inStage.length + " trophies earned";
    card.append(head, p, ul, prog);
    wrap.appendChild(card);
  }
}

function renderMissables() {
  const wrap = document.getElementById("missableCards");
  wrap.innerHTML = "";
  const flagged = state.trophies.filter((t) => t.missable);
  for (const t of flagged) {
    const card = document.createElement("article");
    card.className = "miss-card";
    const h = document.createElement("h3");
    h.textContent = t.name + " — possibly missable";
    const p = document.createElement("p");
    p.textContent = t.guide;
    const src = document.createElement("p");
    src.className = "src";
    src.textContent = "Sources: " + t.sources.join("; ") + ". Status in your tracker: " + (state.earned.has(t.name) ? "earned" : "not yet earned") + ".";
    card.append(h, p, src);
    wrap.appendChild(card);
  }
  const watch = document.createElement("article");
  watch.className = "note-card";
  const wh = document.createElement("h3");
  wh.textContent = "Watch-outs that are not missable trophies";
  const wp = document.createElement("p");
  wp.textContent = "Actions Speak Louder: pushing your Criminal Profile to 'Irredeemable' is permanent (PowerPyx, GTABase) — build its count with reversible choices. Stranger strands: one source (TechWiser) warns some chains may have story-linked windows, so start strands when they unlock. Cheats: reported to disable trophies and saving for the session — keep trophy runs cheat-free.";
  watch.append(wh, wp);
  wrap.appendChild(watch);
}

function renderSources() {
  const ul = document.getElementById("sourceList");
  ul.innerHTML = "";
  for (const s of state.sources) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = s.url;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    a.textContent = s.label;
    li.appendChild(a);
    ul.appendChild(li);
  }
}

function renderAll() {
  renderProgress();
  renderList();
  renderRoadmap();
  renderMissables();
}

function setView(view) {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.view === view);
  });
  document.querySelectorAll(".view").forEach((section) => {
    section.classList.toggle("active", section.id === "view-" + view);
  });
}

function wireControls() {
  document.querySelectorAll(".tab").forEach((tab) => {
    tab.addEventListener("click", () => setView(tab.dataset.view));
  });
  document.querySelectorAll("[data-kind]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.kind = chip.dataset.kind;
      document.querySelectorAll("[data-kind]").forEach((c) => c.classList.toggle("active", c === chip));
      renderList();
    });
  });
  document.querySelectorAll("[data-grade]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.grade = chip.dataset.grade;
      document.querySelectorAll("[data-grade]").forEach((c) => c.classList.toggle("active", c === chip));
      renderList();
    });
  });
  document.querySelectorAll("[data-status]").forEach((chip) => {
    chip.addEventListener("click", () => {
      state.status = chip.dataset.status;
      document.querySelectorAll("[data-status]").forEach((c) => c.classList.toggle("active", c === chip));
      renderList();
    });
  });
  document.getElementById("searchInput").addEventListener("input", (event) => {
    state.query = event.target.value.trim().toLowerCase();
    renderList();
  });
  const spoiler = document.getElementById("spoilerToggle");
  spoiler.checked = state.spoilerShield;
  spoiler.addEventListener("change", () => {
    state.spoilerShield = spoiler.checked;
    saveProgress();
    renderList();
    const sel = state.trophies.find((t) => t.name === state.selected);
    if (sel) renderDetail(sel);
  });

  document.getElementById("exportBtn").addEventListener("click", () => {
    const payload = {
      app: "leonida-platinum-tracker",
      version: 1,
      exportedAt: new Date().toISOString(),
      earned: Array.from(state.earned),
      spoilerShield: state.spoilerShield
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "leonida-tracker-progress.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    document.getElementById("saveStatus").textContent = "Exported " + state.earned.size + " earned trophies.";
  });

  document.getElementById("importInput").addEventListener("change", (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;
    file.text().then((text) => {
      try {
        const data = JSON.parse(text);
        const names = new Set(state.trophies.map((t) => t.name));
        const earned = Array.isArray(data.earned) ? data.earned.filter((n) => names.has(n)) : [];
        state.earned = new Set(earned);
        if (typeof data.spoilerShield === "boolean") {
          state.spoilerShield = data.spoilerShield;
          document.getElementById("spoilerToggle").checked = state.spoilerShield;
        }
        saveProgress();
        renderAll();
        document.getElementById("saveStatus").textContent = "Imported progress: " + state.earned.size + " earned trophies.";
      } catch (err) {
        document.getElementById("saveStatus").textContent = "Import failed: that file is not valid tracker JSON.";
      }
    });
  });

  document.getElementById("resetBtn").addEventListener("click", () => {
    state.earned = new Set();
    state.selected = null;
    saveProgress();
    renderAll();
    document.getElementById("detailPane").innerHTML =
      '<p class="detail-empty">Progress reset. Pick a trophy on the left to read its guide here.</p>';
    document.getElementById("saveStatus").textContent = "All progress cleared.";
  });
}

function applyDemoSeed() {
  const params = new URLSearchParams(location.search);
  if (params.get("demo") !== "1") return;
  const seedNames = [
    "Just Like Paradise", "Paradise Lost", "Trust", "Baited My Tackle",
    "Stick Fiddler", "Master of None", "Whip It Good", "Earn Cash, Not Kudos",
    "Top Fun", "Gunslinger", "A Classic Blitz Play", "The Goodtime State",
    "Positive Mental Attitude"
  ];
  for (const n of seedNames) state.earned.add(n);
  const view = params.get("view");
  if (view) setView(view);
  const pick = params.get("pick");
  if (pick) {
    const t = state.trophies.find((x) => x.name === pick);
    if (t) {
      state.selected = t.name;
      renderDetail(t);
    }
  }
  const kind = params.get("kind");
  if (kind) {
    state.kind = kind;
    document.querySelectorAll("[data-kind]").forEach((c) => c.classList.toggle("active", c.dataset.kind === kind));
  }
  if (params.get("spoiler") === "off") {
    state.spoilerShield = false;
    document.getElementById("spoilerToggle").checked = false;
  }
  renderAll();
  const sel = state.trophies.find((t) => t.name === state.selected);
  if (sel) renderDetail(sel);
}

async function boot() {
  loadProgress();
  try {
    const response = await fetch("data/trophies.json");
    const data = await response.json();
    state.trophies = Array.isArray(data) ? data : data.trophies;
    state.sources = Array.isArray(data.sources) ? data.sources : [];
  } catch (err) {
    document.getElementById("trophyList").innerHTML =
      '<li class="trophy"><div class="tbody"><div class="tname">Could not load trophy data</div><div class="tdesc">Serve this folder with a static file server (for example: node serve.ts) so data/trophies.json can load.</div></div></li>';
    return;
  }
  wireControls();
  renderSources();
  renderAll();
  applyDemoSeed();
}

boot();
