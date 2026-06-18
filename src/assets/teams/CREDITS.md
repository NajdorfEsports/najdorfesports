# Opponent team logos

Logos in this folder are sourced from Liquipedia
(https://liquipedia.net/overwatch), text licensed CC BY-SA 3.0. Each logo is the
trademark of its respective team and is used here unaltered, solely to identify
the opponent in the "Next Match" card. Originals are downloaded at full
resolution from Liquipedia's lpcommons (the team's `*_allmode.png`, which is
designed to read on any background) and committed unmodified; astro:assets only
re-encodes them for delivery, it does not alter the artwork.

Naming: kebab-case team name (`meng-gong-3.png`). Wire each into
`src/data/teams.json` (display name -> slug); `src/lib/assetImages.ts` joins the
slug to the file. A team with no logo here falls back to the dashed "OPP LOGO"
placeholder slot, so the card never breaks on a missing mark.

| File            | Team        | Source                                                     |
| --------------- | ----------- | ---------------------------------------------------------- |
| meng-gong-3.png | MENG GONG 3 | liquipedia.net/commons/images/e/e1/MENG_GONG_3_allmode.png |
