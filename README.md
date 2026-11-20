# Leonida Platinum — GTA VI Trophy Guide & Tracker

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Saripudin7/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Saripudin7/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline web app that guides and tracks all 55 PlayStation 5 trophies of Grand Theft Auto VI:
every trophy with its official name, description and grade (1 platinum, 2 gold, 6 silver,
46 bronze), a checklist saved in your browser, filters by kind (story, missable, collectibles,
activities, cleanup), a spoiler shield that hides story trophies until they are earned,
progress counters that mirror the counts PlayStation tracks, a five-stage roadmap to the
platinum, missable flags with notes, and a guide to each trophy written for this app with its
sources cited beside it.

## Run it

Static files, no build step. Serve `app/` with any static server, or use the bundled one:

```
node serve.ts
```

then open http://localhost:8080 in a desktop browser. The app works with the network off:
every file it loads lives under `app/`, and your progress is stored in localStorage only.
Export and import your progress from the "Save / Export" tab.

## Sources and honesty

Trophy names, descriptions, grades and tracked counts are the official list as published by
Exophase and PSNProfiles (the two agree on all 55 entries). Guides are original writing for
this entry, built from those official descriptions; where a description is deliberately vague
(for example "What the hell just happened?"), the guide says so instead of inventing steps.
No Rockstar Games logo, artwork, box art or game screenshots are used — the look is original CSS.

## Hand in

```
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

copies `app/` and `screenshots/` to `out/` and writes `out/dossier.json` with the vendored
make.fun library in `vendor/makefun-frontend.ts`.

Repository: https://github.com/Saripudin7/gta6-trophy-guide-01
License: MIT (see LICENSE).
