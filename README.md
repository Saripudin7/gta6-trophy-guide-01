# Leonida Platinum Tracker — GTA VI Trophy Guide

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/Saripudin7/gta6-trophy-guide-01/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/Saripudin7/gta6-trophy-guide-01/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

An offline guide and tracker for all 55 PlayStation 5 trophies of Grand Theft Auto VI, built for the make.fun bounty **gta6-trophy-guide-01**. Static files only — serve `app/` with any static HTTP server (or run `node serve.ts`) and it works with the network off.

## What's inside

- **Tracker** — every trophy with its official name, description and grade (1 Platinum, 2 Gold, 6 Silver, 46 Bronze; 28 hidden on PlayStation until earned). Tick trophies off; progress is saved in your browser's localStorage and can be exported to a file and imported back.
- **Filters** — by kind (story, missable, collectibles, activities, crime, exploration, completion), by grade, by earned/to-do, plus free-text search.
- **Spoiler shield** — on by default: hidden story trophies show as "Hidden trophy" with their descriptions and guides covered until you earn them or switch the shield off.
- **Platinum roadmap** — five stages from the campaign to the Platinum, built from the official descriptions and the counts PlayStation tracks (250 stunts, 42 shooting-range golds, 100 WAiNK scans…), with your per-stage progress.
- **Missables** — exactly one trophy is reported as possibly missable (Positive Mental Attitude, tied to a Chapter 1 meditation spot). It is flagged in the list, in its guide, and on its own page, with the warning sourced.
- **Cited guides** — a guide for every trophy in our own words, each naming its sources. Steps no source has verified yet are labelled unconfirmed instead of invented.

## Sources

Official names, descriptions and grades come from the two trackers that agree on all 55 entries: [Exophase](https://www.exophase.com/game/grand-theft-auto-vi-psn/trophies/) and [PSNProfiles](https://psnprofiles.com/trophies/43531-grand-theft-auto-vi). Guide facts draw on [Push Square's trophy guide](https://www.pushsquare.com/guides/gta-6-trophy-guide-and-roadmap), [GTA Zone's trophy list](https://gta-zone.com/news/gta-6-trophies-achievements/) (summarising PowerPyx and GTABase) and [EGamers.io's trophy list](https://egamers.io/gta-6-trophy-list-all-55-trophies-and-achievements-plus-the-hardest-ones/) — cited beside each trophy, never copied.

## Run it

```sh
node serve.ts          # serves app/ at http://localhost:8080
```

To build the make.fun entry (copies `app/` + `screenshots/` and writes `dossier.json`):

```sh
mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts
```

## Notes

Unofficial fan-made guide. No Rockstar Games logo, artwork or screenshots — the look is its own. The app makes no network requests; source links open only when you follow them.

License: MIT (see `LICENSE`).
