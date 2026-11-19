# HSE building facade – IOOC Bushehr District

Three facade concepts for the HSE building (اداره ایمنی، بهداشت و محیط زیست – شرکت نفت فلات قاره ایران، ناحیه بوشهر).
Each one has a vehicle gate and a separate staff entrance.

**Open `index.html`** in any modern browser. It is a single self-contained file (works offline, can be sent as is).

| | Concept | Idea |
|---|---|---|
| A | Brick & Travertine | Cream travertine (or porcelain slab) field framed by dark-brown brick piers and rake bands, bronze portal and trims, granite plinth, halo-lit lettering |
| B | Response Centre | White A2 panels in an anthracite frame, safety-red gate portal, full-vision door, finned curtain wall, red LED reveal |
| C | Gable Frame | Anthracite folded frame tracing the gable, timber-batten gable with logo disc, dark name band, warm-white panels, rooftop PV |

All designs share the HSE site layout: a 2 m staff hallway (vestibule) projecting into the pavement, driveway and footpath separated by a raised planter (no steel bollards), keep-clear box, height sign, 10 km/h internal-site limit, stop line, assembly point in the yard, windsock, LTI board, hydrant.

Each design also has its own small forecourt garden; the pieces can be mixed between options. Use the **Garden** view to compare them. The asphalt in front of the car gate stays, and only the staff walkway (about 3.8 × 8 m) gets new paving:

| Design | Walkway | Divider planter | Pocket garden |
|---|---|---|---|
| A | Cream travertine-look slabs, brick borders | Brick with travertine coping, hedge, small olives | Raised Persian garden: lawn, water rill, olives, bougainvillea, seat |
| B | Grey slabs, photoluminescent green egress line | Anthracite steel, gravel, grasses, conocarpus | Gravel xeriscape: date palms, boulders, benches under a shade sail |
| C | Exposed-aggregate concrete | Timber-clad, grasses, flowering shrub, olives | Lawn and timber deck under a bougainvillea pergola, benches, olive |

## Controls
Drag = rotate · right-drag / shift-drag = pan · wheel / pinch = zoom · keys `1-3` design, `N` night, `G` open gates.
URL options: `?design=b&night=1&view=left&gate=1&spin=1&ui=0`.

## Rebuild
Source: `src/app.html` + `src/js/*.js`. `python3 tools/build.py` inlines three.js r149, the Vazirmatn font and the photos into `index.html` (vendor files are downloaded to `tools/.cache/`).
`bash tools/render.sh` writes preview PNGs to `renders/` (headless Chrome).

## Caveats
Concept massing only, not to scale from drawings. The NIOC logo is a hand-drawn approximation – use the official vector for production.
