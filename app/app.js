// Leonida Platinum — offline GTA VI trophy guide & tracker.
// All state lives in localStorage; the only fetch is this app's own data/trophies.json.
const STORE_KEY = 'leonida-platinum-v1';
const GRADE_ORDER = ['platinum', 'gold', 'silver', 'bronze'];
const KIND_LABELS = {
  story: 'Story',
  collectibles: 'Collectibles',
  activities: 'Activities',
  cleanup: 'Cleanup & grind',
  platinum: 'Platinum',
};

const state = loadState();
let trophies = [];
let selectedName = null;
let activeKind = 'all';

function loadState() {
  try {
    const raw = JSON.parse(localStorage.getItem(STORE_KEY) ?? '{}');
    return {
      earned: new Set(raw.earned ?? []),
      counters: raw.counters ?? {},
      notes: raw.notes ?? {},
    };
  } catch {
    return { earned: new Set(), counters: {}, notes: {} };
  }
}

function saveState() {
  localStorage.setItem(STORE_KEY, JSON.stringify({
    earned: [...state.earned],
    counters: state.counters,
    notes: state.notes,
  }));
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function isSpoilerHidden(trophy) {
  const shield = document.getElementById('spoiler').checked;
  return shield && trophy.kind === 'story' && !state.earned.has(trophy.name);
}

function displayName(trophy) {
  return isSpoilerHidden(trophy) ? 'Hidden story trophy' : trophy.name;
}

function displayDescription(trophy) {
  return isSpoilerHidden(trophy)
    ? 'Description hidden by the spoiler shield — earn it or turn the shield off to reveal.'
    : trophy.description;
}

function matchesFilters(trophy) {
  const query = document.getElementById('search').value.trim().toLowerCase();
  const grade = document.getElementById('grade').value;
  const hideDone = document.getElementById('hide-done').checked;
  if (activeKind === 'missable' && !trophy.missable) return false;
  if (activeKind !== 'all' && activeKind !== 'missable' && trophy.kind !== activeKind) return false;
  if (grade !== 'all' && trophy.grade !== grade) return false;
  if (hideDone && state.earned.has(trophy.name)) return false;
  if (!query) return true;
  const haystack = `${trophy.name} ${trophy.description} ${trophy.guide}`.toLowerCase();
  return haystack.includes(query);
}

function counterProgress(trophy) {
  if (!trophy.target) return null;
  const done = Math.min(state.counters[trophy.name] ?? 0, trophy.target);
  return { done, target: trophy.target, pct: Math.round((done / trophy.target) * 100) };
}

function renderScoreboard() {
  document.getElementById('earned-count').textContent = String(state.earned.size);
  document.getElementById('progress-fill').style.width = `${(state.earned.size / trophies.length) * 100}%`;
  const medals = document.getElementById('medal-counts');
  medals.replaceChildren();
  for (const grade of GRADE_ORDER) {
    const total = trophies.filter((t) => t.grade === grade).length;
    const got = trophies.filter((t) => t.grade === grade && state.earned.has(t.name)).length;
    const pill = el('span', `medal-pill ${grade}`);
    pill.append(el('b', null, `${got}/${total}`), document.createTextNode(` ${grade}`));
    medals.append(pill);
  }
  const next = trophies.find((t) => !state.earned.has(t.name) && t.kind !== 'platinum');
  const nextUp = document.getElementById('next-up');
  nextUp.replaceChildren();
  if (state.earned.size === trophies.length) {
    nextUp.append(el('strong', null, 'Platinum earned — Leonida Legend.'));
  } else if (next) {
    nextUp.append(document.createTextNode('Next up: '), el('strong', null, displayName(next)));
    nextUp.append(document.createTextNode(` (Stage ${next.stage} · ${KIND_LABELS[next.kind] ?? next.kind})`));
  }
}

function renderList() {
  const list = document.getElementById('trophy-list');
  list.replaceChildren();
  const visible = trophies.filter(matchesFilters);
  document.getElementById('list-meta').textContent =
    `Showing ${visible.length} of ${trophies.length} trophies · ${state.earned.size} earned`;
  for (const trophy of visible) {
    const row = el('div', 'trophy-row' + (state.earned.has(trophy.name) ? ' earned' : '') + (selectedName === trophy.name ? ' selected' : ''));
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(trophy.name);
    box.setAttribute('aria-label', `Mark ${trophy.name} as earned`);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) state.earned.add(trophy.name);
      else state.earned.delete(trophy.name);
      if (box.checked && trophy.target) state.counters[trophy.name] = trophy.target;
      saveState();
      renderAll();
    });
    const dot = el('span', `grade-dot ${trophy.grade}`);
    dot.title = trophy.grade;
    const main = el('div');
    main.append(el('div', 'trophy-name' + (isSpoilerHidden(trophy) ? ' hidden-name' : ''), displayName(trophy)));
    main.append(el('div', 'trophy-desc', displayDescription(trophy)));
    const tags = el('div', 'trophy-tags');
    tags.append(el('span', 'tag', trophy.grade));
    tags.append(el('span', 'tag kind', KIND_LABELS[trophy.kind] ?? trophy.kind));
    tags.append(el('span', 'tag', `Stage ${trophy.stage}`));
    if (trophy.hidden) tags.append(el('span', 'tag', 'hidden on PSN'));
    if (trophy.missable) tags.append(el('span', 'tag missable', 'MISSABLE'));
    main.append(tags);
    const progress = el('div', 'row-progress');
    const counter = counterProgress(trophy);
    if (counter) {
      progress.append(el('div', null, `${counter.done} / ${counter.target}`));
      const bar = el('div', 'bar');
      const fill = document.createElement('i');
      fill.style.width = `${counter.pct}%`;
      bar.append(fill);
      progress.append(bar);
    } else if (state.earned.has(trophy.name)) {
      progress.append(el('div', null, 'Earned ✓'));
    }
    row.append(box, dot, main, progress);
    row.addEventListener('click', () => {
      selectedName = trophy.name;
      renderList();
      renderDetail();
    });
    list.append(row);
  }
  if (visible.length === 0) {
    list.append(el('p', 'detail-hint', 'No trophies match these filters. Try clearing the search or picking “All 55”.'));
  }
}

function renderDetail() {
  const pane = document.getElementById('detail-pane');
  const trophy = trophies.find((t) => t.name === selectedName);
  if (!trophy) return;
  pane.replaceChildren();
  pane.append(el('h2', null, displayName(trophy)));
  pane.append(el('p', 'official', `“${displayDescription(trophy)}” — ${trophy.grade}`));
  const tags = el('div', 'trophy-tags');
  tags.append(el('span', 'tag kind', KIND_LABELS[trophy.kind] ?? trophy.kind));
  tags.append(el('span', 'tag', `Roadmap stage ${trophy.stage}`));
  if (trophy.missable) tags.append(el('span', 'tag missable', 'MISSABLE — see note below'));
  pane.append(tags);
  pane.append(el('h3', null, 'Guide'));
  pane.append(el('p', null, trophy.guide));
  if (Array.isArray(trophy.steps) && trophy.steps.length > 0) {
    pane.append(el('h3', null, 'Steps'));
    const list = document.createElement('ul');
    for (const step of trophy.steps) list.append(el('li', null, step));
    pane.append(list);
  }
  if (trophy.missableNote) {
    pane.append(el('h3', null, 'When it can be missed'));
    pane.append(el('p', 'missable-note', trophy.missableNote));
  }
  if (trophy.target) {
    pane.append(el('h3', null, 'Progress counter'));
    const box = el('div', 'counter-box');
    const minus = el('button', null, '−');
    minus.type = 'button';
    const input = document.createElement('input');
    input.type = 'number';
    input.min = '0';
    input.max = String(trophy.target);
    input.value = String(state.counters[trophy.name] ?? 0);
    const plus = el('button', null, '+');
    plus.type = 'button';
    const setCounter = (value) => {
      const clamped = Math.max(0, Math.min(trophy.target, Number.isFinite(value) ? value : 0));
      state.counters[trophy.name] = clamped;
      if (clamped >= trophy.target) state.earned.add(trophy.name);
      saveState();
      renderAll();
    };
    minus.addEventListener('click', () => setCounter((state.counters[trophy.name] ?? 0) - 1));
    plus.addEventListener('click', () => setCounter((state.counters[trophy.name] ?? 0) + 1));
    input.addEventListener('change', () => setCounter(Number(input.value)));
    box.append(minus, input, el('span', null, `of ${trophy.target}`), plus);
    pane.append(box);
  }
  pane.append(el('h3', null, 'Sources'));
  const sources = el('p', 'sources');
  sources.append(document.createTextNode(trophy.sources));
  pane.append(sources);
}

function renderAll() {
  renderScoreboard();
  renderList();
  renderDetail();
  renderRoadmap();
  renderMissables();
}

const ROADMAP = [
  {
    stage: 1,
    title: 'Stage 1 — Play the story, keep a rotating save',
    summary:
      'Work through the chapters in order: Gone Fishing opens the game, then Chapters 1–4 and the named missions (Breakfast Run, The Cartel Heist, Child\u2019s Play, Headliners, VCIA Takedown, Operation Savage Glory) up to the final mission. Story trophies cannot be missed by playing normally, but choices feed \u201cActions Speak Louder\u201d, so keep a manual save before big branches and never overwrite your only slot.',
    tips: [
      'Turn the spoiler shield on if you want story names hidden until they pop.',
      'Pick up meditation spots, WAiNK locations and card packs you walk past — it halves Stage 3.',
      'Note every stranger you meet; their strands are Stage 2 and some close late.',
    ],
  },
  {
    stage: 2,
    title: 'Stage 2 — Strangers, partners and choices',
    summary:
      'Finish the 8 stranger strands across Leonida, including the final missions for Andy, Kenton, Billy, Randy and Tyrone, plus Bret\u2019s unique-animal hunt. Do the partner trophies (Hot Together, Retail Therapy) while your partner is still available, and settle choice-based trophies here while your Stage 1 saves are fresh.',
    tips: [
      'Stranger strands are the classic platinum killers — clear them before the final mission if you can.',
      'Partner trophies need your partner present and a wanted level you control; plan the escape route first.',
      'If a strand disappears, reload the rotating save rather than restarting the game.',
    ],
  },
  {
    stage: 3,
    title: 'Stage 3 — Collectibles and full exploration',
    summary:
      'Sweep the map: meditate at all 18 spots, WAiNK It at 100 locations, complete 3 collectible card sets, and explore all 52 areas of Leonida. Work region by region and tick the counters here as you go — the tracker mirrors the counts PlayStation tracks, so a mismatch means a spot was missed, not lost.',
    tips: [
      'Use the Collectibles filter and sort your route by area, not by trophy.',
      'Cards and WAiNK spots cluster in towns; meditation spots sit at viewpoints and quiet places.',
      'Exploration unlocks naturally while hunting collectibles — check \u201cThe Goodtime State\u201d last.',
    ],
  },
  {
    stage: 4,
    title: 'Stage 4 — Activities, races and skill trophies',
    summary:
      'Gold all 42 Shooting Range challenges, win a Top Fun drone race at all 14 locations, win 20 different races, try each of the 9 activity types once, finish an arcade game, beat Cal at fishing, and clear the bowling, combat and stunt feats (250 stunts). These are repeatable, so grind them with fresh hands and short sessions.',
    tips: [
      'Shooting Range golds are the hardest skill gate — learn one challenge at a time and use the counter.',
      'Races count distinct wins, so rotate tracks instead of farming one.',
      'Stunts tick up during normal driving; check the counter before dedicated stunt sessions.',
    ],
  },
  {
    stage: 5,
    title: 'Stage 5 — Cleanup: money, property and 100%',
    summary:
      'Close out the economy and completion trophies: rob 5 bank vaults and escape, rob an armored truck, hit one illegal operation of each of the 9 gangs, launder $250,000 of marked bills, spend $100,000 across shops, buy all 8 garage properties, register 10 vehicles in the Scooter Bros app, discover 100 vehicles and finish 50 challenges. \u201cA Long Road\u201d (100% completion, gold) should be the last bronze-and-silver mop-up, leaving only the platinum.',
    tips: [
      'Keep one save before big spending so a wrong purchase is reversible.',
      'Vault and gang robberies pair well with partner escape routes from Stage 2.',
      'If 100% stalls, re-check stranger strands and collectible counters first — they feed completion.',
    ],
  },
];

function renderRoadmap() {
  const host = document.getElementById('roadmap-stages');
  host.replaceChildren();
  for (const stage of ROADMAP) {
    const card = el('article', 'stage-card');
    const stageTrophies = trophies.filter((t) => t.stage === stage.stage);
    const done = stageTrophies.filter((t) => state.earned.has(t.name)).length;
    card.append(el('h3', null, stage.title));
    card.append(el('div', 'stage-meta', `${done} of ${stageTrophies.length} trophies in this stage earned`));
    card.append(el('p', null, stage.summary));
    const tips = document.createElement('ul');
    for (const tip of stage.tips) tips.append(el('li', null, tip));
    card.append(tips);
    const chips = el('div', 'stage-trophies');
    for (const trophy of stageTrophies) {
      const button = el('button', state.earned.has(trophy.name) ? 'done' : null, displayName(trophy));
      button.type = 'button';
      button.addEventListener('click', () => {
        selectedName = trophy.name;
        switchView('tracker');
        renderAll();
      });
      chips.append(button);
    }
    card.append(chips);
    host.append(card);
  }
}

function renderMissables() {
  const host = document.getElementById('missable-list');
  host.replaceChildren();
  const flagged = trophies.filter((t) => t.missable);
  host.append(el('p', 'list-meta', `${flagged.length} trophies flagged missable from their official descriptions`));
  for (const trophy of flagged) {
    const row = el('div', 'trophy-row' + (state.earned.has(trophy.name) ? ' earned' : ''));
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = state.earned.has(trophy.name);
    box.addEventListener('click', (event) => event.stopPropagation());
    box.addEventListener('change', () => {
      if (box.checked) state.earned.add(trophy.name);
      else state.earned.delete(trophy.name);
      saveState();
      renderAll();
    });
    const dot = el('span', `grade-dot ${trophy.grade}`);
    const main = el('div');
    main.append(el('div', 'trophy-name', displayName(trophy)));
    main.append(el('div', 'trophy-desc', displayDescription(trophy)));
    if (trophy.missableNote) main.append(el('p', 'missable-note', trophy.missableNote));
    row.append(box, dot, main, el('div', 'row-progress', state.earned.has(trophy.name) ? 'Earned ✓' : 'At risk'));
    row.addEventListener('click', () => {
      selectedName = trophy.name;
      switchView('tracker');
      renderAll();
    });
    host.append(row);
  }
}

function switchView(name) {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.classList.toggle('active', tab.dataset.view === name);
  }
  for (const view of document.querySelectorAll('.view')) {
    view.classList.toggle('active', view.id === `view-${name}`);
  }
}

function wireControls() {
  for (const tab of document.querySelectorAll('.tab')) {
    tab.addEventListener('click', () => switchView(tab.dataset.view));
  }
  for (const chip of document.querySelectorAll('.chip')) {
    chip.addEventListener('click', () => {
      activeKind = chip.dataset.kind;
      for (const other of document.querySelectorAll('.chip')) other.classList.toggle('active', other === chip);
      renderList();
    });
  }
  document.getElementById('search').addEventListener('input', renderList);
  document.getElementById('grade').addEventListener('change', renderList);
  document.getElementById('spoiler').addEventListener('change', renderAll);
  document.getElementById('hide-done').addEventListener('change', renderList);

  document.getElementById('export').addEventListener('click', () => {
    const payload = {
      app: 'leonida-platinum',
      version: 1,
      earned: [...state.earned],
      counters: state.counters,
      notes: state.notes,
    };
    const link = document.createElement('a');
    link.href = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
    link.download = 'leonida-platinum-progress.json';
    link.click();
    URL.revokeObjectURL(link.href);
    document.getElementById('save-status').textContent = 'Progress exported. Keep the file somewhere safe.';
  });

  document.getElementById('import').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      const earned = Array.isArray(data) ? data : data.earned;
      if (!Array.isArray(earned)) throw new Error('no earned list');
      const known = new Set(trophies.map((t) => t.name));
      state.earned = new Set(earned.filter((name) => known.has(name)));
      state.counters = typeof data.counters === 'object' && data.counters ? data.counters : {};
      state.notes = typeof data.notes === 'object' && data.notes ? data.notes : {};
      saveState();
      renderAll();
      document.getElementById('save-status').textContent = `Imported ${state.earned.size} earned trophies.`;
    } catch {
      document.getElementById('save-status').textContent = 'That file could not be read as progress. Nothing was changed.';
    }
    event.target.value = '';
  });

  document.getElementById('reset').addEventListener('click', () => {
    if (!window.confirm('Reset all ticks, counters and notes in this browser?')) return;
    state.earned = new Set();
    state.counters = {};
    state.notes = {};
    saveState();
    renderAll();
    document.getElementById('save-status').textContent = 'Progress reset. Fresh start — good hunting.';
  });
}

async function boot() {
  const doc = await (await fetch('data/trophies.json')).json();
  trophies = doc.trophies;
  selectedName = trophies.find((t) => t.grade === 'silver')?.name ?? trophies[0]?.name ?? null;
  wireControls();
  renderAll();
}

boot();
